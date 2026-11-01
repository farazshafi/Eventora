import { Types } from 'mongoose';
import { AppError } from '../errors/app-error.js';
import type { ServiceRecord } from '../types/service.types.js';
import type { CreateServiceInput, ServiceFilters, ServicePage, ServiceRepository, UpdateServiceInput } from '../repositories/interfaces/service.repository.interface.js';

export class ServiceService {
  constructor(private readonly services: ServiceRepository) {}
  async create(input: Omit<CreateServiceInput, 'createdBy'>, adminId: string): Promise<ServiceRecord> {
    return this.persist(() => this.services.create({ ...input, createdBy: adminId }, slugify(input.title)));
  }
  browse(filters: ServiceFilters): Promise<ServicePage> { return this.services.browse(filters); }
  async get(id: string): Promise<ServiceRecord> {
    const service = await this.services.findById(id);
    if (!service) throw new AppError(404, 'SERVICE_NOT_FOUND', 'Service was not found');
    return service;
  }
  mine(adminId: string, page: number, limit: number): Promise<ServicePage> { return this.services.findByCreator(adminId, page, limit); }
  async update(id: string, adminId: string, updates: UpdateServiceInput): Promise<ServiceRecord> {
    const service = await this.persist(() => this.services.updateOwned(id, adminId, updates, updates.title === undefined ? undefined : slugify(updates.title)));
    if (!service) throw new AppError(404, 'SERVICE_NOT_FOUND', 'Service was not found');
    return service;
  }
  async delete(id: string, adminId: string): Promise<void> {
    if (!await this.services.deleteOwned(id, adminId)) throw new AppError(404, 'SERVICE_NOT_FOUND', 'Service was not found');
  }
  private async persist<T>(action: () => Promise<T>): Promise<T> {
    try { return await action(); }
    catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000)
        throw new AppError(409, 'SLUG_IN_USE', 'A service with this title already exists');
      if (error instanceof Error && error.name === 'CastError') throw new AppError(400, 'INVALID_SERVICE_ID', 'Service id is invalid');
      throw error;
    }
  }
}

export function slugify(title: string): string {
  const slug = title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120).replace(/-+$/g, '');
  return slug || `service-${new Types.ObjectId().toString()}`;
}
