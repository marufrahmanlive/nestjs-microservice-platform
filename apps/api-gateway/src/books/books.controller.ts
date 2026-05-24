import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CurrentUser, JwtPayload } from '@app/common';

@ApiTags('Books')
@ApiBearerAuth()
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiOperation({ summary: 'Add new book' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: { title: string; author: string; description?: string; isbn?: string; pages?: number; publishedDate?: Date; publisher?: string; genres?: string[] },
  ) {
    return this.booksService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List user books' })
  async list(
    @CurrentUser() user: JwtPayload,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const skip = (page - 1) * limit;
    return this.booksService.list(user.sub, skip, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get book by ID' })
  async findById(@Param('id') id: string) {
    return this.booksService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update book' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: { title?: string; author?: string; description?: string; rating?: number; isRead?: boolean },
  ) {
    return this.booksService.update(id, user.sub, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete book' })
  async delete(@Param('id') id: string) {
    return this.booksService.delete(id);
  }
}
