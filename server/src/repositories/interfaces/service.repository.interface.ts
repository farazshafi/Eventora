import type { ServiceRecord, ServiceCategory } from '../../types/service.types.js';

export type ServiceFields = Omit<
  ServiceRecord,
  'id' | 'slug' | 'createdBy' | 'createdAt' | 'updatedAt'
>;
export type CreateServiceInput = ServiceFields & { title: string; createdBy: string };
export type UpdateServiceInput = Partial<ServiceFields> & { title?: string };

export interface ServiceFilters {
  search?: string;
  category?: ServiceCategory;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: Date;
  endDate?: Date;
  sortBy: 'price' | 'title' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface ServiceSearchPage {
  services: ServiceRecord[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
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
  browse(filters: ServiceFilters): Promise<ServiceSearchPage>;
  findByCreator(createdBy: string, page: number, limit: number): Promise<ServicePage>;
  updateOwned(
    id: string,
    createdBy: string,
    updates: UpdateServiceInput,
    slug?: string,
  ): Promise<ServiceRecord | null>;
  deleteOwned(id: string, createdBy: string): Promise<boolean>;
}
