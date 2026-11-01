import mongoose from 'mongoose';
import type { HealthReadiness } from '../interfaces/health.interface.js';
import type { HealthRepository } from './health.repository.interface.js';

export class MongoHealthRepository implements HealthRepository {
  getStatus(): HealthReadiness {
    const databaseReady = mongoose.connection.readyState === 1;
    return {
      status: databaseReady ? 'ok' : 'unavailable',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: databaseReady ? 'ready' : 'unavailable',
    };
  }
}
