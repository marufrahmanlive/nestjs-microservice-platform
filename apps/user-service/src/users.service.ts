import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);
    return this._sanitizeUser(user);
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    return user ? this._sanitizeUser(user) : null;
  }

  async list(skip: number, limit: number) {
    const { items, total } = await this.usersRepository.list(skip, limit);
    return {
      items: items.map((u) => this._sanitizeUser(u)),
      total,
    };
  }

  async update(id: string, updates: any) {
    const user = await this.usersRepository.findOneAndUpdate({ _id: id }, updates);
    this.logger.log(`User updated: ${id}`);
    return this._sanitizeUser(user);
  }

  async delete(id: string) {
    const user = await this.usersRepository.softDelete({ _id: id });
    this.logger.log(`User deleted: ${id}`);
    return this._sanitizeUser(user);
  }

  private _sanitizeUser(user: any) {
    if (!user) return null;
    const obj = user.toObject?.() || user;
    delete obj.password;
    return obj;
  }
}
