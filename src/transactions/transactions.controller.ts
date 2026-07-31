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
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all transactions',
    description: 'Get all transactions across all accounts. Admin only.',
  })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized. Invalid or missing token.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin role required.' })
  @ApiResponse({ status: 429, description: 'Too many requests. Please try again later.' })
  async getAllTransactions() {
    return await this.transactionsService.getAllTransactions();
  }

  @Get('account/:accountId')
  @ApiOperation({
    summary: 'Get transactions by account ID',
    description: 'Get all transactions belonging to a specific account, ordered newest first.',
  })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized. Invalid or missing token.' })
  @ApiResponse({ status: 404, description: 'Account not found.' })
  @ApiResponse({ status: 429, description: 'Too many requests. Please try again later.' })
  async getTransactionsByAccountId(
    @Param('accountId', ParseIntPipe) accountId: number,
  ) {
    return await this.transactionsService.getTransactionsByAccountId(accountId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get transaction by ID',
    description: 'Get details of a specific transaction by its ID.',
  })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized. Invalid or missing token.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  @ApiResponse({ status: 429, description: 'Too many requests. Please try again later.' })
  async getTransactionById(@Param('id', ParseIntPipe) id: number) {
    return await this.transactionsService.getTransactionById(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new transaction',
    description:
      'Create a new transaction. For expense and transfer types, the account must have sufficient balance.',
  })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request. Insufficient balance.' })
  @ApiResponse({ status: 401, description: 'Unauthorized. Invalid or missing token.' })
  @ApiResponse({ status: 404, description: 'Account or category not found.' })
  @ApiResponse({ status: 429, description: 'Too many requests. Please try again later.' })
  async createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    return await this.transactionsService.createTransaction(createTransactionDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a transaction',
    description:
      'Update an existing transaction. Account balance is recalculated to reflect the change.',
  })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request. Insufficient balance.' })
  @ApiResponse({ status: 401, description: 'Unauthorized. Invalid or missing token.' })
  @ApiResponse({ status: 404, description: 'Transaction, account, or category not found.' })
  @ApiResponse({ status: 429, description: 'Too many requests. Please try again later.' })
  async updateTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return await this.transactionsService.updateTransaction(id, updateTransactionDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a transaction',
    description:
      'Delete an existing transaction. The account balance is reversed to reflect the removal.',
  })
  @ApiResponse({ status: 200, description: 'Transaction deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized. Invalid or missing token.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  @ApiResponse({ status: 429, description: 'Too many requests. Please try again later.' })
  async deleteTransaction(@Param('id', ParseIntPipe) id: number) {
    return await this.transactionsService.deleteTransaction(id);
  }
}
