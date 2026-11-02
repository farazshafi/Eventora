import { AppError } from '../errors/app-error.js';
import type { TokenRepository } from '../repositories/interfaces/token.repository.interface.js';
import type { UserRepository } from '../repositories/interfaces/user.repository.interface.js';
import type {
  PasswordService,
  TokenClaims,
  TokenService,
} from './interfaces/auth-services.interface.js';
import type { EmailService } from './interfaces/auth-services.interface.js';
import { createHash, randomInt, randomBytes } from 'node:crypto';
import { toSafeUser, type SafeUser, type UserRecord, type UserRole } from '../types/user.types.js';
import type { LoginInput, RegisterInput } from '../validators/user.validator.js';

export interface AuthResult {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: 900;
  refreshToken: string;
  refreshExpiresAt: Date;
  user: SafeUser;
}

export class UserService {
  constructor(
    private readonly users: UserRepository,
    private readonly tokens: TokenRepository,
    private readonly passwords: PasswordService,
    private readonly jwt: TokenService,
    private readonly email: EmailService,
  ) {}

  async register(input: RegisterInput): Promise<{ verificationRequired: true }> {
    if (await this.users.findByEmail(input.email))
      throw new AppError(409, 'EMAIL_IN_USE', 'An account with this email already exists');
    const code = String(randomInt(100000, 1000000));
    await this.email.send(
      input.email,
      'Verify your Eventora account',
      `Your Eventora verification code is ${code}. It expires in 10 minutes.`,
    );
    console.log("Code: ",code);
    await this.users.add({
      email: input.email,
      name: input.name,
      passwordHash: await this.passwords.hash(input.password),
      emailVerified: false,
      verificationCodeHash: hash(code),
      verificationExpiresAt: new Date(Date.now() + 10 * 60_000),
    });
    return { verificationRequired: true };
  }

  async verifyEmail(email: string, code: string): Promise<AuthResult> {
    const user = await this.users.verifyEmail(email, hash(code));
    if (!user)
      throw new AppError(400, 'INVALID_VERIFICATION_CODE', 'The code is invalid or expired');
    return this.createResult(user);
  }
  async resendVerification(email: string): Promise<{ sent: true }> {
    const code = String(randomInt(100000, 1000000));
    const expiresAt = new Date(Date.now() + 10 * 60_000);
    if (await this.users.updateVerification(email, hash(code), expiresAt))
      await this.email.send(
        email,
        'Verify your Eventora account',
        `Your new Eventora verification code is ${code}. It expires in 10 minutes.`,
      );
    return { sent: true };
  }

  async login(input: LoginInput, requiredRole?: UserRole): Promise<AuthResult> {
    const user = await this.users.findByEmail(input.email);
    const valid = user ? await this.passwords.compare(input.password, user.passwordHash) : false;
    if (!user || !valid || (requiredRole && user.role !== requiredRole)) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
    }
    if (user.role === 'USER' && !user.emailVerified)
      throw new AppError(403, 'EMAIL_NOT_VERIFIED', 'Verify your email before logging in');
    return this.createResult(user);
  }

  async refresh(rawToken: string): Promise<AuthResult> {
    const identity = await this.tokens.consumeRefresh(hash(rawToken));
    if (!identity)
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired');
    const user = await this.users.findById(identity.userId);
    if (!user || user.role !== identity.role)
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired');
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

  async logoutRefresh(rawToken?: string): Promise<void> {
    if (rawToken) await this.tokens.revokeRefresh(hash(rawToken));
  }

  private async createResult(user: UserRecord): Promise<AuthResult> {
    const refreshToken = randomBytes(48).toString('base64url');
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60_000);
    await this.tokens.storeRefresh(hash(refreshToken), user.id, user.role, refreshExpiresAt);
    return {
      accessToken: this.jwt.sign(user.id, user.role),
      tokenType: 'Bearer',
      expiresIn: 900,
      refreshToken,
      refreshExpiresAt,
      user: toSafeUser(user),
    };
  }
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
