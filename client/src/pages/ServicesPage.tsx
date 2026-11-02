import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serviceCategories, type ServiceCategory } from '../types/service.types';
import { categoryLabels } from '../utils/format';
import { ServiceCard } from '../components/service/ServiceCard';
import { EmptyState, ErrorNotice, LoadingCards } from '../components/common/States';
import { Button } from '../components/ui/Button';
import { serviceFiltersSchema, type ServiceFiltersInput } from '../schemas/service.schema';
import { useServices } from '../hooks/useServices';
type Filters = ServiceFiltersInput;
const inputClass =
  'h-11 w-full rounded-xl border border-[#dfe6df] bg-white px-3 text-sm text-[#31483a] outline-none transition focus:border-[#8ba892] focus:ring-2 focus:ring-[#e0ebe1]';

export default function ServicesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const page = Math.max(1, Number(params.get('page') || 1));
  const form = useForm<Filters>({
    resolver: zodResolver(serviceFiltersSchema),
    defaultValues: {
      search: params.get('search') ?? '',
      category: (params.get('category') ?? '') as Filters['category'],
      location: params.get('location') ?? '',
      minPrice: params.get('minPrice') ?? '',
      maxPrice: params.get('maxPrice') ?? '',
      startDate: params.get('startDate') ?? '',
      endDate: params.get('endDate') ?? '',
      sort: (params.get('sort') as Filters['sort']) ?? 'recent',
    },
  });
  useEffect(() => {
    form.reset({
      search: params.get('search') ?? '',
      category: (params.get('category') ?? '') as Filters['category'],
      location: params.get('location') ?? '',
      minPrice: params.get('minPrice') ?? '',
      maxPrice: params.get('maxPrice') ?? '',
      startDate: params.get('startDate') ?? '',
      endDate: params.get('endDate') ?? '',
      sort: (params.get('sort') as Filters['sort']) ?? 'recent',
    });
  }, [params, form]);
  const sort = params.get('sort') ?? 'recent';
  const query = useServices(
    {
      search: params.get('search') || undefined,
      category: (params.get('category') || undefined) as ServiceCategory | undefined,
      location: params.get('location') || undefined,
      minPrice: params.has('minPrice') ? Number(params.get('minPrice')) : undefined,
      maxPrice: params.has('maxPrice') ? Number(params.get('maxPrice')) : undefined,
      startDate: params.get('startDate') || undefined,
      endDate: params.get('endDate') || undefined,
      sortBy:
        sort === 'price-low' || sort === 'price-high'
          ? 'price'
          : sort === 'title'
            ? 'title'
            : 'createdAt',
      sortOrder: sort === 'price-low' || sort === 'title' ? 'asc' : 'desc',
      page,
      limit: 12,
    },
    page,
    params.toString(),
  );
  function apply(values: Filters) {
    const next = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value) next.set(key, value);
    });
    navigate(`/services?${next.toString()}`);
  }
  function movePage(target: number) {
    const next = new URLSearchParams(location.search);
    next.set('page', String(target));
    navigate(`/services?${next}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  return (
    <main className="mx-auto max-w-7xl px-5 pb-10 pt-10 sm:px-8 sm:pt-14">
      <div className="mb-9">
        <p className="eyebrow">Your plans, in good hands</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-[-.05em] text-[#20382b] sm:text-5xl">
          Find your <span className="text-[#78947c]">people.</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
          Explore event services and find a thoughtful fit for your day.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:items-start">
        <aside className="rounded-[24px] border border-[#e8ece7] bg-white p-5 lg:sticky lg:top-24">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <SlidersHorizontal size={17} className="text-[#5e7c68]" />
            <h2 className="font-display text-base font-bold">Refine your search</h2>
          </div>
          <form onSubmit={form.handleSubmit(apply)} className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Search</span>
              <input
                className={inputClass}
                placeholder="Service or keyword"
                {...form.register('search')}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Category</span>
              <select className={inputClass} {...form.register('category')}>
                <option value="">All categories</option>
                {serviceCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryLabels[cat]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Location</span>
              <input
                className={inputClass}
                placeholder="City or area"
                {...form.register('location')}
              />
            </label>
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                Daily budget
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  placeholder="Min ₹"
                  {...form.register('minPrice')}
                />
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  placeholder="Max ₹"
                  {...form.register('maxPrice')}
                />
              </div>
              {form.formState.errors.maxPrice && (
                <p className="mt-1 text-xs text-rose-600">
                  {form.formState.errors.maxPrice.message}
                </p>
              )}
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                Availability
              </span>
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="date"
                  className={inputClass}
                  aria-label="Start date"
                  {...form.register('startDate')}
                />
                <input
                  type="date"
                  className={inputClass}
                  aria-label="End date"
                  {...form.register('endDate')}
                />
              </div>
              {form.formState.errors.endDate && (
                <p className="mt-1 text-xs text-rose-600">
                  {form.formState.errors.endDate.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Show services
            </Button>
            <button
              type="button"
              onClick={() => {
                form.reset({ sort: 'recent' });
                navigate('/services');
              }}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-[#315b45]"
            >
              Clear all
            </button>
          </form>
        </aside>
        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {query.data ? (
                <>
                  <span className="font-bold text-[#334b3a]">{query.data.totalItems}</span> services
                  to explore
                </>
              ) : (
                'Finding services for you…'
              )}
            </p>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              Sort by{' '}
              <select
                value={sort}
                onChange={(e) => {
                  const next = new URLSearchParams(location.search);
                  next.set('sort', e.target.value);
                  next.delete('page');
                  navigate(`/services?${next}`);
                }}
                className="h-10 rounded-xl border border-[#e1e7e0] bg-white px-3 text-sm text-[#324b39] outline-none"
              >
                <option value="recent">Recently added</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="title">Name</option>
              </select>
            </label>
          </div>
          {query.isLoading ? (
            <LoadingCards />
          ) : query.isError ? (
            <ErrorNotice
              message={
                query.error instanceof Error ? query.error.message : 'We couldn’t load services.'
              }
              retry={() => void query.refetch()}
            />
          ) : !query.data?.services.length ? (
            <EmptyState
              title="No matches just yet"
              detail="Try adjusting your filters or explore all available event services."
              reset={() => {
                form.reset({ sort: 'recent' });
                navigate('/services');
              }}
            />
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {query.data.services.map((service, i) => (
                  <ServiceCard key={service.id} service={service} index={i} />
                ))}
              </div>
              {query.data.totalPages > 1 && (
                <div className="mt-9 flex items-center justify-center gap-4">
                  <Button
                    variant="secondary"
                    disabled={page <= 1}
                    onClick={() => movePage(page - 1)}
                  >
                    <ChevronLeft size={16} /> Previous
                  </Button>
                  <span className="text-sm font-semibold text-slate-500">
                    Page {query.data.currentPage} of {query.data.totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    disabled={page >= query.data.totalPages}
                    onClick={() => movePage(page + 1)}
                  >
                    Next <ChevronRight size={16} />
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
