import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelBooking, createBooking, getMyBookings } from '../api/booking.api';
import { getService } from '../api/service.api';
import type { Booking } from '../types/booking.types';
import type { BookingContactInput } from '../schemas/booking.schema';

export function useBookings(period: 'upcoming' | 'past' | 'all' = 'upcoming', page = 1) {
  return useQuery({
    queryKey: ['bookings', period, page],
    queryFn: () => getMyBookings(period, page),
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useBookingServices(bookings: Booking[] = []) {
  return useQueries({
    queries: bookings.map((booking) => ({
      queryKey: ['service', booking.serviceId],
      queryFn: () => getService(booking.serviceId),
      staleTime: 60_000,
    })),
  });
}

export function useBookingById(id: string | null, prior?: Booking) {
  return useQuery({
    queryKey: ['booking-confirmation', id],
    queryFn: async () => {
      if (!id) return null;
      let page = 1;
      let totalPages = 1;
      while (page <= totalPages) {
        const result = await getMyBookings('all', page);
        const found = result.items.find((item) => item.id === id);
        if (found) return found;
        totalPages = result.totalPages;
        page += 1;
      }
      return null;
    },
    enabled: Boolean(id),
    initialData: prior?.id === id ? prior : undefined,
  });
}

export function useCreateBooking(
  serviceId: string,
  onSuccess: (booking: Awaited<ReturnType<typeof createBooking>>) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { startDate: string; endDate: string; contact?: BookingContactInput }) =>
      createBooking({ ...input, serviceId }),
    onSuccess: (booking) => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      onSuccess(booking);
    },
  });
}
