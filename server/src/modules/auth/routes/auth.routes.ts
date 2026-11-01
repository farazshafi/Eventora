import { Router } from 'express';
import { asyncHandler } from '../../../core/utils/async-handler.js';
import { validateRequest } from '../../../core/middleware/validate-request.middleware.js';
import type { AuthController } from '../controllers/auth.controller.js';
import { createAuthenticate } from '../middleware/authenticate.middleware.js';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';
import type { TokenRepository } from '../repositories/token.repository.interface.js';
import type { TokenService } from '../interfaces/token.interface.js';

export function createAuthRouter(
  controller: AuthController,
  tokens: TokenRepository,
  jwt: TokenService,
): Router {
  const router = Router();
  const authenticate = createAuthenticate(jwt, tokens);
  router.post(
    '/register',
    validateRequest({ body: registerSchema }),
    asyncHandler(controller.register),
  );
  router.post('/login', validateRequest({ body: loginSchema }), asyncHandler(controller.login));
  router.post(
    '/admin/login',
    validateRequest({ body: loginSchema }),
    asyncHandler(controller.adminLogin),
  );
  router.get('/me', authenticate, asyncHandler(controller.me));
  router.post('/logout', authenticate, asyncHandler(controller.logout));
  return router;
}
