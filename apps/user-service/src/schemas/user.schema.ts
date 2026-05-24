import { Schema } from 'mongoose';

export const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, sparse: true },
    roles: { type: [String], default: ['user'] },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    deletedAt: { type: Date, default: null, index: true },
  },
  {
    timestamps: true,
    collection: 'users',
  },
);

// Composite index for soft deletes and active users
UserSchema.index({ email: 1, deletedAt: 1 });
UserSchema.index({ isActive: 1, deletedAt: 1 });
UserSchema.index({ createdAt: -1, deletedAt: 1 });
