import { model, Schema } from 'mongoose';
import type { UserRole } from '../types/user.types.js';

export interface UserDocument {
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  verificationCodeHash?: string;
  verificationExpiresAt?: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['USER', 'ADMIN'], required: true, default: 'USER' },
    emailVerified: { type: Boolean, required: true, default: true },
    verificationCodeHash: { type: String, select: false },
    verificationExpiresAt: { type: Date, select: false },
  },
  { timestamps: true, versionKey: false },
);

export const UserModel = model<UserDocument>('User', userSchema);
