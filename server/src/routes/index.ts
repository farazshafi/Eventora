import { Router } from 'express';

export function createApiRouter(healthRouter: Router): Router {
  const router = Router();
  router.use('/health', healthRouter);
  return router;
}
