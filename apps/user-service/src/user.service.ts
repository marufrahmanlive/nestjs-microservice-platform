import { Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: string) {
    return this.userRepository.findById(id);
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ email });
  }

  async create(data: { email: string; name: string; role?: string }) {
    return this.userRepository.create({
      ...data,
      roles: [data.role || 'user'],
    });
  }

  async update(id: string, updates: any) {
    return this.userRepository.updateById(id, { $set: updates });
  }

  async softDelete(id: string) {
    return this.userRepository.softDelete({ _id: id } as any);
  }

  async list(skip: number, limit: number) {
    const { items, total } = await this.userRepository.findAndCount(
      {},
      { skip, limit, sort: { createdAt: -1 } },
    );
    return { items, total, skip, limit };
  }
}
