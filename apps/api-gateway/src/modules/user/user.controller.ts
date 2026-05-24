import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '@app/decorators';
import { JwtPayload } from '@app/common/interfaces/jwt-payload.interface';
import { UserService } from './user.service';
import { UpdateUserDto } from './dtos/update-user.dto';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user profile' })
  async getCurrentUser(@CurrentUser() user: JwtPayload) {
    return this.userService.getUserById(user.sub);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user by ID' })
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create user' })
  async createUser(@Body() dto: UpdateUserDto) {
    return this.userService.createUser(dto);
  }

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user' })
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List users with pagination' })
  async listUsers(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    return this.userService.listUsers(parseInt(page, 10), parseInt(limit, 10));
  }
}
