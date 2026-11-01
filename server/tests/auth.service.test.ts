import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../src/core/errors/app-error.js';
import type { UserRecord } from '../src/modules/users/interfaces/user.interface.js';
import type { UserRepository } from '../src/modules/users/repositories/user.repository.interface.js';
import type {
  PasswordService,
  TokenClaims,
  TokenService,
} from '../src/modules/auth/interfaces/token.interface.js';
import type { TokenRepository } from '../src/modules/auth/repositories/token.repository.interface.js';
import { AuthService } from '../src/modules/auth/services/auth.service.js';
import { registerSchema } from '../src/modules/auth/validators/auth.validator.js';

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
    create: vi.fn(async (input) => ({
      ...user,
      email: input.email,
      name: input.name,
      passwordHash: input.passwordHash,
      role: 'USER',
    })),
    findByEmail: vi.fn(async () => user),
    findById: vi.fn(async () => user),
  };
  const tokens: TokenRepository = {
    isRevoked: vi.fn(async () => false),
    revoke: vi.fn(async () => {}),
  };
  const passwords: PasswordService = {
    hash: vi.fn(async () => 'hashed-password'),
    compare: vi.fn(async () => true),
  };
  const jwt: TokenService = { sign: vi.fn(() => 'signed-token'), verify: vi.fn() };
  return {
    service: new AuthService(users, tokens, passwords, jwt),
    users,
    tokens,
    passwords,
    jwt,
    user,
  };
}

describe('AuthService', () => {
  it('hashes passwords, creates only USER accounts, and omits hashes from output', async () => {
    const { service, users, passwords } = setup();
    vi.mocked(users.findByEmail).mockResolvedValue(null);
    const result = await service.register({
      email: 'person@example.com',
      name: 'Person',
      password: 'long-secure-password',
    });
    expect(passwords.hash).toHaveBeenCalledWith('long-secure-password');
    expect(users.create).toHaveBeenCalledWith(
      expect.objectContaining({ passwordHash: 'hashed-password' }),
    );
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result.user.role).toBe('USER');
    expect(result.expiresIn).toBe(900);
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

  it('rejects revoked access tokens when resolving the current user', async () => {
    const { service, tokens } = setup();
    vi.mocked(tokens.isRevoked).mockResolvedValue(true);
    await expect(
      service.getCurrentUser({ sub: 'user-1', role: 'USER', jti: 'revoked', exp: 1_900_000_000 }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
