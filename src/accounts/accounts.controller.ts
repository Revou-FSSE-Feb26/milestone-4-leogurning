import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all accounts',
    description: 'Get all accounts across all users. Admin only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Accounts retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Admin role required.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please try again later.',
  })
  async getAllAccounts() {
    return await this.accountsService.getAllAccounts();
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get accounts by user ID',
    description: 'Get all accounts belonging to a specific user.',
  })
  @ApiResponse({
    status: 200,
    description: 'User accounts retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing token.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please try again later.',
  })
  async getAccountsByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return await this.accountsService.getAccountsByUserId(userId);
  }

  @Get(':id/transactions')
  @ApiOperation({
    summary: 'Get account with transactions',
    description:
      'Get account details along with all its transactions, each nested with category data.',
  })
  @ApiResponse({
    status: 200,
    description: 'Account with transactions retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing token.',
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please try again later.',
  })
  async getAccountWithTransactions(@Param('id', ParseIntPipe) id: number) {
    return await this.accountsService.getAccountWithTransactions(id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get account by ID',
    description: 'Get details of a specific account by its ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Account retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing token.',
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please try again later.',
  })
  async getAccountById(@Param('id', ParseIntPipe) id: number) {
    return await this.accountsService.getAccountById(id);
  }

  @Post('user/:userId')
  @ApiOperation({
    summary: 'Create a new account',
    description: 'Create a new account for a specific user.',
  })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing token.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict. Account with this name already exists for the user.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please try again later.',
  })
  async createAccount(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return await this.accountsService.createAccount(userId, createAccountDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an account',
    description: 'Update an existing account.',
  })
  @ApiResponse({
    status: 200,
    description: 'Account updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing token.',
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict. Account with this name already exists for the user.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please try again later.',
  })
  async updateAccount(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return await this.accountsService.updateAccount(id, updateAccountDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an account',
    description: 'Delete an existing account.',
  })
  @ApiResponse({
    status: 200,
    description: 'Account deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing token.',
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please try again later.',
  })
  async deleteAccount(@Param('id', ParseIntPipe) id: number) {
    return await this.accountsService.deleteAccount(id);
  }
}
