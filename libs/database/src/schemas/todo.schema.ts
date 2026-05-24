import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum TodoStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class Todo {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ enum: Object.values(TodoStatus), default: TodoStatus.PENDING })
  status: TodoStatus;

  @Prop({ type: Date, default: null })
  dueDate?: Date;

  @Prop({ default: 0 })
  priority: number;

  @Prop({ default: null })
  deletedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export type TodoDocument = HydratedDocument<Todo>;
export const TodoSchema = SchemaFactory.createForClass(Todo);

TodoSchema.index({ userId: 1, deletedAt: 1 });
TodoSchema.index({ userId: 1, status: 1 });
