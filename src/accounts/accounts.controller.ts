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
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/get-user.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';

@Controller('accounts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get own accounts of the login user',
    description: 'Get all accounts belonging to the logged-in user.',
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
    status: 429,
    description: 'Too many requests. Please try again later.',
  })
  async getAccounts(@CurrentUser('sub') userId: number) {
    return await this.accountsService.getAccountsByUserId(userId);
  }

  @Get('all')
  @Roles(UserRole.admin)
  @ApiOperation({
    summary: 'List all accounts. Admin only',
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
  @Roles(UserRole.admin)
  @ApiOperation({
    summary: 'Get accounts by user ID. Perform By Admin ',
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
    status: 403,
    description: 'Forbidden. Admin role required.',
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
    summary: 'Get account with transactions of the login user',
    description:
      'Get account details along with all its transactions of the login user, each nested with category data.',
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
  async getAccountWithTransactions(
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.accountsService.getAccountWithTransactions(userId, id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get account by ID of the login user',
    description:
      'Get details of a specific account by its ID. Specific of the login user',
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
  async getAccountById(
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.accountsService.getAccountById(userId, id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new account of the login user',
    description: 'Create a new account for the login user.',
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
    @CurrentUser('sub') userId: number,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return await this.accountsService.createAccount(userId, createAccountDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an account of the login user',
    description: 'Update an existing account of the login user.',
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
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return await this.accountsService.updateAccount(
      userId,
      id,
      updateAccountDto,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an account of the login user',
    description: 'Delete an existing account of the login user.',
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
  async deleteAccount(
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.accountsService.deleteAccount(userId, id);
  }
}
