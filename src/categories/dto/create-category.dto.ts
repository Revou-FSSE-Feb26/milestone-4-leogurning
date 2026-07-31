import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Name of the category',
    example: 'Groceries',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Type of the category',
    enum: CategoryType,
    example: 'expense',
  })
  @IsEnum(CategoryType)
  @IsNotEmpty()
  type: CategoryType;
}
