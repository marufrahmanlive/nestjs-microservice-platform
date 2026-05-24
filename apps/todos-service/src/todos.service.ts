import { Injectable, Logger } from '@nestjs/common';
import { TodosRepository } from './todos.repository';

@Injectable()
export class TodosService {
  private readonly logger = new Logger(TodosService.name);

  constructor(private readonly todosRepository: TodosRepository) {}

  async create(userId: string, data: any) {
    const todo = await this.todosRepository.create({
      userId,
      ...data,
    });
    this.logger.log(`Todo created: ${todo._id}`);
    return todo;
  }

  async findById(id: string) {
    return this.todosRepository.findById(id);
  }

  async findByUser(userId: string, skip: number = 0, limit: number = 10) {
    return this.todosRepository.findByUser(userId, skip, limit);
  }

  async findByStatus(userId: string, status: string, skip: number = 0, limit: number = 10) {
    return this.todosRepository.findByStatus(userId, status, skip, limit);
  }

  async update(id: string, data: any) {
    const todo = await this.todosRepository.findOneAndUpdate({ _id: id }, data);
    this.logger.log(`Todo updated: ${id}`);
    return todo;
  }

  async delete(id: string) {
    const todo = await this.todosRepository.softDelete({ _id: id });
    this.logger.log(`Todo deleted: ${id}`);
    return todo;
  }

  async list(userId: string, skip: number = 0, limit: number = 10) {
    return this.findByUser(userId, skip, limit);
  }
}
