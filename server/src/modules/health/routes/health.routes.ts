import { Router } from 'express';
import { asyncHandler } from '../../../core/utils/async-handler.js';
import { HealthController } from '../controllers/health.controller.js';

export function createHealthRouter(controller: HealthController): Router {
  const router = Router();
  router.get(
    '/',
    asyncHandler((request, response) => controller.handle(request, response)),
  );
  return router;
}
