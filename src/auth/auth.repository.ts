import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: RegisterDto & { password: string }) {
    return await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  }
}
