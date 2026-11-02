import { RefreshTokenModel, RevokedTokenModel } from '../models/token.model.js';
import type { TokenRepository } from './interfaces/token.repository.interface.js';

export class MongoTokenRepository implements TokenRepository {
  async isRevoked(jti: string): Promise<boolean> {
    return (await RevokedTokenModel.exists({ jti })) !== null;
  }

  async revoke(jti: string, expiresAt: Date): Promise<void> {
    await RevokedTokenModel.updateOne(
      { jti },
      { $setOnInsert: { jti, expiresAt } },
      { upsert: true },
    );
  }
  async storeRefresh(
    tokenHash: string,
    userId: string,
    role: 'USER' | 'ADMIN',
    expiresAt: Date,
  ): Promise<void> {
    await RefreshTokenModel.create({ tokenHash, userId, role, expiresAt });
  }
  async consumeRefresh(
    tokenHash: string,
  ): Promise<{ userId: string; role: 'USER' | 'ADMIN' } | null> {
    const item = await RefreshTokenModel.findOneAndDelete({
      tokenHash,
      expiresAt: { $gt: new Date() },
    })
      .lean()
      .exec();
    return item ? { userId: item.userId, role: item.role } : null;
  }
  async revokeRefresh(tokenHash: string): Promise<void> {
    await RefreshTokenModel.deleteOne({ tokenHash }).exec();
  }
}
