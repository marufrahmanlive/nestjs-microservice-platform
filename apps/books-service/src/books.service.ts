import { Injectable, Logger } from '@nestjs/common';
import { BooksRepository } from './books.repository';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(private readonly booksRepository: BooksRepository) {}

  async create(userId: string, data: any) {
    const book = await this.booksRepository.create({
      userId,
      ...data,
    });
    this.logger.log(`Book created: ${book._id}`);
    return book;
  }

  async findById(id: string) {
    return this.booksRepository.findById(id);
  }

  async findByUser(userId: string, skip: number = 0, limit: number = 10) {
    return this.booksRepository.findByUser(userId, skip, limit);
  }

  async findByReadStatus(userId: string, isRead: boolean, skip: number = 0, limit: number = 10) {
    return this.booksRepository.findByReadStatus(userId, isRead, skip, limit);
  }

  async findByGenre(userId: string, genre: string, skip: number = 0, limit: number = 10) {
    return this.booksRepository.findByGenre(userId, genre, skip, limit);
  }

  async update(id: string, data: any) {
    const book = await this.booksRepository.findOneAndUpdate({ _id: id }, data);
    this.logger.log(`Book updated: ${id}`);
    return book;
  }

  async delete(id: string) {
    const book = await this.booksRepository.softDelete({ _id: id });
    this.logger.log(`Book deleted: ${id}`);
    return book;
  }

  async list(userId: string, skip: number = 0, limit: number = 10) {
    return this.findByUser(userId, skip, limit);
  }
}
