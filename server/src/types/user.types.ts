export type UserRole = 'USER' | 'ADMIN';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  emailVerified?: boolean;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export function toSafeUser(user: UserRecord): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}
