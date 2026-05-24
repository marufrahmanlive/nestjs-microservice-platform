import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { BOOKS_SERVICE_TOKEN, BOOK_PATTERNS } from '@app/common';

@Injectable()
export class BooksService {
  constructor(@Inject(BOOKS_SERVICE_TOKEN) private booksClient: ClientProxy) {}

  async create(userId: string, dto: any) {
    try {
      return await firstValueFrom(
        this.booksClient.send(BOOK_PATTERNS.CREATE, { userId, ...dto }).pipe(
          timeout(5000),
          catchError((err) => {
            throw new HttpException(
              err.message || 'Books service error',
              err.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException('Failed to create book', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findById(id: string) {
    try {
      return await firstValueFrom(
        this.booksClient.send(BOOK_PATTERNS.FIND_BY_ID, { id }).pipe(
          timeout(5000),
          catchError((err) => {
            throw new HttpException(
              err.message || 'Books service error',
              err.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException('Failed to fetch book', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findByUser(userId: string, skip: number = 0, limit: number = 10) {
    try {
      return await firstValueFrom(
        this.booksClient.send(BOOK_PATTERNS.FIND_BY_USER, { userId, skip, limit }).pipe(
          timeout(5000),
          catchError((err) => {
            throw new HttpException(
              err.message || 'Books service error',
              err.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException('Failed to fetch books', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, userId: string, dto: any) {
    try {
      return await firstValueFrom(
        this.booksClient.send(BOOK_PATTERNS.UPDATE, { id, userId, ...dto }).pipe(
          timeout(5000),
          catchError((err) => {
            throw new HttpException(
              err.message || 'Books service error',
              err.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException('Failed to update book', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id: string) {
    try {
      return await firstValueFrom(
        this.booksClient.send(BOOK_PATTERNS.DELETE, { id }).pipe(
          timeout(5000),
          catchError((err) => {
            throw new HttpException(
              err.message || 'Books service error',
              err.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException('Failed to delete book', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async list(userId: string, skip: number = 0, limit: number = 10) {
    return this.findByUser(userId, skip, limit);
  }
}
