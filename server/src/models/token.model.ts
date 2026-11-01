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
