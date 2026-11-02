import { AlertCircle, LoaderCircle, SearchX } from 'lucide-react';
import { Button } from '../ui/Button';

export function LoadingCards() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-[25px] border border-slate-100 bg-white">
          <div className="aspect-[1.42] animate-pulse bg-slate-100" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-3/4 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
            <div className="h-7 w-1/2 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
export function Busy({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex min-h-64 items-center justify-center gap-3 text-sm font-medium text-slate-500">
      <LoaderCircle size={18} className="animate-spin text-[#557866]" />
      {label}…
    </div>
  );
}
export function EmptyState({
  title,
  detail,
  reset,
}: {
  title: string;
  detail: string;
  reset?: () => void;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-[#d7e2d9] bg-white/70 px-6 py-14 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#e8f0ea] text-[#567663]">
        <SearchX size={21} />
      </span>
      <h3 className="mt-4 font-display text-xl font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{detail}</p>
      {reset && (
        <Button onClick={reset} variant="secondary" className="mt-5">
          Clear filters
        </Button>
      )}
    </div>
  );
}
export function ErrorNotice({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-5 text-rose-800">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 shrink-0" size={18} />
        <div className="flex-1">
          <p className="text-sm font-semibold">{message}</p>
          {retry && (
            <button
              onClick={retry}
              className="mt-2 text-sm font-semibold underline underline-offset-4"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
