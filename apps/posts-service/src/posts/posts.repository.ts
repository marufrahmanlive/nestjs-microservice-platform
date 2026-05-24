import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument, AbstractRepository } from '@app/database';

@Injectable()
export class PostsRepository extends AbstractRepository<PostDocument> {
  protected readonly logger = new Logger(PostsRepository.name);

  constructor(@InjectModel(Post.name) postModel: Model<PostDocument>) {
    super(postModel);
  }

  async findByUser(userId: string, skip: number = 0, limit: number = 10) {
    const items = await this.find(
      { userId, deletedAt: null },
      { skip, limit, sort: { createdAt: -1 } },
    );
    const total = await this.countDocuments({ userId, deletedAt: null });
    return { items, total };
  }

  async findPublished(skip: number = 0, limit: number = 10) {
    const items = await this.find(
      { status: 'published', deletedAt: null },
      { skip, limit, sort: { createdAt: -1 } },
    );
    const total = await this.countDocuments({ status: 'published', deletedAt: null });
    return { items, total };
  }

  async findByTag(tag: string, skip: number = 0, limit: number = 10) {
    const items = await this.find(
      { tags: tag, status: 'published', deletedAt: null },
      { skip, limit, sort: { createdAt: -1 } },
    );
    const total = await this.countDocuments({ tags: tag, status: 'published', deletedAt: null });
    return { items, total };
  }
}
