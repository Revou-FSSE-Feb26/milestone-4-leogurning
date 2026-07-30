import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        // exclude password from the response
      },
    });
  }

  getUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        // exclude password from the response
      },
    });
  }

  getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  createUser(data: CreateUserDto) {
    return this.prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        // exclude password from the response
      },
    });
  }

  updateUser(id: number, data: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        // exclude password from the response
      },
    });
  }

  async deleteUser(id: number) {
    const deleted = await this.prisma.user.delete({
      where: { id },
    });
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
