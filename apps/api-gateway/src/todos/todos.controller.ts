import { Controller, Get, Post, Put, Delete, Param, Body, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TodosService } from './todos.service';
import { CurrentUser, Roles, UserRole, JwtPayload } from '@app/common';

@ApiTags('Todos')
@ApiBearerAuth()
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @ApiOperation({ summary: 'Create new todo' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: { title: string; description?: string; dueDate?: Date; priority?: number },
  ) {
    return this.todosService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List user todos' })
  async list(
    @CurrentUser() user: JwtPayload,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const skip = (page - 1) * limit;
    return this.todosService.list(user.sub, skip, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get todo by ID' })
  async findById(@Param('id') id: string) {
    return this.todosService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update todo' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: { title?: string; description?: string; status?: string; dueDate?: Date; priority?: number },
  ) {
    return this.todosService.update(id, user.sub, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete todo' })
  async delete(@Param('id') id: string) {
    return this.todosService.delete(id);
  }
}
