import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}

export class CreateTransactionDto {
  @ApiProperty({
    description: 'ID of the account this transaction belongs to',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  accountId: number;

  @ApiProperty({
    description: 'ID of the category for this transaction',
    example: 4,
  })
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty({
    description: 'Type of the transaction',
    enum: TransactionType,
    example: 'expense',
  })
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @ApiProperty({
    description: 'Amount of the transaction (must be greater than 0)',
    example: 150000.0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Optional description or note for the transaction',
    example: 'Weekly groceries',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Date of the transaction (ISO 8601 format)',
    example: '2026-03-15',
  })
  @IsDateString()
  @IsNotEmpty()
  transactionDate: string;
}
