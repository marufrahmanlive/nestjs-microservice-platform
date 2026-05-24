import { Injectable, Logger } from '@nestjs/common';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(private readonly postsRepository: PostsRepository) {}

  async create(userId: string, data: any) {
    const post = await this.postsRepository.create({
      userId,
      ...data,
    });
    this.logger.log(`Post created: ${post._id}`);
    return post;
  }

  async findById(id: string) {
    return this.postsRepository.findById(id);
  }

  async findByUser(userId: string, skip: number = 0, limit: number = 10) {
    return this.postsRepository.findByUser(userId, skip, limit);
  }

  async findPublished(skip: number = 0, limit: number = 10) {
    return this.postsRepository.findPublished(skip, limit);
  }

  async findByTag(tag: string, skip: number = 0, limit: number = 10) {
    return this.postsRepository.findByTag(tag, skip, limit);
  }

  async update(id: string, data: any) {
    const post = await this.postsRepository.findOneAndUpdate({ _id: id }, data);
    this.logger.log(`Post updated: ${id}`);
    return post;
  }

  async delete(id: string) {
    const post = await this.postsRepository.softDelete({ _id: id });
    this.logger.log(`Post deleted: ${id}`);
    return post;
  }

  async like(postId: string, userId: string) {
    const post = await this.postsRepository.findById(postId);
    if (!post.likedBy.includes(userId)) {
      post.likedBy.push(userId);
      post.likesCount = post.likedBy.length;
      return this.postsRepository.findOneAndUpdate({ _id: postId }, post);
    }
    return post;
  }

  async unlike(postId: string, userId: string) {
    const post = await this.postsRepository.findById(postId);
    post.likedBy = post.likedBy.filter((id: string) => id !== userId);
    post.likesCount = post.likedBy.length;
    return this.postsRepository.findOneAndUpdate({ _id: postId }, post);
  }

  async list(skip: number = 0, limit: number = 10) {
    return this.findPublished(skip, limit);
  }
}
