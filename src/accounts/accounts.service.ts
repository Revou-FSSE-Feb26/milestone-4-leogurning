import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountsRepository } from './accounts.repository';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class AccountsService {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async getAllAccounts() {
    return await this.accountsRepository.getAllAccounts();
  }

  async getAccountsByUserId(userId: number) {
    return await this.accountsRepository.getAccountsByUserId(userId);
  }

  async getAccountById(id: number) {
    const account = await this.accountsRepository.getAccountById(id);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async getAccountWithTransactions(id: number) {
    const account =
      await this.accountsRepository.getAccountWithTransactions(id);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async createAccount(userId: number, data: CreateAccountDto) {
    const user = await this.usersRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.accountsRepository.createAccount(userId, data);
  }

  async updateAccount(id: number, data: UpdateAccountDto) {
    const account = await this.accountsRepository.getAccountById(id);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return await this.accountsRepository.updateAccount(id, data);
  }

  async deleteAccount(id: number) {
    const account = await this.accountsRepository.getAccountById(id);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const deleted = await this.accountsRepository.deleteAccount(id);
    if (deleted) {
      return {
        message: 'Account deleted successfully',
        status: 203,
        id: id.toString(),
      };
    }
    throw new Error('Error deleting account');
  }
}
