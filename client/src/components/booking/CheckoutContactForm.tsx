import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { bookingContactSchema, type BookingContactInput } from '../../schemas/booking.schema';
import type { User } from '../../types/user.types';
import { ErrorNotice } from '../common/States';
import { Button } from '../ui/Button';

interface Props {
  user: User | null;
  pending: boolean;
  error?: string;
  onSubmit: (contact: BookingContactInput) => void;
}

export function CheckoutContactForm({ user, pending, error, onSubmit }: Props) {
  const form = useForm<BookingContactInput>({
    resolver: zodResolver(bookingContactSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '', phone: '' },
  });
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="rounded-[26px] border border-[#e7ece7] bg-white p-6 sm:p-8"
    >
      <h2 className="font-display text-xl font-bold text-[#2c4433]">Your contact details</h2>
      <p className="mt-1 text-xs text-slate-500">
        The provider can use these details to follow up on your request.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold text-slate-600">
          Name <span className="font-normal text-slate-400">(optional)</span>
          <input
            className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe6df] px-3 text-sm outline-none focus:border-[#87a18c]"
            {...form.register('name')}
          />
        </label>
        <label className="text-xs font-semibold text-slate-600">
          Phone <span className="font-normal text-slate-400">(optional)</span>
          <input
            type="tel"
            className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe6df] px-3 text-sm outline-none focus:border-[#87a18c]"
            {...form.register('phone')}
          />
          {form.formState.errors.phone && (
            <span className="mt-1 block text-xs text-rose-600">
              {form.formState.errors.phone.message}
            </span>
          )}
        </label>
        <label className="text-xs font-semibold text-slate-600 sm:col-span-2">
          Email <span className="font-normal text-slate-400">(optional)</span>
          <input
            type="email"
            className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe6df] px-3 text-sm outline-none focus:border-[#87a18c]"
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <span className="mt-1 block text-xs text-rose-600">
              {form.formState.errors.email.message}
            </span>
          )}
        </label>
      </div>
      {error && (
        <div className="mt-5">
          <ErrorNotice message={error} />
        </div>
      )}
      <Button type="submit" disabled={pending} className="mt-7 w-full sm:w-auto">
        {pending ? 'Sending request…' : 'Send booking request'}{' '}
        <ArrowLeft className="rotate-180" size={15} />
      </Button>
      <p className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
        <LockKeyhole size={13} /> Your booking details are sent securely.
      </p>
    </form>
  );
}
