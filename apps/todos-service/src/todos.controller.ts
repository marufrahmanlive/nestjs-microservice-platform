import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TODO_PATTERNS } from '@app/common';
import { TodosService } from './todos.service';

@Controller()
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @MessagePattern(TODO_PATTERNS.CREATE)
  async create(@Payload() dto: { userId: string; title: string; description?: string; dueDate?: Date; priority?: number }) {
    return this.todosService.create(dto.userId, dto);
  }

  @MessagePattern(TODO_PATTERNS.FIND_BY_ID)
  async findById(@Payload() dto: { id: string }) {
    return this.todosService.findById(dto.id);
  }

  @MessagePattern(TODO_PATTERNS.FIND_BY_USER)
  async findByUser(@Payload() dto: { userId: string; skip?: number; limit?: number }) {
    return this.todosService.findByUser(dto.userId, dto.skip || 0, dto.limit || 10);
  }

  @MessagePattern(TODO_PATTERNS.FIND_BY_STATUS)
  async findByStatus(@Payload() dto: { userId: string; status: string; skip?: number; limit?: number }) {
    return this.todosService.findByStatus(dto.userId, dto.status, dto.skip || 0, dto.limit || 10);
  }

  @MessagePattern(TODO_PATTERNS.UPDATE)
  async update(@Payload() dto: { id: string; userId: string; title?: string; description?: string; status?: string; dueDate?: Date; priority?: number }) {
    return this.todosService.update(dto.id, dto);
  }

  @MessagePattern(TODO_PATTERNS.DELETE)
  async delete(@Payload() dto: { id: string }) {
    return this.todosService.delete(dto.id);
  }

  @MessagePattern(TODO_PATTERNS.LIST)
  async list(@Payload() dto: { userId: string; skip?: number; limit?: number }) {
    return this.todosService.list(dto.userId, dto.skip || 0, dto.limit || 10);
  }
}
