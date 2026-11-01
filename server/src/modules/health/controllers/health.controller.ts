import type { Request, Response } from 'express';
import type { Controller } from '../../../core/interfaces/controller.interface.js';
import { AppError } from '../../../core/errors/app-error.js';
import { sendSuccess } from '../../../core/utils/response.js';
import type { GetHealthStatusService } from '../services/get-health-status.service.js';
export class HealthController implements Controller {
  constructor(private readonly getHealthStatus: GetHealthStatusService) {}
  async handle(_request: Request, response: Response): Promise<void> {
    const status = this.getHealthStatus.execute();
    if (status.database !== 'ready') {
      throw new AppError(503, 'SERVICE_UNAVAILABLE', 'Database is not ready', status);
    }
    sendSuccess(response, status);
  }
}
