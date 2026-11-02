export interface TokenRepository {
  isRevoked(jti: string): Promise<boolean>;
  revoke(jti: string, expiresAt: Date): Promise<void>;
  storeRefresh(
    tokenHash: string,
    userId: string,
    role: 'USER' | 'ADMIN',
    expiresAt: Date,
  ): Promise<void>;
  consumeRefresh(tokenHash: string): Promise<{ userId: string; role: 'USER' | 'ADMIN' } | null>;
  revokeRefresh(tokenHash: string): Promise<void>;
}
