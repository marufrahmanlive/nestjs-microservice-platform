import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ enum: Object.values(PostStatus), default: PostStatus.DRAFT })
  status: PostStatus;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ type: [String], default: [] })
  likedBy: string[];

  @Prop({ default: null })
  deletedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export type PostDocument = HydratedDocument<Post>;
export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ userId: 1, deletedAt: 1 });
PostSchema.index({ userId: 1, status: 1 });
PostSchema.index({ status: 1, createdAt: -1 });
