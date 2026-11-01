import { AppError } from '../errors/app-error.js';
import type { TokenRepository } from '../repositories/interfaces/token.repository.interface.js';
import type { UserRepository } from '../repositories/interfaces/user.repository.interface.js';
import type {
  PasswordService,
  TokenClaims,
  TokenService,
} from './interfaces/auth-services.interface.js';
import { toSafeUser, type SafeUser, type UserRecord, type UserRole } from '../types/user.types.js';
import type { LoginInput, RegisterInput } from '../validators/user.validator.js';

export interface AuthResult {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: 900;
  user: SafeUser;
}

export class UserService {
  constructor(
    private readonly users: UserRepository,
    private readonly tokens: TokenRepository,
    private readonly passwords: PasswordService,
    private readonly jwt: TokenService,
  ) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    if (await this.users.findByEmail(input.email))
      throw new AppError(409, 'EMAIL_IN_USE', 'An account with this email already exists');
    const user = await this.users.add({
      email: input.email,
      name: input.name,
      passwordHash: await this.passwords.hash(input.password),
    });
    return this.createResult(user);
  }

  async login(input: LoginInput, requiredRole?: UserRole): Promise<AuthResult> {
    const user = await this.users.findByEmail(input.email);
    const valid = user ? await this.passwords.compare(input.password, user.passwordHash) : false;
    if (!user || !valid || (requiredRole && user.role !== requiredRole)) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
    }
    return this.createResult(user);
  }

  async getCurrentUser(claims: TokenClaims): Promise<SafeUser> {
    if (await this.tokens.isRevoked(claims.jti))
      throw new AppError(401, 'INVALID_TOKEN', 'Access token is invalid');
    const user = await this.users.findById(claims.sub);
    if (!user) throw new AppError(401, 'INVALID_TOKEN', 'Access token is invalid');
    return toSafeUser(user);
  }

  async logout(claims: TokenClaims): Promise<void> {
    await this.tokens.revoke(claims.jti, new Date(claims.exp * 1000));
  }

  private createResult(user: UserRecord): AuthResult {
    return {
      accessToken: this.jwt.sign(user.id, user.role),
      tokenType: 'Bearer',
      expiresIn: 900,
      user: toSafeUser(user),
    };
  }
}
