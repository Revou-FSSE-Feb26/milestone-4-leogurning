import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export enum AccountType {
  CASH = 'cash',
  BANK = 'bank',
  E_WALLET = 'e_wallet',
}

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEnum(AccountType)
  @IsNotEmpty()
  type: AccountType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  balance?: number;
}
