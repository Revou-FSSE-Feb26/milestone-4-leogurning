import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';
import { CurrentUser } from 'src/common/decorators/get-user.decorator';

@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('all')
  @Roles(UserRole.admin)
  @ApiOperation({
    summary: 'List all transactions. Admin only.',
    description: 'Get all transactions across all accounts. Admin only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing token.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin role required.' })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please try again later.',
  })
  async getAllTransactions() {
    return await this.transactionsService.getAllTransactions();
  }

  @Get()
  @ApiOperation({
    summary: 'List all transactions of the login user.',
    description: 'Get all transactions across all accounts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing token.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please try again later.',
  })
  async getTransactions(@CurrentUser('sub') userId: number) {
    return await this.transactionsService.getTransactions(userId);
  }

  @Get('account/:accountId')
  @ApiOperation({
    summary: 'Get transactions by account ID of the login user',
    description:
      'Get all transactions belonging to a specific account and login user, ordered newest first.',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing token.',
  })
  @ApiResponse({ status: 404, description: 'Account not found.' })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please try again later.',
  })
  async getTransactionsByAccountId(
    @CurrentUser('sub') userId: number,
    @Param('accountId', ParseIntPipe) accountId: number,
  ) {
    return await this.transactionsService.getTransactionsByAccountId(
      userId,
      accountId,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get transaction by ID of the login user',
    description:
      'Get details of a specific transaction by its ID of the login user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing token.',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please try again later.',
  })
  async getTransactionById(
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.transactionsService.getTransactionById(userId, id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new transaction of the login user',
    description:
      'Create a new transaction of the login user. For expense and transfer types, the account must have sufficient balance.',
  })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Insufficient balance.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing token.',
  })
  @ApiResponse({ status: 404, description: 'Account or category not found.' })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please try again later.',
  })
  async createTransaction(
    @CurrentUser('sub') userId: number,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return await this.transactionsService.createTransaction(
      userId,
      createTransactionDto,
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a transaction of the login user',
    description:
      'Update an existing transaction of the login. Account balance is recalculated to reflect the change.',
  })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Insufficient balance.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing token.',
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction, account, or category not found.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please try again later.',
  })
  async updateTransaction(
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return await this.transactionsService.updateTransaction(
      userId,
      id,
      updateTransactionDto,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a transaction of login user',
    description:
      'Delete an existing transaction of login user. The account balance is reversed to reflect the removal.',
  })
  @ApiResponse({ status: 200, description: 'Transaction deleted successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing token.',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please try again later.',
  })
  async deleteTransaction(
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.transactionsService.deleteTransaction(userId, id);
  }
}
