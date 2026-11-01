import { afterEach, describe, expect, it, vi } from 'vitest';
import { UserModel } from '../src/models/user.model.js';
import { RevokedTokenModel } from '../src/models/token.model.js';
import { MongoTokenRepository } from '../src/repositories/token.repository.js';
import { MongoUserRepository } from '../src/repositories/user.repository.js';

afterEach(() => vi.restoreAllMocks());

describe('MongoUserRepository', () => {
  it('creates public users with the USER role through the base add operation', async () => {
    const input = {
      email: 'person@example.com',
      name: 'Person',
      passwordHash: 'hashed-password',
    };
    const create = vi.spyOn(UserModel, 'create').mockResolvedValue({
      ...input,
      id: 'user-1',
      role: 'USER',
      createdAt: new Date('2026-01-01'),
    } as never);

    await expect(new MongoUserRepository().add(input)).resolves.toMatchObject({
      id: 'user-1',
      role: 'USER',
      passwordHash: 'hashed-password',
    });
    expect(create).toHaveBeenCalledWith({ ...input, role: 'USER' });
  });

  it('selects password hashes only for email lookups', async () => {
    const createdAt = new Date('2026-01-01');
    const lean = vi.fn().mockResolvedValue({
      _id: 'user-1',
      email: 'person@example.com',
      name: 'Person',
      passwordHash: 'hashed-password',
      role: 'USER',
      createdAt,
    });
    const select = vi.fn(() => ({ lean }));
    const findOne = vi.spyOn(UserModel, 'findOne').mockReturnValue({ select } as never);

    await expect(
      new MongoUserRepository().findByEmail('PERSON@example.com'),
    ).resolves.toMatchObject({ id: 'user-1', passwordHash: 'hashed-password' });
    expect(findOne).toHaveBeenCalledWith({ email: 'person@example.com' });
    expect(select).toHaveBeenCalledWith('+passwordHash');
  });
});

describe('MongoTokenRepository', () => {
  it('keeps revocation as an idempotent upsert', async () => {
    const updateOne = vi.spyOn(RevokedTokenModel, 'updateOne').mockResolvedValue({} as never);
    const expiresAt = new Date('2026-12-01T00:00:00.000Z');

    await new MongoTokenRepository().revoke('token-id', expiresAt);

    expect(updateOne).toHaveBeenCalledWith(
      { jti: 'token-id' },
      { $setOnInsert: { jti: 'token-id', expiresAt } },
      { upsert: true },
    );
  });
});
