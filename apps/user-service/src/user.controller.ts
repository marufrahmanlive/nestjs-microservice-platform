import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('user.find_by_id')
  async findById(@Payload() data: { id: string }) {
    return this.userService.findById(data.id);
  }

  @MessagePattern('user.find_by_email')
  async findByEmail(@Payload() data: { email: string }) {
    return this.userService.findByEmail(data.email);
  }

  @MessagePattern('user.create')
  async create(@Payload() data: { email: string; name: string; role?: string }) {
    return this.userService.create(data);
  }

  @MessagePattern('user.update')
  async update(@Payload() data: { id: string; updates: any }) {
    return this.userService.update(data.id, data.updates);
  }

  @MessagePattern('user.delete')
  async delete(@Payload() data: { id: string }) {
    return this.userService.softDelete(data.id);
  }

  @MessagePattern('user.list')
  async list(@Payload() data: { skip: number; limit: number }) {
    return this.userService.list(data.skip, data.limit);
  }
}
