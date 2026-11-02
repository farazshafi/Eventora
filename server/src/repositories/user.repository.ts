import type { AnyKeys, UpdateQuery } from 'mongoose';
import { UserModel, type UserDocument } from '../models/user.model.js';
import { BaseMongoRepository } from './base.repository.js';
import type { UserRecord, UserRole } from '../types/user.types.js';
import type { CreateUserInput, UserRepository } from './interfaces/user.repository.interface.js';

function mapUser(document: unknown): UserRecord {
  const user = document as {
    id?: string;
    _id?: { toString(): string } | string;
    email: string;
    name: string;
    passwordHash?: string;
    role: UserRole;
    createdAt: Date;
    emailVerified?: boolean;
  };
  return {
    id: user.id ?? String(user._id),
    email: user.email,
    name: user.name,
    passwordHash: user.passwordHash ?? '',
    role: user.role,
    createdAt: user.createdAt,
    emailVerified: user.emailVerified !== false,
  };
}

export class MongoUserRepository
  extends BaseMongoRepository<UserDocument, UserRecord, CreateUserInput>
  implements UserRepository
{
  constructor() {
    super(UserModel);
  }

  protected toEntity(document: unknown): UserRecord {
    return mapUser(document);
  }

  protected toCreateData(input: CreateUserInput): AnyKeys<UserDocument> {
    return { ...input, role: 'USER' };
  }

  protected toUpdateData(updates: Partial<UserRecord>): UpdateQuery<UserDocument> {
    const fields = { ...updates };
    delete fields.id;
    return fields;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await UserModel.findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .lean();
    return user ? mapUser(user) : null;
  }
  async verifyEmail(email: string, codeHash: string): Promise<UserRecord | null> {
    const user = await UserModel.findOneAndUpdate(
      {
        email: email.toLowerCase(),
        emailVerified: false,
        verificationCodeHash: codeHash,
        verificationExpiresAt: { $gt: new Date() },
      },
      {
        $set: { emailVerified: true },
        $unset: { verificationCodeHash: 1, verificationExpiresAt: 1 },
      },
      { new: true },
    )
      .select('+passwordHash')
      .lean()
      .exec();
    return user ? mapUser(user) : null;
  }
  async updateVerification(email: string, codeHash: string, expiresAt: Date): Promise<boolean> {
    const result = await UserModel.updateOne(
      { email: email.toLowerCase(), emailVerified: false },
      { $set: { verificationCodeHash: codeHash, verificationExpiresAt: expiresAt } },
    ).exec();
    return result.modifiedCount > 0;
  }
}
