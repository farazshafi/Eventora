import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';
import type { UserRole } from '../types/user.types.js';

export function authorizeRole(...roles: UserRole[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.auth)
      return next(new AppError(401, 'UNAUTHENTICATED', 'Authentication is required'));
    if (!roles.includes(request.auth.role))
      return next(new AppError(403, 'FORBIDDEN', 'You are not allowed to access this resource'));
    next();
  };
}
