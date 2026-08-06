import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export class RegisterDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'Alicia Wonderland',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'alicia@email.id',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;

  @ApiProperty({
    description: 'Password of the user',
    example: '!7798&adsfnldjnf',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @ApiProperty({ description: 'Role of the user', example: 'user' })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
