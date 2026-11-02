import { axiosInstance, getData } from './axios';
import type { ApiSuccess } from '../types/api.types';
import type {
  AdminServicePage,
  Service,
  ServiceCategory,
  ServicePage,
} from '../types/service.types';

export interface ServiceFilters {
  search?: string;
  category?: ServiceCategory;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'price' | 'title' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export function browseServices(filters: ServiceFilters = {}) {
  return getData(
    axiosInstance.get<ApiSuccess<ServicePage>>('/services', {
      params: { sortBy: 'createdAt', sortOrder: 'desc', limit: 12, ...filters },
    }),
  );
}

export const getService = (id: string) =>
  getData(axiosInstance.get<ApiSuccess<Service>>(`/services/${encodeURIComponent(id)}`));

export const getAdminServicesPage = (page = 1, limit = 100) =>
  getData(
    axiosInstance.get<ApiSuccess<AdminServicePage>>('/services/admin/mine', {
      params: { page, limit },
      requiresAuth: true,
    }),
  );

export type ManagedServiceInput = Omit<
  Service,
  'id' | 'slug' | 'createdBy' | 'createdAt' | 'updatedAt'
>;
export const createService = (input: ManagedServiceInput) =>
  getData(axiosInstance.post<ApiSuccess<Service>>('/services', input, { requiresAuth: true }));
export const updateService = (id: string, input: ManagedServiceInput) =>
  getData(
    axiosInstance.patch<ApiSuccess<Service>>(`/services/${encodeURIComponent(id)}`, input, {
      requiresAuth: true,
    }),
  );
export async function uploadServiceImages(files: File[]): Promise<string[]> {
  const form = new FormData();
  files.forEach((file) => form.append('images', file));
  return getData(
    axiosInstance.post<ApiSuccess<{ images: string[] }>>('/services/images', form, {
      requiresAuth: true,
    }),
  ).then((result) => result.images);
}
export const deleteService = (id: string) =>
  getData(
    axiosInstance.delete<ApiSuccess<{ message: string }>>(`/services/${encodeURIComponent(id)}`, {
      requiresAuth: true,
    }),
  );

export async function checkServiceAvailability(id: string, startDate: string, endDate: string) {
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const results = await browseServices({ startDate, endDate, page, limit: 100 });
    if (results.services.some((service) => service.id === id)) return true;
    totalPages = results.totalPages;
    page += 1;
  }
  return false;
}
