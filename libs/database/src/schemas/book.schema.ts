import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Book {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: false })
  isbn?: string;

  @Prop({ default: 0 })
  pages: number;

  @Prop({ required: false })
  publishedDate?: Date;

  @Prop({ required: false })
  publisher?: string;

  @Prop({ type: [String], default: [] })
  genres: string[];

  @Prop({ type: Number, min: 0, max: 5, default: 0 })
  rating: number;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: null })
  deletedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export type BookDocument = HydratedDocument<Book>;
export const BookSchema = SchemaFactory.createForClass(Book);

BookSchema.index({ userId: 1, deletedAt: 1 });
BookSchema.index({ userId: 1, isRead: 1 });
