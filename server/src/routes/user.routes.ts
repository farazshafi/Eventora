import { Router } from 'express';
import { validateRequest } from '../middleware/validate-request.js';
import type { UserController } from '../controllers/user.controller.js';
import { createAuthenticate } from '../middleware/auth.middleware.js';
import { loginSchema, registerSchema } from '../validators/user.validator.js';
import type { TokenRepository } from '../repositories/interfaces/token.repository.interface.js';
import type { TokenService } from '../services/interfaces/auth-services.interface.js';

export function createUserRouter(
  controller: UserController,
  tokens: TokenRepository,
  jwt: TokenService,
): Router {
  const router = Router();
  const authenticate = createAuthenticate(jwt, tokens);
  router.post('/register', validateRequest({ body: registerSchema }), controller.register);
  router.post('/login', validateRequest({ body: loginSchema }), controller.login);
  router.post('/admin/login', validateRequest({ body: loginSchema }), controller.adminLogin);
  router.get('/me', authenticate, controller.me);
  router.post('/logout', authenticate, controller.logout);
  return router;
}
