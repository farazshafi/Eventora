import bcrypt from 'bcryptjs';
import type { PasswordService } from '../interfaces/token.interface.js';

export class BcryptPasswordService implements PasswordService {
  hash(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
  compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
