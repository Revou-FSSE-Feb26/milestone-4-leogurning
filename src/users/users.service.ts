import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getAllUsers() {
    return await this.usersRepository.getAllUsers();
  }

  async getUserById(id: number) {
    const user = await this.usersRepository.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async createUser(data: CreateUserDto) {
    const existingUser = await this.usersRepository.getUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('User with Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return await this.usersRepository.createUser({
      ...data,
      password: hashedPassword,
    });
  }

  async updateUser(id: number, data: UpdateUserDto) {
    const user = await this.usersRepository.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await this.usersRepository.getUserByEmail(
        data.email,
      );
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return await this.usersRepository.updateUser(id, data);
  }

  async deleteUser(id: number) {
    const user = await this.usersRepository.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const deleted = await this.usersRepository.deleteUser(id);
    if (deleted) {
      return {
        message: 'User deleted successfully',
        status: 203,
        id: id.toString(),
      };
    }
    throw new Error('Error deleting user');
  }
}
