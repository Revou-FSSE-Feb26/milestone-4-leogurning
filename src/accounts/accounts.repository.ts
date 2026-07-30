import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllAccounts() {
    return await this.prisma.account.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async getAccountsByUserId(userId: number) {
    return await this.prisma.account.findMany({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async getAccountById(id: number) {
    return await this.prisma.account.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async createAccount(userId: number, data: CreateAccountDto) {
    return await this.prisma.account.create({
      data: {
        ...data,
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async updateAccount(id: number, data: UpdateAccountDto) {
    return await this.prisma.account.update({
      where: { id },
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async deleteAccount(id: number) {
    const deleted = await this.prisma.account.delete({
      where: { id },
    });
    return deleted;
    // if (deleted) {
    //   return {
    //     message: 'Account deleted successfully',
    //     status: 203,
    //     id: id.toString(),
    //   };
    // }
    // throw new Error('Error deleting account');
  }
}
