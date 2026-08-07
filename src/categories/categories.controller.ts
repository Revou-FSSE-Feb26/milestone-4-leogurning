import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({
    summary: 'List all categories',
    description:
      'Get all categories with optional type filter (income/expense).',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['income', 'expense'],
    description: 'Filter categories by type',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing token.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please try again later.',
  })
  async getAllCategories(@Query('type') type?: string) {
    if (type) {
      return await this.categoriesService.getCategoriesByType(type);
    }
    return await this.categoriesService.getAllCategories();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get category by ID',
    description: 'Get details of a specific category by its ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing token.',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please try again later.',
  })
  async getCategoryById(@Param('id', ParseIntPipe) id: number) {
    return await this.categoriesService.getCategoryById(id);
  }

  @Post()
  @Roles(UserRole.admin)
  @ApiOperation({
    summary: 'Create a new category. (Admin only)',
    description: 'Create a new category. Admin only.',
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Admin role required.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Category with this name already exists.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please try again later.',
  })
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoriesService.createCategory(createCategoryDto);
  }

  @Patch(':id')
  @Roles(UserRole.admin)
  @ApiOperation({
    summary: 'Update a category. (Admin only)',
    description: 'Update an existing category. Admin only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Admin role required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Category with this name already exists.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please try again later.',
  })
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoriesService.updateCategory(id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles(UserRole.admin)
  @ApiOperation({
    summary: 'Delete a category. (Admin only)',
    description: 'Delete an existing category. Admin only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Admin role required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please try again later.',
  })
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return await this.categoriesService.deleteCategory(id);
  }
}
