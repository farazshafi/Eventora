import type { UserRecord } from '../../types/user.types.js';
import type { BaseRepository } from './base.repository.interface.js';

export interface CreateUserInput {
  email: string;
  name: string;
  passwordHash: string;
  verificationCodeHash?: string;
  verificationExpiresAt?: Date;
  emailVerified?: boolean;
}

export interface UserRepository extends BaseRepository<UserRecord, CreateUserInput> {
  findByEmail(email: string): Promise<UserRecord | null>;
  verifyEmail(email: string, codeHash: string): Promise<UserRecord | null>;
  updateVerification(email: string, codeHash: string, expiresAt: Date): Promise<boolean>;
}
