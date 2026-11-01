import type { UserRecord } from '../interfaces/user.interface.js';

export interface CreateUserInput {
  email: string;
  name: string;
  passwordHash: string;
}

export interface UserRepository {
  create(input: CreateUserInput): Promise<UserRecord>;
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
}
