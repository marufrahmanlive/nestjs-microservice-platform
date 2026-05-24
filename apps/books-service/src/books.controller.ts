import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BOOK_PATTERNS } from '@app/common';
import { BooksService } from './books.service';

@Controller()
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @MessagePattern(BOOK_PATTERNS.CREATE)
  async create(@Payload() dto: any) {
    return this.booksService.create(dto.userId, dto);
  }

  @MessagePattern(BOOK_PATTERNS.FIND_BY_ID)
  async findById(@Payload() dto: { id: string }) {
    return this.booksService.findById(dto.id);
  }

  @MessagePattern(BOOK_PATTERNS.FIND_BY_USER)
  async findByUser(@Payload() dto: { userId: string; skip?: number; limit?: number }) {
    return this.booksService.findByUser(dto.userId, dto.skip || 0, dto.limit || 10);
  }

  @MessagePattern(BOOK_PATTERNS.FIND_BY_READ_STATUS)
  async findByReadStatus(@Payload() dto: { userId: string; isRead: boolean; skip?: number; limit?: number }) {
    return this.booksService.findByReadStatus(dto.userId, dto.isRead, dto.skip || 0, dto.limit || 10);
  }

  @MessagePattern(BOOK_PATTERNS.FIND_BY_GENRE)
  async findByGenre(@Payload() dto: { userId: string; genre: string; skip?: number; limit?: number }) {
    return this.booksService.findByGenre(dto.userId, dto.genre, dto.skip || 0, dto.limit || 10);
  }

  @MessagePattern(BOOK_PATTERNS.UPDATE)
  async update(@Payload() dto: { id: string; userId?: string; title?: string; author?: string; description?: string; rating?: number; isRead?: boolean }) {
    return this.booksService.update(dto.id, dto);
  }

  @MessagePattern(BOOK_PATTERNS.DELETE)
  async delete(@Payload() dto: { id: string }) {
    return this.booksService.delete(dto.id);
  }

  @MessagePattern(BOOK_PATTERNS.LIST)
  async list(@Payload() dto: { userId: string; skip?: number; limit?: number }) {
    return this.booksService.list(dto.userId, dto.skip || 0, dto.limit || 10);
  }
}
