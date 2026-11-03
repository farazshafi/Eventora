import { createContext, useContext, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Button } from '../ui/Button';

type ToastValue = { notify: (message: string, kind?: 'success' | 'error') => void };
const ToastContext = createContext<ToastValue | null>(null);

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; kind: 'success' | 'error' } | null>(null);
  const notify = (message: string, kind: 'success' | 'error' = 'success') => {
    setToast({ message, kind });
    window.setTimeout(() => setToast(null), 3600);
  };
  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-5 top-5 z-[80] flex max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl ${toast.kind === 'error' ? 'border-rose-200 text-rose-800' : 'border-emerald-200 text-emerald-900'}`}
        >
          {toast.kind === 'error' ? <AlertCircle size={19} /> : <CheckCircle2 size={19} />}
          <span className="flex-1 text-sm font-semibold">{toast.message}</span>
          <button aria-label="Dismiss notification" onClick={() => setToast(null)}>
            <X size={16} />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}
export function useAdminToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useAdminToast must be used in admin routes');
  return context.notify;
}

export function AdminPageTitle({
  eyebrow,
  title,
  detail,
  action,
}: {
  eyebrow: string;
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#688373]">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#1d3229] sm:text-4xl">
          {title}
        </h1>
        {detail && <p className="mt-2 text-sm text-slate-500">{detail}</p>}
      </div>
      {action}
    </div>
  );
}

export function AdminStatus({ status }: { status: string }) {
  const color =
    status === 'CONFIRMED' || status === 'COMPLETED'
      ? 'bg-emerald-50 text-emerald-800'
      : status === 'PENDING'
        ? 'bg-amber-50 text-amber-800'
        : 'bg-slate-100 text-slate-600';
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${color}`}
    >
      {status.toLowerCase()}
    </span>
  );
}

export function ConfirmDialog({
  title,
  detail,
  confirmLabel = 'Confirm',
  busy,
  onCancel,
  onConfirm,
}: {
  title: string;
  detail: string;
  confirmLabel?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-[#13221c]/45 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#688373]">
          Please confirm
        </p>
        <h2 id="confirm-title" className="mt-2 font-display text-2xl font-bold text-[#1d3229]">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{detail}</p>
        <div className="mt-7 flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="bg-rose-700 hover:bg-rose-800" disabled={busy} onClick={onConfirm}>
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}

export function AdminSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-2xl bg-white/80" />
      ))}
    </div>
  );
}

export function AdminError({ retry }: { retry: () => void }) {
  return (
    <div className="rounded-3xl border border-rose-100 bg-white p-8 text-center">
      <AlertCircle className="mx-auto text-rose-600" />
      <h2 className="mt-3 font-display text-xl font-bold">We couldn’t load this information.</h2>
      <p className="mt-1 text-sm text-slate-500">Check the connection and try again.</p>
      <Button variant="secondary" className="mt-5" onClick={retry}>
        Try again
      </Button>
    </div>
  );
}

export function AdminEmpty({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-[#cad8ce] bg-white/70 px-6 py-14 text-center">
      <h2 className="font-display text-xl font-bold text-[#1d3229]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{detail}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function AdminPagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="mt-5 flex items-center justify-between text-sm">
      <span className="text-slate-500">
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
