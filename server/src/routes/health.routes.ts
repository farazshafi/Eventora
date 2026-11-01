import { Router } from 'express';
import mongoose from 'mongoose';
import { sendSuccess } from '../utils/response.js';

export function createHealthRouter(): Router {
  const router = Router();
  router.get('/', (_request, response) => {
    const databaseReady = mongoose.connection.readyState === 1;
    const status = {
      status: databaseReady ? 'ok' : 'unavailable',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: databaseReady ? 'ready' : 'unavailable',
    } as const;
    if (!databaseReady) {
      response.status(503).json({
        success: false,
        error: { code: 'SERVICE_UNAVAILABLE', message: 'Database is not ready', details: status },
      });
      return;
    }
    sendSuccess(response, status);
  });
  return router;
}
