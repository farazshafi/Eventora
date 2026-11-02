import type { UseQueryResult } from '@tanstack/react-query';
import { ArrowRight, Check } from 'lucide-react';
import { dayCount, formatPrice } from '../../utils/format';
import type { Service } from '../../types/service.types';
import { Button } from '../ui/Button';

interface Props {
  service: Service;
  startDate: string;
  endDate: string;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  availability: UseQueryResult<boolean, Error>;
  onContinue: () => void;
}

export function ServiceBookingPanel({
  service,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  availability,
  onContinue,
}: Props) {
  const hasDates = Boolean(startDate && endDate && startDate <= endDate);
  const isAvailable = hasDates && !availability.isLoading && availability.data === true;
  return (
    <aside className="h-fit rounded-[26px] border border-[#e3eae3] bg-white p-6 shadow-[0_18px_55px_-42px_rgba(22,55,35,.32)] lg:sticky lg:top-24">
      <p className="font-display text-lg font-bold text-[#294033]">Make it happen</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        Choose the dates you have in mind to see availability.
      </p>
      <div className="mt-5 space-y-3">
        <label className="block text-xs font-semibold text-slate-600">
          From
          <input
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            value={startDate}
            onChange={(event) => {
              setStartDate(event.target.value);
              if (endDate && event.target.value > endDate) setEndDate('');
            }}
            className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe6df] bg-white px-3 text-sm outline-none focus:border-[#8ba892]"
          />
        </label>
        <label className="block text-xs font-semibold text-slate-600">
          To
          <input
            type="date"
            min={startDate || new Date().toISOString().slice(0, 10)}
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe6df] bg-white px-3 text-sm outline-none focus:border-[#8ba892]"
          />
        </label>
      </div>
      {hasDates && (
        <div className="mt-4 rounded-xl bg-[#f1f5f1] p-3 text-xs">
          {availability.isLoading ? (
            <span className="text-slate-500">Checking dates…</span>
          ) : availability.isError ? (
            <span className="text-rose-700">
              Availability couldn’t be checked. You can still request these dates.
            </span>
          ) : isAvailable ? (
            <span className="flex items-center gap-2 font-semibold text-[#45684f]">
              <Check size={15} /> Available for your dates
            </span>
          ) : (
            <span className="font-semibold text-rose-700">
              This service is unavailable for those dates.
            </span>
          )}
        </div>
      )}
      {hasDates && !availability.isError && (
        <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
          <div className="flex justify-between text-xs text-slate-500">
            <span>
              {formatPrice(service.pricePerDay)} × {dayCount(startDate, endDate)} days
            </span>
            <span>{formatPrice(service.pricePerDay * dayCount(startDate, endDate))}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-[#294033]">
            <span>Estimated total</span>
            <span>{formatPrice(service.pricePerDay * dayCount(startDate, endDate))}</span>
          </div>
        </div>
      )}
      <Button
        disabled={!hasDates || (!isAvailable && !availability.isError)}
        onClick={onContinue}
        className="mt-5 w-full"
      >
        Continue to booking <ArrowRight size={16} />
      </Button>
      <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
        No payment required to send a request.
      </p>
    </aside>
  );
}
