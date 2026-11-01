import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { apiRouter, healthRouter } from './container.js';
import { errorHandler } from './core/errors/error-handler.js';
import { apiRateLimit } from './core/middleware/api-rate-limit.middleware.js';
import { notFoundHandler } from './core/middleware/not-found.middleware.js';
import { requestLogger } from './core/middleware/request-logger.middleware.js';

export const app = express();
app.use(requestLogger);
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use(express.json());
app.use('/api/health', healthRouter);
app.use('/api', apiRateLimit, apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
