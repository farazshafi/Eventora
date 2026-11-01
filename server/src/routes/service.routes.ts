import { Router } from 'express';
import type { ServiceController } from '../controllers/service.controller.js';
import { createAuthenticate } from '../middleware/auth.middleware.js';
import { authorizeRole } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validate-request.js';
import type { TokenRepository } from '../repositories/interfaces/token.repository.interface.js';
import type { TokenService } from '../services/interfaces/auth-services.interface.js';
import { browseServicesSchema, createServiceSchema, mineServicesSchema, serviceIdParamsSchema, updateServiceSchema } from '../validators/service.validator.js';

export function createServiceRouter(controller: ServiceController, tokens: TokenRepository, jwt: TokenService): Router {
  const router = Router();
  const authenticate = createAuthenticate(jwt, tokens);
  const admin = [authenticate, authorizeRole('ADMIN')];
  router.post('/', ...admin, validateRequest({ body: createServiceSchema }), controller.create);
  router.get('/', validateRequest({ query: browseServicesSchema }), controller.browse);
  router.get('/admin/mine', ...admin, validateRequest({ query: mineServicesSchema }), controller.mine);
  router.get('/:id', validateRequest({ params: serviceIdParamsSchema }), controller.get);
  router.patch('/:id', ...admin, validateRequest({ params: serviceIdParamsSchema, body: updateServiceSchema }), controller.update);
  router.delete('/:id', ...admin, validateRequest({ params: serviceIdParamsSchema }), controller.delete);
  return router;
}
