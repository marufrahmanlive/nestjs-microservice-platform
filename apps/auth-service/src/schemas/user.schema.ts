import { Schema } from 'mongoose';

export const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    roles: { type: [String], default: ['user'] },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  {
    timestamps: true,
    collection: 'users',
  },
);

// Index for soft deletes
UserSchema.index({ deletedAt: 1 });
UserSchema.index({ email: 1, deletedAt: 1 });
