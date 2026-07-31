import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async getAllCategories() {
    return await this.categoriesRepository.getAllCategories();
  }

  async getCategoryById(id: number) {
    const category = await this.categoriesRepository.getCategoryById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async getCategoriesByType(type: string) {
    return await this.categoriesRepository.getCategoriesByType(type);
  }

  async createCategory(data: CreateCategoryDto) {
    const existingCategory =
      await this.categoriesRepository.getCategoryByName(data.name);
    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    return await this.categoriesRepository.createCategory(data);
  }

  async updateCategory(id: number, data: UpdateCategoryDto) {
    const category = await this.categoriesRepository.getCategoryById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (data.name && data.name !== category.name) {
      const existingCategory =
        await this.categoriesRepository.getCategoryByName(data.name);
      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    return await this.categoriesRepository.updateCategory(id, data);
  }

  async deleteCategory(id: number) {
    const category = await this.categoriesRepository.getCategoryById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const deleted = await this.categoriesRepository.deleteCategory(id);
    if (deleted) {
      return {
        message: 'Category deleted successfully',
        status: 203,
        id: id.toString(),
      };
    }
    throw new Error('Error deleting category');
  }
}
