import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UserService {
  async getUserById(id: string) {
    // TODO: Call user-service microservice
    return {
      id,
      email: 'user@example.com',
      name: 'User Name',
      role: 'user',
      createdAt: new Date(),
    };
  }

  async createUser(dto: UpdateUserDto) {
    // TODO: Call user-service microservice
    return {
      id: 'generated-id',
      ...dto,
      createdAt: new Date(),
    };
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    // TODO: Call user-service microservice
    return {
      id,
      ...dto,
      updatedAt: new Date(),
    };
  }

  async deleteUser(id: string) {
    // TODO: Call user-service microservice (soft delete)
    return { success: true };
  }

  async listUsers(page: number, limit: number) {
    // TODO: Call user-service microservice
    return {
      items: [],
      total: 0,
      page,
      limit,
    };
  }
}
