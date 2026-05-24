import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '@app/common';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, minlength: 6, select: false })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], enum: Object.values(UserRole), default: [UserRole.USER] })
  roles: UserRole[];

  @Prop({ default: null })
  lastLoginAt?: Date;

  @Prop({ default: null })
  deletedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1, deletedAt: 1 });
