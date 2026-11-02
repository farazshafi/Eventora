import { model, Schema } from 'mongoose';

export interface RevokedTokenDocument {
  jti: string;
  expiresAt: Date;
}

const revokedTokenSchema = new Schema<RevokedTokenDocument>(
  {
    jti: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { versionKey: false },
);
revokedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RevokedTokenModel = model<RevokedTokenDocument>('RevokedToken', revokedTokenSchema);

export interface RefreshTokenDocument {
  tokenHash: string;
  userId: string;
  role: 'USER' | 'ADMIN';
  expiresAt: Date;
}
const refreshTokenSchema = new Schema<RefreshTokenDocument>(
  {
    tokenHash: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    role: { type: String, enum: ['USER', 'ADMIN'], required: true },
    expiresAt: { type: Date, required: true },
  },
  { versionKey: false },
);
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const RefreshTokenModel = model<RefreshTokenDocument>('RefreshToken', refreshTokenSchema);
