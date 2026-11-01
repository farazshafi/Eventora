import type { RequestHandler } from 'express';
import { AppError } from '../../../core/errors/app-error.js';
import type { TokenService } from '../interfaces/token.interface.js';
import type { TokenRepository } from '../repositories/token.repository.interface.js';

declare global {
  interface AuthenticatedPrincipal {
    sub: string;
    role: 'USER' | 'ADMIN';
    jti: string;
    exp: number;
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthenticatedPrincipal;
  }
}

export function createAuthenticate(
  tokenService: TokenService,
  tokenRepository: TokenRepository,
): RequestHandler {
  return async (request, _response, next) => {
    try {
      const authorization = request.header('authorization');
      const match = authorization?.match(/^Bearer\s+([^\s]+)$/i);
      if (!match?.[1]) throw new AppError(401, 'UNAUTHENTICATED', 'Authentication is required');
      const claims = tokenService.verify(match[1]);
      if (await tokenRepository.isRevoked(claims.jti))
        throw new AppError(401, 'INVALID_TOKEN', 'Access token is invalid');
      request.auth = claims;
      next();
    } catch (error) {
      next(
        error instanceof AppError
          ? error
          : new AppError(401, 'INVALID_TOKEN', 'Access token is invalid'),
      );
    }
  };
}
