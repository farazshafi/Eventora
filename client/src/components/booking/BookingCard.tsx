import { ArrowRight, CalendarDays, MapPin, X } from 'lucide-react';
import type { Booking, BookingStatus } from '../../types/booking.types';
import type { Service } from '../../types/service.types';
import { formatDate, formatPrice } from '../../utils/format';
import { Button, ButtonLink } from '../ui/Button';

const statusStyles: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  CONFIRMED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
  COMPLETED: 'bg-blue-50 text-blue-700',
};

interface Props {
  booking: Booking;
  service?: Service;
  cancelPending: boolean;
  cancelError?: string;
  onCancel: (id: string) => void;
}

export function BookingCard({ booking, service, cancelPending, cancelError, onCancel }: Props) {
  return (
    <article className="grid overflow-hidden rounded-[24px] border border-[#e7ece7] bg-white sm:grid-cols-[190px_1fr]">
      <div className="relative min-h-44 bg-[#e8eee8] sm:min-h-0">
        {service?.images[0] ? (
          <img
            src={service.images[0]}
            alt={service.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full min-h-44 items-center justify-center bg-gradient-to-br from-[#e5eee6] to-[#eee9dd] font-display text-4xl font-bold text-[#97ad99]">
            {service?.title?.charAt(0) ?? <CalendarDays size={28} />}
          </div>
        )}
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-[#2b4232]">
              {service?.title ?? 'Event service'}
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin size={13} />
              {service?.location ?? 'Service details unavailable'}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[booking.status]}`}
          >
            {booking.status.toLowerCase()}
          </span>
        </div>
        <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dates</p>
            <p className="mt-1 text-xs font-semibold text-[#405346]">
              {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Duration
            </p>
            <p className="mt-1 text-xs font-semibold text-[#405346]">
              {booking.numberOfDays} day{booking.numberOfDays === 1 ? '' : 's'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Booking total
            </p>
            <p className="mt-1 text-sm font-extrabold text-[#31583f]">
              {formatPrice(booking.totalPrice)}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {service && (
            <ButtonLink to={`/services/${service.id}`} variant="ghost" className="min-h-9 px-2">
              View service <ArrowRight size={14} />
            </ButtonLink>
          )}
          {booking.status === 'PENDING' && (
            <Button
              variant="ghost"
              onClick={() => onCancel(booking.id)}
              disabled={cancelPending}
              className="min-h-9 px-2 text-rose-600 hover:bg-rose-50"
            >
              <X size={14} /> Cancel request
            </Button>
          )}
        </div>
        {cancelError && <p className="mt-3 text-xs text-rose-600">{cancelError}</p>}
      </div>
    </article>
  );
}
