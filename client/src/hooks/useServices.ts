import { useQuery } from '@tanstack/react-query';
import {
  browseServices,
  checkServiceAvailability,
  getService,
  type ServiceFilters,
} from '../api/service.api';

export function useServices(filters: ServiceFilters = {}, page = 1, key: string | null = null) {
  return useQuery({
    queryKey: ['services', key ?? filters, page],
    queryFn: () => browseServices({ ...filters, page }),
  });
}

export function useFeaturedServices() {
  return useQuery({
    queryKey: ['services', 'featured'],
    queryFn: () => browseServices({ limit: 3, sortBy: 'createdAt', sortOrder: 'desc' }),
  });
}

export function useService(id: string, enabled = true) {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => getService(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useServiceAvailability(id: string, startDate: string, endDate: string) {
  const enabled = Boolean(id && startDate && endDate && startDate <= endDate);
  return useQuery({
    queryKey: ['availability', id, startDate, endDate],
    queryFn: () => checkServiceAvailability(id, startDate, endDate),
    enabled,
  });
}
