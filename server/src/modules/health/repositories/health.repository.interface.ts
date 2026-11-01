import type { HealthReadiness } from '../interfaces/health.interface.js';
export interface HealthRepository {
  getStatus(): HealthReadiness;
}
