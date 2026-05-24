import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CurrentUser, JwtPayload, Public, Roles } from '@app/common';
import { UserRole } from '@app/constants';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiBearerAuth()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create new post' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: { title: string; content: string; images?: string[]; tags?: string[]; status?: string },
  ) {
    return this.postsService.create(user.sub, dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List published posts with pagination' })
  async list(@Query('page') page = 1, @Query('limit') limit = 10, @Query('tag') tag?: string) {
    const skip = (page - 1) * limit;
    if (tag) {
      return this.postsService.findByTag(tag, skip, limit);
    }
    return this.postsService.list(skip, limit);
  }

  @Get('my-posts/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user's posts" })
  async getUserPosts(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.sub !== userId && user.role !== UserRole.ADMIN) {
      throw new Error('Unauthorized');
    }
    const skip = (page - 1) * limit;
    return this.postsService.findByUser(userId, skip, limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get post by ID' })
  async findById(@Param('id') id: string) {
    return this.postsService.findById(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update post' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: { title?: string; content?: string; images?: string[]; tags?: string[]; status?: string },
  ) {
    const post = await this.postsService.findById(id);
    if (post.userId !== user.sub && user.role !== UserRole.ADMIN) {
      throw new Error('Unauthorized');
    }
    return this.postsService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete post (soft-delete)' })
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const post = await this.postsService.findById(id);
    if (post.userId !== user.sub && user.role !== UserRole.ADMIN) {
      throw new Error('Unauthorized');
    }
    return this.postsService.delete(id);
  }

  @Patch(':id/like')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like a post' })
  async like(@Param('id') postId: string, @CurrentUser() user: JwtPayload) {
    return this.postsService.like(postId, user.sub);
  }

  @Patch(':id/unlike')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlike a post' })
  async unlike(@Param('id') postId: string, @CurrentUser() user: JwtPayload) {
    return this.postsService.unlike(postId, user.sub);
  }

  @Post(':id/publish')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a post' })
  async publish(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const post = await this.postsService.findById(id);
    if (post.userId !== user.sub && user.role !== UserRole.ADMIN) {
      throw new Error('Unauthorized');
    }
    return this.postsService.update(id, { status: 'published' });
  }
}
