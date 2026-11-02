import { MapPin } from 'lucide-react';
import type { Service } from '../../types/service.types';
import { dayCount, formatDate, formatPrice } from '../../utils/format';

export function BookingOrderSummary({
  service,
  startDate,
  endDate,
}: {
  service: Service;
  startDate: string;
  endDate: string;
}) {
  const days = dayCount(startDate, endDate);
  const total = service.pricePerDay * days;
  return (
    <aside className="h-fit overflow-hidden rounded-[26px] border border-[#e5ebe5] bg-white lg:sticky lg:top-24">
      <div className="relative h-48 bg-[#e8eee8]">
        {service.images[0] ? (
          <img src={service.images[0]} alt={service.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#e4eee8] to-[#eeeadd] font-display text-4xl font-bold text-[#92a894]">
            {service.title.charAt(0)}
          </div>
        )}
      </div>
      <div className="p-5">
        <h2 className="font-display text-lg font-bold text-[#2d4434]">{service.title}</h2>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <MapPin size={13} />
          {service.location}
        </p>
        <div className="mt-5 space-y-3 border-y border-slate-100 py-4 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Dates</span>
            <span className="font-semibold text-[#394f40]">
              {formatDate(startDate)} – {formatDate(endDate)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Duration</span>
            <span className="font-semibold text-[#394f40]">
              {days} day{days === 1 ? '' : 's'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Daily price</span>
            <span className="font-semibold text-[#394f40]">{formatPrice(service.pricePerDay)}</span>
          </div>
        </div>
        <div className="mt-4 flex justify-between">
          <span className="text-sm font-bold text-[#334a39]">Estimated total</span>
          <span className="font-display text-lg font-extrabold text-[#31583f]">
            {formatPrice(total)}
          </span>
        </div>
        <p className="mt-4 rounded-xl bg-[#f0f4ef] p-3 text-[11px] leading-5 text-slate-500">
          This sends a booking request. The status will be pending until the provider responds. No
          payment is collected here.
        </p>
      </div>
    </aside>
  );
}
