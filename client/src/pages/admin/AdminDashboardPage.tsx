import {
  ArrowUpRight,
  CalendarCheck2,
  CircleDashed,
  PackageCheck,
  Sparkles,
  TicketCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AdminError,
  AdminPageTitle,
  AdminSkeleton,
  AdminStatus,
} from '../../components/admin/AdminUI';
import { ButtonLink } from '../../components/ui/Button';
import { useAdminBookings } from '../../hooks/useAdminBookings';
import { useAdminServices } from '../../hooks/useAdminServices';
import { categoryLabels, formatDate, formatPrice } from '../../utils/format';

export default function AdminDashboardPage() {
  const services = useAdminServices();
  const bookings = useAdminBookings();
  if (services.isPending || bookings.isPending)
    return (
      <>
        <AdminPageTitle
          eyebrow="Your workspace"
          title="Good morning."
          detail="Here’s a little snapshot of how things are coming together."
        />
        <AdminSkeleton rows={6} />
      </>
    );
  if (services.isError || bookings.isError)
    return (
      <AdminError
        retry={() => {
          void services.refetch();
          void bookings.refetch();
        }}
      />
    );
  const allServices = services.data ?? [];
  const allBookings = bookings.data ?? [];
  const metrics = [
    {
      label: 'Your services',
      value: allServices.length,
      icon: Sparkles,
      note: 'Across your listings',
    },
    {
      label: 'Total bookings',
      value: allBookings.length,
      icon: TicketCheck,
      note: 'For your services',
    },
    {
      label: 'Pending',
      value: allBookings.filter((item) => item.status === 'PENDING').length,
      icon: CircleDashed,
      note: 'Waiting for a decision',
    },
    {
      label: 'Confirmed',
      value: allBookings.filter((item) => item.status === 'CONFIRMED').length,
      icon: CalendarCheck2,
      note: 'Ready for the big day',
    },
  ];
  const recentBookings = [...allBookings]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 5);
  const recentServices = allServices.slice(0, 5);
  return (
    <>
      <AdminPageTitle
        eyebrow="Your workspace"
        title="Good morning."
        detail="A little snapshot of how things are coming together."
        action={
          <ButtonLink to="/admin/services/new">
            Add a service <ArrowUpRight size={16} />
          </ButtonLink>
        }
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, note }, index) => (
          <article
            key={label}
            className="rounded-[26px] border border-[#e5ece4] bg-white p-5 shadow-[0_14px_40px_-32px_rgba(31,56,43,.4)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">{label}</span>
              <span
                className={`grid size-10 place-items-center rounded-2xl ${index === 2 ? 'bg-amber-50 text-amber-700' : 'bg-[#eaf1eb] text-[#477458]'}`}
              >
                <Icon size={19} />
              </span>
            </div>
            <p className="mt-5 font-display text-3xl font-extrabold text-[#1d3229]">
              {value.toLocaleString('en-IN')}
            </p>
            <p className="mt-1 text-xs text-slate-400">{note}</p>
          </article>
        ))}
      </section>
      <section className="mt-8 grid gap-6 2xl:grid-cols-[1.25fr_0.75fr]">
        <article className="overflow-hidden rounded-[28px] border border-[#e5ece4] bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#789080]">
                Latest activity
              </p>
              <h2 className="mt-1 font-display text-xl font-bold">Recent bookings</h2>
            </div>
            <Link to="/admin/bookings" className="text-sm font-bold text-[#37654d] hover:underline">
              View all
            </Link>
          </div>
          {recentBookings.length ? (
            <div className="divide-y divide-slate-100">
              {recentBookings.map((booking) => (
                <Link
                  key={booking.id}
                  to={`/admin/bookings/${booking.id}`}
                  className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition hover:bg-[#fafcf9] sm:px-7"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#293a31]">
                      {booking.contact?.name || `Customer ${booking.userId.slice(-6)}`}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold">{formatPrice(booking.totalPrice)}</span>
                    <AdminStatus status={booking.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <TicketCheck className="mx-auto text-[#95aa99]" />
              <p className="mt-3 text-sm font-semibold">Your bookings will show up here.</p>
              <p className="mt-1 text-xs text-slate-500">
                When customers book your services, you’ll find their requests in this list.
              </p>
            </div>
          )}
        </article>
        <article className="overflow-hidden rounded-[28px] border border-[#e5ece4] bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#789080]">
                Your listings
              </p>
              <h2 className="mt-1 font-display text-xl font-bold">Recent services</h2>
            </div>
            <Link to="/admin/services" className="text-sm font-bold text-[#37654d] hover:underline">
              View all
            </Link>
          </div>
          {recentServices.length ? (
            <div className="divide-y divide-slate-100">
              {recentServices.map((service) => (
                <Link
                  key={service.id}
                  to={`/admin/services/${service.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition hover:bg-[#fafcf9] sm:px-7"
                >
                  <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#eef3ed] text-[#6d8a75]">
                    {service.images[0] ? (
                      <img src={service.images[0]} alt="" className="size-full object-cover" />
                    ) : (
                      <PackageCheck size={20} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{service.title}</span>
                    <span className="mt-1 block truncate text-xs text-slate-500">
                      {categoryLabels[service.category]} · {service.location}
                    </span>
                  </span>
                  <span className="whitespace-nowrap text-xs font-bold text-[#456d57]">
                    {formatPrice(service.pricePerDay)}
                    <span className="font-normal text-slate-400"> / day</span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <Sparkles className="mx-auto text-[#95aa99]" />
              <p className="mt-3 text-sm font-semibold">
                Your first service is a lovely place to start.
              </p>
              <ButtonLink className="mt-4" to="/admin/services/new">
                Create service
              </ButtonLink>
            </div>
          )}
        </article>
      </section>
    </>
  );
}
