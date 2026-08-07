import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TransactionsRepository } from './transactions.repository';
import { AccountsRepository } from 'src/accounts/accounts.repository';
import { CategoriesRepository } from 'src/categories/categories.repository';
import {
  CreateTransactionDto,
  TransactionType,
} from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly accountsRepository: AccountsRepository,
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  // Returns +amount for income, -amount for expense/transfer
  private balanceDelta(type: TransactionType, amount: number): number {
    return type === TransactionType.INCOME ? amount : -amount;
  }

  private toNumber(value: { toString(): string } | number): number {
    return typeof value === 'number' ? value : Number(value.toString());
  }

  async getAllTransactions() {
    return await this.transactionsRepository.getAllTransactions();
  }

  async getTransactions(userId: number) {
    return await this.transactionsRepository.getTransactions(userId);
  }

  async getTransactionsByAccountId(userId: number, accountId: number) {
    const account = await this.accountsRepository.getAccountById(
      userId,
      accountId,
    );
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return await this.transactionsRepository.getTransactionsByAccountId(
      accountId,
    );
  }

  async getTransactionById(userId: number, id: number) {
    const transaction = await this.transactionsRepository.getTransactionById(
      userId,
      id,
    );
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async createTransaction(userId: number, data: CreateTransactionDto) {
    // Validate account exists
    const account = await this.accountsRepository.getAccountById(
      userId,
      data.accountId,
    );
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Validate category exists
    const category = await this.categoriesRepository.getCategoryById(
      data.categoryId,
    );
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check sufficient balance for expense / transfer
    if (
      data.type === TransactionType.EXPENSE ||
      data.type === TransactionType.TRANSFER
    ) {
      const currentBalance = this.toNumber(account.balance);
      if (data.amount > currentBalance) {
        throw new BadRequestException(
          `Insufficient balance. Current balance is ${currentBalance}, but transaction amount is ${data.amount}`,
        );
      }
    }

    const delta = this.balanceDelta(data.type, data.amount);

    // Repository executes both writes in a single prisma.$transaction — either
    // both succeed or both roll back.
    return await this.transactionsRepository.createTransaction(data, delta);
  }

  async updateTransaction(
    userId: number,
    id: number,
    data: UpdateTransactionDto,
  ) {
    const existing = await this.transactionsRepository.getTransactionById(
      userId,
      id,
    );
    if (!existing) {
      throw new NotFoundException('Transaction not found');
    }

    // Validate incoming account if it is being changed
    if (
      data.accountId !== undefined &&
      data.accountId !== existing.account.id
    ) {
      const newAccount = await this.accountsRepository.findAccountById(
        data.accountId,
      );
      if (!newAccount) {
        throw new NotFoundException('Account not found');
      }
    }

    // Validate incoming category if it is being changed
    if (data.categoryId !== undefined) {
      const category = await this.categoriesRepository.getCategoryById(
        data.categoryId,
      );
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    // Resolve old values
    const oldAccountId = existing.account.id;
    const oldType = existing.type as TransactionType;
    const oldAmount = this.toNumber(existing.amount);
    const oldDelta = this.balanceDelta(oldType, oldAmount);

    // Resolve new values, falling back to existing when not provided
    const newAccountId = data.accountId ?? oldAccountId;
    const newType = (data.type as TransactionType) ?? oldType;
    const newAmount = data.amount ?? oldAmount;
    const newDelta = this.balanceDelta(newType, newAmount);

    // Validate sufficient balance for the resulting state
    if (
      newType === TransactionType.EXPENSE ||
      newType === TransactionType.TRANSFER
    ) {
      const targetAccount =
        await this.accountsRepository.findAccountById(newAccountId);
      if (!targetAccount) {
        throw new NotFoundException('Account not found');
      }
      // When the account is the same, the old delta will be reversed first inside
      // the prisma.$transaction, so we factor that reversal into the check.
      const balanceAfterReversal =
        this.toNumber(targetAccount.balance) +
        (oldAccountId === newAccountId ? -oldDelta : 0);

      if (newAmount > balanceAfterReversal) {
        throw new BadRequestException(
          `Insufficient balance. Available balance after reversal is ${balanceAfterReversal}, but transaction amount is ${newAmount}`,
        );
      }
    }

    // Repository executes all three writes in a single prisma.$transaction —
    // reverse old balance, apply new balance, persist transaction update.
    return await this.transactionsRepository.updateTransaction(
      id,
      data,
      oldAccountId,
      -oldDelta, // reversal: flip the sign to undo old effect
      newAccountId,
      newDelta,
    );
  }

  async deleteTransaction(userId: number, id: number) {
    const existing = await this.transactionsRepository.getTransactionById(
      userId,
      id,
    );
    if (!existing) {
      throw new NotFoundException('Transaction not found');
    }

    const type = existing.type as TransactionType;
    const amount = this.toNumber(existing.amount);
    // Flip the sign to reverse the original balance effect
    const balanceDeltaReversal = -this.balanceDelta(type, amount);

    // Repository executes balance reversal and delete in a single prisma.$transaction.
    const deleted = await this.transactionsRepository.deleteTransaction(
      id,
      existing.account.id,
      balanceDeltaReversal,
    );
    if (deleted) {
      return {
        message: 'Transaction deleted successfully',
        status: 203,
        id: id.toString(),
      };
    }
    throw new BadRequestException('Failed to delete transaction');
  }
}
