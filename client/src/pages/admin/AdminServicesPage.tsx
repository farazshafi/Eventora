import { Plus, Search, SlidersHorizontal, Trash2, Pencil, ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AdminEmpty,
  AdminError,
  AdminPageTitle,
  AdminPagination,
  AdminSkeleton,
  ConfirmDialog,
} from '../../components/admin/AdminUI';
import { Button, ButtonLink } from '../../components/ui/Button';
import { useAdminServicesPage, useDeleteAdminService } from '../../hooks/useAdminServices';
import { serviceCategories } from '../../types/service.types';
import type { ServiceCategory } from '../../types/service.types';
import { categoryLabels, formatPrice } from '../../utils/format';
import { useAdminToast } from '../../components/admin/AdminUI';

export default function AdminServicesPage() {
  const [page, setPage] = useState(1);
  const remove = useDeleteAdminService();
  const notify = useAdminToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [deleting, setDeleting] = useState<{ id: string; title: string } | null>(null);
  const query = useAdminServicesPage(page, {
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(category ? { category: category as ServiceCategory } : {}),
  });
  const rows = query.data?.items ?? [];
  const totalPages = Math.max(1, query.data?.totalPages ?? 1);
  const hasFilters = Boolean(search.trim() || category);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setPage(1);
  };
  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      notify('Service deleted.');
      setDeleting(null);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not delete this service.', 'error');
    }
  };
  return (
    <>
      <AdminPageTitle
        eyebrow="Your catalogue"
        title="Services"
        detail="Keep your listings thoughtful, accurate, and ready to discover."
        action={
          <ButtonLink to="/admin/services/new">
            <Plus size={17} />
            Add service
          </ButtonLink>
        }
      />
      {query.isPending ? (
        <AdminSkeleton />
      ) : query.isError ? (
        <AdminError retry={() => void query.refetch()} />
      ) : (
        <>
          <section className="mb-5 flex flex-col gap-3 rounded-[24px] border border-[#e5ece4] bg-white p-4 sm:flex-row sm:items-center">
            <label className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                aria-label="Search your services"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, location, or details"
                className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#799985] focus:ring-4 focus:ring-[#dce9df]"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-500">
              <SlidersHorizontal size={16} />
              <select
                aria-label="Filter services by category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="min-w-44 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#799985]"
              >
                <option value="">All categories</option>
                {serviceCategories.map((item: ServiceCategory) => (
                  <option key={item} value={item}>
                    {categoryLabels[item]}
                  </option>
                ))}
              </select>
            </label>
          </section>
          {!rows.length ? (
            <AdminEmpty
              title={hasFilters ? 'No services match those filters.' : 'There are no services yet.'}
              detail={
                hasFilters
                  ? 'Try a different search or category.'
                  : 'Create your first service listing to start welcoming bookings.'
              }
              action={
                hasFilters ? (
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : (
                  <ButtonLink to="/admin/services/new">Add a service</ButtonLink>
                )
              }
            />
          ) : (
            <>
              <div className="overflow-hidden rounded-[26px] border border-[#e5ece4] bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] border-collapse text-left">
                    <thead className="bg-[#f7f9f6] text-[11px] uppercase tracking-[.14em] text-slate-500">
                      <tr>
                        <th className="px-6 py-4 font-bold">Service</th>
                        <th className="px-5 py-4 font-bold">Category</th>
                        <th className="px-5 py-4 font-bold">Location</th>
                        <th className="px-5 py-4 font-bold">Daily price</th>
                        <th className="px-5 py-4 font-bold">Updated</th>
                        <th className="px-5 py-4 text-right font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((service) => (
                        <tr key={service.id} className="transition hover:bg-[#fbfcfa]">
                          <td className="px-6 py-4">
                            <Link
                              to={`/admin/services/${service.id}`}
                              className="flex items-center gap-3"
                            >
                              <span className="size-11 shrink-0 overflow-hidden rounded-xl bg-[#eef3ed]">
                                {service.images[0] && (
                                  <img
                                    src={service.images[0]}
                                    alt=""
                                    className="size-full object-cover"
                                  />
                                )}
                              </span>
                              <span>
                                <span className="block max-w-64 truncate text-sm font-bold text-[#293a31]">
                                  {service.title}
                                </span>
                                <span className="mt-1 block text-xs text-slate-400">
                                  {service.slug}
                                </span>
                              </span>
                            </Link>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            {categoryLabels[service.category]}
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">{service.location}</td>
                          <td className="px-5 py-4 text-sm font-bold">
                            {formatPrice(service.pricePerDay)}
                            <span className="font-normal text-slate-400"> / day</span>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-500">
                            {new Intl.DateTimeFormat('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }).format(new Date(service.updatedAt))}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1">
                              <Link
                                aria-label={`View ${service.title}`}
                                className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-[#eef3ed] hover:text-[#173d33]"
                                to={`/admin/services/${service.id}`}
                              >
                                <ArrowUpRight size={17} />
                              </Link>
                              <Link
                                aria-label={`Edit ${service.title}`}
                                className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-[#eef3ed] hover:text-[#173d33]"
                                to={`/admin/services/${service.id}/edit`}
                              >
                                <Pencil size={16} />
                              </Link>
                              <button
                                aria-label={`Delete ${service.title}`}
                                onClick={() =>
                                  setDeleting({ id: service.id, title: service.title })
                                }
                                className="grid size-9 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <AdminPagination
                page={query.data?.page ?? page}
                totalPages={totalPages}
                onChange={setPage}
              />
            </>
          )}
        </>
      )}
      {deleting && (
        <ConfirmDialog
          title={`Delete “${deleting.title}”?`}
          detail="This removes the service from your listings. Existing booking records will remain in your booking history."
          confirmLabel="Delete service"
          busy={remove.isPending}
          onCancel={() => setDeleting(null)}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </>
  );
}
