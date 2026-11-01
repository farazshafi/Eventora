import { RevokedTokenModel } from '../models/revoked-token.model.js';
import type { TokenRepository } from './token.repository.interface.js';

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
}
