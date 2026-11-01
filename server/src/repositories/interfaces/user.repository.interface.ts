import type { UserRecord } from '../../types/user.types.js';
import type { BaseRepository } from './base.repository.interface.js';

export interface CreateUserInput {
  email: string;
  name: string;
  passwordHash: string;
}

export interface UserRepository extends BaseRepository<UserRecord, CreateUserInput> {
  findByEmail(email: string): Promise<UserRecord | null>;
}
