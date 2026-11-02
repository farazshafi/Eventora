import { CalendarDays, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AdminEmpty,
  AdminError,
  AdminPageTitle,
  AdminPagination,
  AdminSkeleton,
  AdminStatus,
} from '../../components/admin/AdminUI';
import { useAdminBookings } from '../../hooks/useAdminBookings';
import { formatDate, formatPrice } from '../../utils/format';
import type { BookingStatus } from '../../types/booking.types';

const statuses: Array<BookingStatus | ''> = ['', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
const pageSize = 10;
export default function AdminBookingsPage() {
  const query = useAdminBookings();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<BookingStatus | ''>('');
  const [page, setPage] = useState(1);
  const filtered = useMemo(
    () =>
      (query.data ?? []).filter((booking) => {
        const needle = search.trim().toLowerCase();
        return (
          (!status || booking.status === status) &&
          (!needle ||
            [
              booking.id,
              booking.userId,
              booking.contact?.name,
              booking.contact?.email,
              booking.contact?.phone,
            ].some((value) => value?.toLowerCase().includes(needle)))
        );
      }),
    [query.data, search, status],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
  return (
    <>
      <AdminPageTitle
        eyebrow="Event requests"
        title="Bookings"
        detail="Review customer requests for your services and keep each plan moving."
      />
      {query.isPending ? (
        <AdminSkeleton rows={7} />
      ) : query.isError ? (
        <AdminError retry={() => void query.refetch()} />
      ) : (
        <>
          <section className="mb-5 flex flex-col gap-3 rounded-[24px] border border-[#e5ece4] bg-white p-4 sm:flex-row">
            <label className="relative flex-1">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                aria-label="Search bookings"
                placeholder="Search customer, contact, or booking ID"
                className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#799985] focus:ring-4 focus:ring-[#dce9df]"
              />
            </label>
            <select
              aria-label="Filter by booking status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as BookingStatus | '');
                setPage(1);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#799985]"
            >
              <option value="">All statuses</option>
              {statuses.filter(Boolean).map((item) => (
                <option key={item} value={item}>
                  {item[0] + item.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </section>
          {!filtered.length ? (
            <AdminEmpty
              title={
                query.data?.length
                  ? 'No bookings match that filter.'
                  : 'No bookings have arrived yet.'
              }
              detail={
                query.data?.length
                  ? 'Try a different status or search term.'
                  : 'Customer requests for your services will appear here.'
              }
              action={
                query.data?.length ? (
                  <button
                    onClick={() => {
                      setSearch('');
                      setStatus('');
                    }}
                    className="text-sm font-bold text-[#37654d]"
                  >
                    Clear filters
                  </button>
                ) : undefined
              }
            />
          ) : (
            <>
              <div className="overflow-hidden rounded-[26px] border border-[#e5ece4] bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] border-collapse text-left">
                    <thead className="bg-[#f7f9f6] text-[11px] uppercase tracking-[.14em] text-slate-500">
                      <tr>
                        <th className="px-6 py-4 font-bold">Customer</th>
                        <th className="px-5 py-4 font-bold">Event dates</th>
                        <th className="px-5 py-4 font-bold">Days</th>
                        <th className="px-5 py-4 font-bold">Total</th>
                        <th className="px-5 py-4 font-bold">Status</th>
                        <th className="px-5 py-4 text-right font-bold">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((booking) => (
                        <tr key={booking.id} className="hover:bg-[#fbfcfa]">
                          <td className="px-6 py-4">
                            <span className="block text-sm font-bold">
                              {booking.contact?.name || `Customer ${booking.userId.slice(-6)}`}
                            </span>
                            <span className="mt-1 block max-w-60 truncate text-xs text-slate-400">
                              {booking.contact?.email ||
                                booking.contact?.phone ||
                                `ID ${booking.userId}`}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="flex items-center gap-2 text-sm">
                              <CalendarDays size={15} className="text-[#789080]" />
                              {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            {booking.numberOfDays}
                          </td>
                          <td className="px-5 py-4 text-sm font-bold">
                            {formatPrice(booking.totalPrice)}
                          </td>
                          <td className="px-5 py-4">
                            <AdminStatus status={booking.status} />
                          </td>
                          <td className="px-5 py-4 text-right">
                            <Link
                              to={`/admin/bookings/${booking.id}`}
                              className="rounded-xl px-3 py-2 text-sm font-bold text-[#37654d] hover:bg-[#eef3ed]"
                            >
                              View details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <AdminPagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </>
      )}
    </>
  );
}
