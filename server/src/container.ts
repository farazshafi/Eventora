import { HealthController } from './modules/health/controllers/health.controller.js';
import { MongoHealthRepository } from './modules/health/repositories/health.repository.js';
import { GetHealthStatusService } from './modules/health/services/get-health-status.service.js';
import { createHealthRouter } from './modules/health/routes/health.routes.js';
import { createApiRouter } from './routes/index.js';

const healthRepository = new MongoHealthRepository();
const getHealthStatus = new GetHealthStatusService(healthRepository);
const healthController = new HealthController(getHealthStatus);

export const healthRouter = createHealthRouter(healthController);
export const apiRouter = createApiRouter(healthRouter);
