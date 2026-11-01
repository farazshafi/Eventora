export interface TokenRepository {
  isRevoked(jti: string): Promise<boolean>;
  revoke(jti: string, expiresAt: Date): Promise<void>;
}
