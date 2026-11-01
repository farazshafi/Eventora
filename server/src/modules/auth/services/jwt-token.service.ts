import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../../../config/env.js';
import type { UserRole } from '../../users/interfaces/user.interface.js';
import type { TokenClaims, TokenService } from '../interfaces/token.interface.js';

export class JwtTokenService implements TokenService {
  sign(userId: string, role: UserRole): string {
    return jwt.sign({ role }, env.JWT_SECRET, {
      subject: userId,
      jwtid: randomUUID(),
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      expiresIn: '15m',
    });
  }

  verify(token: string): TokenClaims {
    const payload = jwt.verify(token, env.JWT_SECRET, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    });
    if (
      typeof payload === 'string' ||
      !payload.sub ||
      !payload.jti ||
      !payload.exp ||
      (payload.role !== 'USER' && payload.role !== 'ADMIN')
    ) {
      throw new Error('Invalid access token claims');
    }
    return { sub: payload.sub, jti: payload.jti, exp: payload.exp, role: payload.role };
  }
}
