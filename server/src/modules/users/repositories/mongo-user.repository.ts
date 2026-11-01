import { UserModel } from '../models/user.model.js';
import type { UserRecord } from '../interfaces/user.interface.js';
import type { CreateUserInput, UserRepository } from './user.repository.interface.js';

function mapUser(user: {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
}): UserRecord {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    passwordHash: user.passwordHash,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export class MongoUserRepository implements UserRepository {
  async create(input: CreateUserInput): Promise<UserRecord> {
    const user = await UserModel.create({ ...input, role: 'USER' });
    return mapUser({ id: user.id, ...input, role: user.role, createdAt: user.createdAt });
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await UserModel.findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .lean();
    return user
      ? mapUser({ id: String(user._id), ...user, role: user.role as 'USER' | 'ADMIN' })
      : null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const user = await UserModel.findById(id).lean();
    return user
      ? mapUser({
          id: String(user._id),
          ...user,
          passwordHash: '',
          role: user.role as 'USER' | 'ADMIN',
        })
      : null;
  }
}
