import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCategories() {
    return await this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
        type: true,
      },
    });
  }

  async getCategoryById(id: number) {
    return await this.prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });
  }

  async getCategoriesByType(type: string) {
    return await this.prisma.category.findMany({
      where: { type: type as any },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });
  }

  async getCategoryByName(name: string) {
    return await this.prisma.category.findFirst({
      where: { name },
    });
  }

  async createCategory(data: CreateCategoryDto) {
    return await this.prisma.category.create({
      data,
      select: {
        id: true,
        name: true,
        type: true,
      },
    });
  }

  async updateCategory(id: number, data: UpdateCategoryDto) {
    return await this.prisma.category.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        type: true,
      },
    });
  }

  async deleteCategory(id: number) {
    const deleted = await this.prisma.category.delete({
      where: { id },
    });
    return deleted;
  }
}
