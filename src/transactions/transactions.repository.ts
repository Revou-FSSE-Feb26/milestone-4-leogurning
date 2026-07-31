import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

const transactionSelect = {
  id: true,
  type: true,
  amount: true,
  description: true,
  transactionDate: true,
  createdAt: true,
  account: {
    select: { id: true, name: true, type: true },
  },
  category: {
    select: { id: true, name: true, type: true },
  },
};

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllTransactions() {
    return await this.prisma.transaction.findMany({
      select: transactionSelect,
      orderBy: { transactionDate: 'desc' },
    });
  }

  async getTransactionsByAccountId(accountId: number) {
    return await this.prisma.transaction.findMany({
      where: { accountId },
      select: transactionSelect,
      orderBy: { transactionDate: 'desc' },
    });
  }

  async getTransactionById(id: number) {
    return await this.prisma.transaction.findUnique({
      where: { id },
      select: transactionSelect,
    });
  }

  /**
   * Atomically creates the transaction record and adjusts the account balance.
   * If either operation fails both are rolled back.
   */
  async createTransaction(data: CreateTransactionDto, balanceDelta: number) {
    const [transaction] = await this.prisma.$transaction([
      this.prisma.transaction.create({
        data: {
          accountId: data.accountId,
          categoryId: data.categoryId,
          type: data.type,
          amount: data.amount,
          description: data.description,
          transactionDate: new Date(data.transactionDate),
        },
        select: transactionSelect,
      }),
      this.prisma.account.update({
        where: { id: data.accountId },
        data: { balance: { increment: balanceDelta } },
      }),
    ]);

    return transaction;
  }

  /**
   * Atomically reverses the old balance effect, applies the new balance effect,
   * and updates the transaction record.
   * All three operations are rolled back if any one of them fails.
   *
   * @param oldAccountId  Account that held the original transaction
   * @param oldDeltaReversal  Value to add back to the old account (negated old delta)
   * @param newAccountId  Account that will hold the updated transaction
   * @param newDelta  Value to add to the new account (new delta)
   */
  async updateTransaction(
    id: number,
    data: UpdateTransactionDto,
    oldAccountId: number,
    oldDeltaReversal: number,
    newAccountId: number,
    newDelta: number,
  ) {
    const [, , transaction] = await this.prisma.$transaction([
      // 1. Reverse old balance effect on original account
      this.prisma.account.update({
        where: { id: oldAccountId },
        data: { balance: { increment: oldDeltaReversal } },
      }),
      // 2. Apply new balance effect on new account (may be same account)
      this.prisma.account.update({
        where: { id: newAccountId },
        data: { balance: { increment: newDelta } },
      }),
      // 3. Persist the transaction changes
      this.prisma.transaction.update({
        where: { id },
        data: {
          ...(data.accountId !== undefined && { accountId: data.accountId }),
          ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
          ...(data.type !== undefined && { type: data.type }),
          ...(data.amount !== undefined && { amount: data.amount }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.transactionDate !== undefined && {
            transactionDate: new Date(data.transactionDate),
          }),
        },
        select: transactionSelect,
      }),
    ]);

    return transaction;
  }

  /**
   * Atomically reverses the account balance and deletes the transaction record.
   * Both operations are rolled back if either fails.
   *
   * @param accountId  Account whose balance needs to be reversed
   * @param balanceDeltaReversal  Value to add back (negated original delta)
   */
  async deleteTransaction(
    id: number,
    accountId: number,
    balanceDeltaReversal: number,
  ) {
    const [, deleted] = await this.prisma.$transaction([
      // 1. Reverse the balance effect
      this.prisma.account.update({
        where: { id: accountId },
        data: { balance: { increment: balanceDeltaReversal } },
      }),
      // 2. Delete the transaction
      this.prisma.transaction.delete({
        where: { id },
      }),
    ]);

    return deleted;
  }
}
