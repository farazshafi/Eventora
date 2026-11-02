import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, formatPrice } from '../utils/format';
import { Busy, ErrorNotice } from '../components/common/States';
import { ButtonLink } from '../components/ui/Button';
import type { BookingContactInput } from '../schemas/booking.schema';
import { useBookingById, useCreateBooking } from '../hooks/useBookings';
import { useService } from '../hooks/useServices';
import type { Booking } from '../types/booking.types';
import { CheckoutContactForm } from '../components/booking/CheckoutContactForm';
import { BookingOrderSummary } from '../components/booking/BookingOrderSummary';
export default function CheckoutPage() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const startDate = params.get('startDate') ?? '';
  const endDate = params.get('endDate') ?? '';
  const { user } = useAuth();
  const navigate = useNavigate();
  const service = useService(id);
  const mutation = useCreateBooking(id, (booking) =>
    navigate(`/checkout/${id}/confirmation?booking=${booking.id}`, {
      replace: true,
      state: { booking },
    }),
  );
  if (!startDate || !endDate || startDate > endDate)
    return (
      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <ErrorNotice message="Choose valid booking dates before continuing." />
        <Link
          to={`/services/${id}`}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#4b7055]"
        >
          <ArrowLeft size={15} /> Back to service
        </Link>
      </main>
    );
  if (service.isLoading)
    return (
      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <Busy label="Preparing your booking" />
      </main>
    );
  if (service.isError || !service.data)
    return (
      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <ErrorNotice
          message="We couldn’t load this service."
          retry={() => void service.refetch()}
        />
      </main>
    );
  const item = service.data;
  return (
    <main className="mx-auto max-w-5xl px-5 pb-14 pt-10 sm:px-8 sm:pt-14">
      <Link
        to={`/services/${id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#3c6448]"
      >
        <ArrowLeft size={15} /> Back to details
      </Link>
      <p className="eyebrow mt-7">One step closer</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-[#233a2c]">
        Request your booking.
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Review the details and share a contact for the service provider.
      </p>
      <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_350px]">
        <CheckoutContactForm
          user={user}
          pending={mutation.isPending}
          error={mutation.error instanceof Error ? mutation.error.message : undefined}
          onSubmit={(values) => {
            const contact = Object.fromEntries(
              Object.entries(values).filter(([, value]) => Boolean(value?.trim())),
            ) as BookingContactInput;
            mutation.mutate({
              startDate,
              endDate,
              ...(Object.keys(contact).length ? { contact } : {}),
            });
          }}
        />
        <BookingOrderSummary service={item} startDate={startDate} endDate={endDate} />
      </div>
    </main>
  );
}

export function ConfirmationPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const id = params.get('booking');
  const prior = (location.state as { booking?: Booking } | null)?.booking;
  const bookingQuery = useBookingById(id, prior);
  if (bookingQuery.isLoading)
    return (
      <main className="mx-auto max-w-2xl px-5 py-12">
        <Busy label="Loading confirmation" />
      </main>
    );
  if (bookingQuery.isError || !bookingQuery.data)
    return (
      <main className="mx-auto max-w-2xl px-5 py-12">
        <ErrorNotice message="Your request was received, but we couldn’t load its details." />
        <ButtonLink className="mt-5" to="/bookings">
          View my bookings <ArrowRight size={15} />
        </ButtonLink>
      </main>
    );
  const booking = bookingQuery.data;
  return (
    <main className="mx-auto max-w-2xl px-5 pb-14 pt-14 text-center sm:px-8 sm:pt-20">
      <span className="mx-auto flex size-16 items-center justify-center rounded-[22px] bg-[#e7f1e8] text-[#4d7957]">
        <CheckCircle2 size={31} />
      </span>
      <p className="eyebrow mt-6">Request sent</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-[#21382b]">
        A lovely day is taking shape.
      </h1>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
        Your request is in. You can follow its status and details from your bookings.
      </p>
      <div className="mt-8 rounded-[24px] border border-[#e7ece7] bg-white p-6 text-left">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Booking status</span>
          <span className="rounded-full bg-amber-50 px-3 py-1 font-bold uppercase tracking-wider text-amber-700">
            {booking.status}
          </span>
        </div>
        <div className="mt-4 flex justify-between text-xs">
          <span className="text-slate-500">Dates</span>
          <span className="font-semibold text-[#405346]">
            {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
          </span>
        </div>
        <div className="mt-4 flex justify-between border-t border-slate-100 pt-4">
          <span className="text-sm font-bold text-[#334a39]">Estimated total</span>
          <span className="font-display text-lg font-extrabold text-[#31583f]">
            {formatPrice(booking.totalPrice)}
          </span>
        </div>
      </div>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <ButtonLink to="/bookings">View my bookings</ButtonLink>
        <ButtonLink to="/services" variant="secondary">
          Keep exploring
        </ButtonLink>
      </div>
    </main>
  );
}
