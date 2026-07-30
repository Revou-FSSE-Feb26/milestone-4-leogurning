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

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async getAllAccounts() {
    return await this.accountsService.getAllAccounts();
  }

  @Get('user/:userId')
  async getAccountsByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return await this.accountsService.getAccountsByUserId(userId);
  }

  @Get(':id')
  async getAccountById(@Param('id', ParseIntPipe) id: number) {
    return await this.accountsService.getAccountById(id);
  }

  @Post('user/:userId')
  async createAccount(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return await this.accountsService.createAccount(userId, createAccountDto);
  }

  @Patch(':id')
  async updateAccount(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return await this.accountsService.updateAccount(id, updateAccountDto);
  }

  @Delete(':id')
  async deleteAccount(@Param('id', ParseIntPipe) id: number) {
    return await this.accountsService.deleteAccount(id);
  }
}
