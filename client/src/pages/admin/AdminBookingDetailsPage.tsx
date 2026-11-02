import { ArrowLeft, CalendarDays, Check, Clock3, X } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getService } from '../../api/service.api';
import {
  AdminEmpty,
  AdminError,
  AdminPageTitle,
  AdminSkeleton,
  AdminStatus,
  ConfirmDialog,
} from '../../components/admin/AdminUI';
import { Button, ButtonLink } from '../../components/ui/Button';
import { useAdminToast } from '../../components/admin/AdminUI';
import { useAdminBookings, useSetAdminBookingStatus } from '../../hooks/useAdminBookings';
import type { BookingStatus } from '../../types/booking.types';
import { categoryLabels, formatDate, formatPrice } from '../../utils/format';

const transitions: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CANCELLED', 'COMPLETED'],
  CANCELLED: [],
  COMPLETED: [],
};
const statusLabels: Record<BookingStatus, string> = {
  CONFIRMED: 'Confirm booking',
  CANCELLED: 'Cancel booking',
  COMPLETED: 'Mark completed',
  PENDING: 'Set pending',
};
export default function AdminBookingDetailsPage() {
  const { id = '' } = useParams();
  const bookings = useAdminBookings();
  const update = useSetAdminBookingStatus();
  const notify = useAdminToast();
  const [requestedStatus, setRequestedStatus] = useState<BookingStatus | null>(null);
  const booking = bookings.data?.find((item) => item.id === id);
  const serviceQuery = useQuery({
    queryKey: ['service', booking?.serviceId],
    queryFn: () => getService(booking!.serviceId),
    enabled: Boolean(booking?.serviceId),
  });
  if (bookings.isPending) return <AdminSkeleton rows={6} />;
  if (bookings.isError) return <AdminError retry={() => void bookings.refetch()} />;
  if (!booking)
    return (
      <AdminEmpty
        title="Booking not found"
        detail="This booking may have been removed or may belong to a service outside your account."
        action={
          <ButtonLink variant="secondary" to="/admin/bookings">
            <ArrowLeft size={16} />
            Back to bookings
          </ButtonLink>
        }
      />
    );
  const changeStatus = async () => {
    if (!requestedStatus) return;
    try {
      await update.mutateAsync({ id: booking.id, status: requestedStatus });
      notify(`Booking ${requestedStatus.toLowerCase()}.`);
      setRequestedStatus(null);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not update booking status.', 'error');
    }
  };
  const actions = transitions[booking.status];
  return (
    <>
      <AdminPageTitle
        eyebrow="Booking details"
        title={`Booking ${booking.id.slice(-8).toUpperCase()}`}
        detail="Review the event details and update its status."
        action={
          <ButtonLink variant="ghost" to="/admin/bookings">
            <ArrowLeft size={16} />
            All bookings
          </ButtonLink>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-6 rounded-[28px] border border-[#e5ece4] bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.17em] text-[#789080]">
                Current status
              </p>
              <div className="mt-2">
                <AdminStatus status={booking.status} />
              </div>
            </div>
            <p className="text-xs text-slate-400">Requested {formatDate(booking.createdAt)}</p>
          </div>
          <div className="grid gap-6 border-t border-slate-100 pt-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.17em] text-[#789080]">
                Customer
              </p>
              <h2 className="mt-2 font-display text-xl font-bold">
                {booking.contact?.name || 'Customer'}
              </h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="inline text-slate-400">Customer ID </dt>
                  <dd className="inline break-all text-slate-700">{booking.userId}</dd>
                </div>
                {booking.contact?.phone && (
                  <div>
                    <dt className="inline text-slate-400">Phone </dt>
                    <dd className="inline">{booking.contact.phone}</dd>
                  </div>
                )}
                {booking.contact?.email && (
                  <div>
                    <dt className="inline text-slate-400">Email </dt>
                    <dd className="inline">{booking.contact.email}</dd>
                  </div>
                )}
              </dl>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.17em] text-[#789080]">
                Event dates
              </p>
              <p className="mt-2 flex items-center gap-2 font-display text-xl font-bold">
                <CalendarDays size={18} className="text-[#668372]" />
                {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {booking.numberOfDays} {booking.numberOfDays === 1 ? 'day' : 'days'} ·{' '}
                {formatPrice(booking.pricePerDay)} per day
              </p>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-6">
            <p className="text-xs font-bold uppercase tracking-[.17em] text-[#789080]">Service</p>
            {serviceQuery.isPending ? (
              <div className="mt-3 h-20 animate-pulse rounded-2xl bg-slate-100" />
            ) : serviceQuery.isError ? (
              <p className="mt-3 text-sm text-rose-700">Service details are unavailable.</p>
            ) : (
              <Link
                to={`/admin/services/${serviceQuery.data.id}`}
                className="mt-3 flex items-center gap-4 rounded-2xl bg-[#f7f9f6] p-4 hover:bg-[#eef3ed]"
              >
                <span className="size-16 shrink-0 overflow-hidden rounded-xl bg-white">
                  {serviceQuery.data.images[0] && (
                    <img
                      src={serviceQuery.data.images[0]}
                      alt=""
                      className="size-full object-cover"
                    />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-bold">{serviceQuery.data.title}</span>
                  <span className="mt-1 block text-sm text-slate-500">
                    {categoryLabels[serviceQuery.data.category]} · {serviceQuery.data.location}
                  </span>
                </span>
              </Link>
            )}
          </div>
        </section>
        <aside className="h-fit rounded-[28px] border border-[#e5ece4] bg-white p-6">
          <p className="text-xs font-bold uppercase tracking-[.17em] text-[#789080]">
            Booking total
          </p>
          <p className="mt-2 font-display text-3xl font-extrabold">
            {formatPrice(booking.totalPrice)}
          </p>
          <p className="mt-1 text-sm text-slate-500">{booking.numberOfDays} event days</p>
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="text-sm font-bold">Update booking status</p>
            {actions.length ? (
              <div className="mt-4 space-y-2">
                {actions.map((next) => {
                  const Icon = next === 'CONFIRMED' ? Check : next === 'CANCELLED' ? X : Clock3;
                  return (
                    <Button
                      key={next}
                      variant={next === 'CANCELLED' ? 'ghost' : 'secondary'}
                      className={`w-full justify-start ${next === 'CANCELLED' ? 'text-rose-700 hover:bg-rose-50' : ''}`}
                      onClick={() => setRequestedStatus(next)}
                    >
                      <Icon size={16} />
                      {statusLabels[next]}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">This booking is in a final status.</p>
            )}
          </div>
        </aside>
      </div>
      {requestedStatus && (
        <ConfirmDialog
          title={statusLabels[requestedStatus]}
          detail={
            requestedStatus === 'CONFIRMED'
              ? 'Confirming checks current service availability. If the dates conflict with another confirmed booking, the update will be rejected.'
              : `This will update the booking status to ${requestedStatus.toLowerCase()}.`
          }
          confirmLabel={statusLabels[requestedStatus]}
          busy={update.isPending}
          onCancel={() => setRequestedStatus(null)}
          onConfirm={() => void changeStatus()}
        />
      )}
    </>
  );
}
