import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { USER_SERVICE_TOKEN, USER_PATTERNS } from '@app/common';

@Injectable()
export class UsersService {
  constructor(@Inject(USER_SERVICE_TOKEN) private userClient: ClientProxy) {}

  async findById(id: string) {
    try {
      return await firstValueFrom(
        this.userClient.send(USER_PATTERNS.FIND_BY_ID, { id }).pipe(
          timeout(5000),
          catchError((err) => {
            throw new HttpException(
              err.message || 'User service error',
              err.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException('Failed to fetch user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    try {
      return await firstValueFrom(
        this.userClient.send(USER_PATTERNS.LIST, { skip, limit }).pipe(
          timeout(5000),
          catchError((err) => {
            throw new HttpException(
              err.message || 'User service error',
              err.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException('Failed to fetch users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, dto: any) {
    try {
      return await firstValueFrom(
        this.userClient.send(USER_PATTERNS.UPDATE, { id, updates: dto }).pipe(
          timeout(5000),
          catchError((err) => {
            throw new HttpException(
              err.message || 'User service error',
              err.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException('Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id: string) {
    try {
      return await firstValueFrom(
        this.userClient.send(USER_PATTERNS.DELETE, { id }).pipe(
          timeout(5000),
          catchError((err) => {
            throw new HttpException(
              err.message || 'User service error',
              err.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException('Failed to delete user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
