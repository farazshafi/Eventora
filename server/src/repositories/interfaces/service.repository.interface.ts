import type { ServiceRecord, ServiceCategory } from '../../types/service.types.js';

export type ServiceFields = Omit<ServiceRecord, 'id' | 'slug' | 'createdBy' | 'createdAt' | 'updatedAt'>;
export type CreateServiceInput = ServiceFields & { title: string; createdBy: string };
export type UpdateServiceInput = Partial<ServiceFields> & { title?: string };

export interface ServiceFilters {
  category?: ServiceCategory;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  limit: number;
}

export interface ServicePage {
  items: ServiceRecord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ServiceRepository {
  create(input: CreateServiceInput, slug: string): Promise<ServiceRecord>;
  findById(id: string): Promise<ServiceRecord | null>;
  browse(filters: ServiceFilters): Promise<ServicePage>;
  findByCreator(createdBy: string, page: number, limit: number): Promise<ServicePage>;
  updateOwned(id: string, createdBy: string, updates: UpdateServiceInput, slug?: string): Promise<ServiceRecord | null>;
  deleteOwned(id: string, createdBy: string): Promise<boolean>;
}
