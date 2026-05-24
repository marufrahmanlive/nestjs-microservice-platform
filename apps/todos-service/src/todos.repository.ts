import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo, TodoDocument, AbstractRepository } from '@app/database';

@Injectable()
export class TodosRepository extends AbstractRepository<TodoDocument> {
  protected readonly logger = new Logger(TodosRepository.name);

  constructor(@InjectModel(Todo.name) todoModel: Model<TodoDocument>) {
    super(todoModel);
  }

  async findByUser(userId: string, skip: number = 0, limit: number = 10) {
    const items = await this.find(
      { userId, deletedAt: null },
      { skip, limit, sort: { createdAt: -1 } },
    );
    const total = await this.countDocuments({ userId, deletedAt: null });
    return { items, total };
  }

  async findByStatus(userId: string, status: string, skip: number = 0, limit: number = 10) {
    const items = await this.find(
      { userId, status, deletedAt: null },
      { skip, limit, sort: { priority: -1, createdAt: -1 } },
    );
    const total = await this.countDocuments({ userId, status, deletedAt: null });
    return { items, total };
  }
}
