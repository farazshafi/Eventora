import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createService,
  deleteService,
  getAdminServicesPage,
  updateService,
  type ManagedServiceInput,
  type AdminServiceFilters,
} from '../api/service.api';
import type { Service } from '../types/service.types';

async function getAllServices(): Promise<Service[]> {
  const first = await getAdminServicesPage(1, 100);
  const items = [...first.items];
  for (let page = 2; page <= first.totalPages; page += 1) {
    items.push(...(await getAdminServicesPage(page, 100)).items);
  }
  return items;
}

export function useAdminServices() {
  return useQuery({ queryKey: ['admin', 'services'], queryFn: getAllServices });
}

export function useAdminServicesPage(page: number, filters: AdminServiceFilters) {
  return useQuery({
    queryKey: ['admin', 'services', 'page', page, filters],
    queryFn: () => getAdminServicesPage(page, 10, filters),
  });
}

export function useCreateAdminService() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: ManagedServiceInput) => createService(input),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'services'] }),
  });
}

export function useUpdateAdminService() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ManagedServiceInput }) =>
      updateService(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'services'] }),
  });
}

export function useDeleteAdminService() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'services'] }),
  });
}
