import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAdminBookingsPage,
  setAdminBookingStatus,
  type AdminBookingFilters,
} from '../api/booking.api';
import type { Booking, BookingStatus } from '../types/booking.types';

async function getAllBookings(): Promise<Booking[]> {
  const first = await getAdminBookingsPage(1, 100);
  const items = [...first.items];
  for (let page = 2; page <= first.totalPages; page += 1) {
    items.push(...(await getAdminBookingsPage(page, 100)).items);
  }
  return items;
}

export function useAdminBookings() {
  return useQuery({ queryKey: ['admin', 'bookings'], queryFn: getAllBookings });
}

export function useAdminBookingsPage(page: number, filters: AdminBookingFilters) {
  return useQuery({
    queryKey: ['admin', 'bookings', 'page', page, filters],
    queryFn: () => getAdminBookingsPage(page, 10, filters),
  });
}

export function useSetAdminBookingStatus() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      setAdminBookingStatus(id, status),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'bookings'] }),
  });
}
