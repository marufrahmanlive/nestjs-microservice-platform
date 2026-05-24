import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book, BookDocument, AbstractRepository } from '@app/database';

@Injectable()
export class BooksRepository extends AbstractRepository<BookDocument> {
  protected readonly logger = new Logger(BooksRepository.name);

  constructor(@InjectModel(Book.name) bookModel: Model<BookDocument>) {
    super(bookModel);
  }

  async findByUser(userId: string, skip: number = 0, limit: number = 10) {
    const items = await this.find(
      { userId, deletedAt: null },
      { skip, limit, sort: { createdAt: -1 } },
    );
    const total = await this.countDocuments({ userId, deletedAt: null });
    return { items, total };
  }

  async findByReadStatus(userId: string, isRead: boolean, skip: number = 0, limit: number = 10) {
    const items = await this.find(
      { userId, isRead, deletedAt: null },
      { skip, limit, sort: { createdAt: -1 } },
    );
    const total = await this.countDocuments({ userId, isRead, deletedAt: null });
    return { items, total };
  }

  async findByGenre(userId: string, genre: string, skip: number = 0, limit: number = 10) {
    const items = await this.find(
      { userId, genres: genre, deletedAt: null },
      { skip, limit, sort: { createdAt: -1 } },
    );
    const total = await this.countDocuments({ userId, genres: genre, deletedAt: null });
    return { items, total };
  }
}
