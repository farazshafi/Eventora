import type { HealthRepository } from '../repositories/health.repository.interface.js';
import type { HealthReadiness } from '../interfaces/health.interface.js';
export class GetHealthStatusService {
  constructor(private readonly healthRepository: HealthRepository) {}
  execute(): HealthReadiness {
    return this.healthRepository.getStatus();
  }
}
