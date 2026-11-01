import { Router } from 'express';

export function createApiRouter(healthRouter: Router, authRouter: Router): Router {
  const router = Router();
  router.use('/health', healthRouter);
  router.use('/auth', authRouter);
  return router;
}
