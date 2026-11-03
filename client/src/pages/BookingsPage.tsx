import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ApiError } from '../api/axios';
import { EmptyState, ErrorNotice, LoadingCards } from '../components/common/States';
import { Button, ButtonLink } from '../components/ui/Button';
import { useBookingServices, useBookings, useCancelBooking } from '../hooks/useBookings';
import { BookingCard } from '../components/booking/BookingCard';
export default function BookingsPage() {
  const [params, setParams] = useSearchParams();
  const period = (params.get('period') as 'upcoming' | 'past' | 'all') || 'upcoming';
  const requestedPage = Number(params.get('page') || 1);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const bookings = useBookings(period, page);
  const services = useBookingServices(bookings.data?.items);
  const cancel = useCancelBooking();
  useEffect(() => {
    if (bookings.data && page > Math.max(1, bookings.data.totalPages)) {
      const targetPage = Math.max(1, bookings.data.totalPages);
      setParams({
        ...(period === 'upcoming' ? {} : { period }),
        ...(targetPage === 1 ? {} : { page: String(targetPage) }),
      });
    }
  }, [bookings.data, page, period, setParams]);
  return (
    <main className="mx-auto max-w-6xl px-5 pb-12 pt-12 sm:px-8 sm:pt-16">
      <p className="eyebrow">Your plans at a glance</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#21382b]">
            My bookings
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Keep the details for your upcoming moments close.
          </p>
        </div>
        <ButtonLink to="/services" variant="secondary">
          Explore services <ArrowRight size={15} />
        </ButtonLink>
      </div>
      <div className="mt-8 flex gap-2 border-b border-[#e6ebe6]">
        {(['upcoming', 'past', 'all'] as const).map((value) => (
          <button
            key={value}
            onClick={() => setParams(value === 'upcoming' ? {} : { period: value })}
            className={`relative px-4 py-3 text-sm font-semibold capitalize ${period === value ? 'text-[#31583f]' : 'text-slate-400 hover:text-slate-700'}`}
          >
            {value}
            {period === value && (
              <span className="absolute inset-x-3 bottom-0 h-0.5 rounded bg-[#597b62]" />
            )}
          </button>
        ))}
      </div>
      <section className="mt-6">
        {bookings.isLoading ? (
          <LoadingCards />
        ) : bookings.isError ? (
          <ErrorNotice
            message={
              bookings.error instanceof ApiError
                ? bookings.error.message
                : 'We couldn’t load your bookings.'
            }
            retry={() => void bookings.refetch()}
          />
        ) : !bookings.data?.items.length ? (
          <EmptyState
            title={period === 'upcoming' ? 'Your next gathering is waiting' : 'No bookings to show'}
            detail={
              period === 'upcoming'
                ? 'When you request a service, its details will live right here.'
                : 'Try another booking period or explore services for your next occasion.'
            }
            reset={() => setParams({})}
          />
        ) : (
          <>
            <div className="space-y-4">
              {bookings.data.items.map((booking, index) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  service={services[index]?.data}
                  cancelPending={cancel.isPending}
                  cancelError={cancel.error instanceof Error ? cancel.error.message : undefined}
                  onCancel={(id) => cancel.mutate(id)}
                />
              ))}
            </div>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                variant="secondary"
                disabled={bookings.data.page <= 1}
                onClick={() =>
                  setParams({
                    ...(period === 'upcoming' ? {} : { period }),
                    page: String(page - 1),
                  })
                }
              >
                <ChevronLeft size={16} /> Previous
              </Button>
              <span className="text-sm font-semibold text-slate-500">
                Page {bookings.data.page} of {bookings.data.totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={bookings.data.page >= bookings.data.totalPages}
                onClick={() =>
                  setParams({
                    ...(period === 'upcoming' ? {} : { period }),
                    page: String(page + 1),
                  })
                }
              >
                Next <ChevronRight size={16} />
              </Button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
