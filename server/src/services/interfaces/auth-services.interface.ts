import type { UserRole } from '../../types/user.types.js';

export interface TokenClaims {
  sub: string;
  role: UserRole;
  jti: string;
  exp: number;
}

export interface TokenService {
  sign(userId: string, role: UserRole): string;
  verify(token: string): TokenClaims;
}

export interface PasswordService {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}
export interface EmailService {
  send(to: string, subject: string, text: string): Promise<void>;
}
