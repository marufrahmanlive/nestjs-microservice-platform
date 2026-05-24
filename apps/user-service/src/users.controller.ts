import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { USER_PATTERNS } from '@app/common';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(USER_PATTERNS.FIND_BY_ID)
  async findById(@Payload() dto: { id: string }) {
    return this.usersService.findById(dto.id);
  }

  @MessagePattern(USER_PATTERNS.FIND_BY_EMAIL)
  async findByEmail(@Payload() dto: { email: string }) {
    return this.usersService.findByEmail(dto.email);
  }

  @MessagePattern(USER_PATTERNS.LIST)
  async list(@Payload() dto: { skip: number; limit: number }) {
    return this.usersService.list(dto.skip, dto.limit);
  }

  @MessagePattern(USER_PATTERNS.UPDATE)
  async update(@Payload() dto: { id: string; updates: any }) {
    return this.usersService.update(dto.id, dto.updates);
  }

  @MessagePattern(USER_PATTERNS.DELETE)
  async delete(@Payload() dto: { id: string }) {
    return this.usersService.delete(dto.id);
  }
}
