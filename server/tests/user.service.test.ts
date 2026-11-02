import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../src/errors/app-error.js';
import type { TokenClaims, UserRecord } from '../src/types/user.types.js';
import type { UserRepository } from '../src/repositories/interfaces/user.repository.interface.js';
import type { TokenRepository } from '../src/repositories/interfaces/token.repository.interface.js';
import type {
  PasswordService,
  TokenService,
  EmailService,
} from '../src/services/interfaces/auth-services.interface.js';
import { UserService } from '../src/services/user.service.js';
import { registerSchema } from '../src/validators/user.validator.js';

const createUser = (role: 'USER' | 'ADMIN' = 'USER'): UserRecord => ({
  id: 'user-1',
  email: 'person@example.com',
  name: 'Person',
  passwordHash: 'hashed-password',
  role,
  createdAt: new Date('2026-01-01'),
});

function setup(role: 'USER' | 'ADMIN' = 'USER') {
  const user = createUser(role);
  const users: UserRepository = {
    add: vi.fn(async (input) => ({
      ...user,
      email: input.email,
      name: input.name,
      passwordHash: input.passwordHash,
      role: 'USER',
    })),
    updateById: vi.fn(async () => null),
    removeById: vi.fn(async () => false),
    findByEmail: vi.fn(async () => user),
    findById: vi.fn(async () => user),
    verifyEmail: vi.fn(async () => ({ ...user, emailVerified: true })),
  };
  const tokens: TokenRepository = {
    isRevoked: vi.fn(async () => false),
    revoke: vi.fn(async () => {}),
    storeRefresh: vi.fn(async () => {}),
    consumeRefresh: vi.fn(async () => ({ userId: user.id, role: user.role })),
    revokeRefresh: vi.fn(async () => {}),
  };
  const passwords: PasswordService = {
    hash: vi.fn(async () => 'hashed-password'),
    compare: vi.fn(async () => true),
  };
  const jwt: TokenService = { sign: vi.fn(() => 'signed-token'), verify: vi.fn() };
  const email: EmailService = { send: vi.fn(async () => {}) };
  return {
    service: new UserService(users, tokens, passwords, jwt, email),
    users,
    tokens,
    passwords,
    jwt,
    email,
    user,
  };
}

describe('UserService authentication', () => {
  it('hashes passwords, creates unverified USER accounts, and emails an expiring code', async () => {
    const { service, users, passwords, email } = setup();
    vi.mocked(users.findByEmail).mockResolvedValue(null);
    const result = await service.register({
      email: 'person@example.com',
      name: 'Person',
      password: 'long-secure-password',
    });
    expect(passwords.hash).toHaveBeenCalledWith('long-secure-password');
    expect(users.add).toHaveBeenCalledWith(
      expect.objectContaining({ passwordHash: 'hashed-password' }),
    );
    expect(users.add).toHaveBeenCalledWith(
      expect.objectContaining({
        emailVerified: false,
        verificationCodeHash: expect.any(String),
        verificationExpiresAt: expect.any(Date),
      }),
    );
    expect(email.send).toHaveBeenCalledWith(
      'person@example.com',
      expect.any(String),
      expect.stringMatching(/\d{6}/),
    );
    expect(result).toEqual({ verificationRequired: true });
  });

  it('rejects public attempts to pass a role', () => {
    expect(() =>
      registerSchema.parse({
        email: 'person@example.com',
        name: 'Person',
        password: 'long-secure-password',
        role: 'ADMIN',
      }),
    ).toThrow();
  });

  it('allows admin login only for ADMIN users and uses generic credential errors', async () => {
    const regular = setup('USER');
    await expect(
      regular.service.login({ email: 'person@example.com', password: 'password' }, 'ADMIN'),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    const admin = setup('ADMIN');
    await expect(
      admin.service.login({ email: 'person@example.com', password: 'password' }, 'ADMIN'),
    ).resolves.toMatchObject({ user: { role: 'ADMIN' } });
    const missing = setup();
    vi.mocked(missing.users.findByEmail).mockResolvedValue(null);
    await expect(
      missing.service.login({ email: 'missing@example.com', password: 'password' }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
  });

  it('revokes logout bearer tokens until their expiry', async () => {
    const { service, tokens } = setup();
    const claims: TokenClaims = {
      sub: 'user-1',
      role: 'USER',
      jti: 'token-id',
      exp: 1_900_000_000,
    };
    await service.logout(claims);
    expect(tokens.revoke).toHaveBeenCalledWith('token-id', new Date(claims.exp * 1000));
  });

  it('returns the current profile without exposing the password hash', async () => {
    const { service, user } = setup();
    await expect(
      service.getCurrentUser({ sub: user.id, role: user.role, jti: 'active', exp: 1_900_000_000 }),
    ).resolves.toEqual({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    });
  });

  it('rejects revoked access tokens when resolving the current user', async () => {
    const { service, tokens } = setup();
    vi.mocked(tokens.isRevoked).mockResolvedValue(true);
    await expect(
      service.getCurrentUser({ sub: 'user-1', role: 'USER', jti: 'revoked', exp: 1_900_000_000 }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
