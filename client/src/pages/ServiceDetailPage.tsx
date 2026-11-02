import { ArrowLeft, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { formatPrice } from '../utils/format';
import { Busy, ErrorNotice } from '../components/common/States';
import { useService, useServiceAvailability } from '../hooks/useServices';
import { ServiceGallery } from '../components/service/ServiceGallery';
import { ServiceBookingPanel } from '../components/service/ServiceBookingPanel';

export default function ServiceDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const service = useService(id);
  const available = useServiceAvailability(id, startDate, endDate);
  if (service.isLoading)
    return (
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <Busy label="Loading service" />
      </main>
    );
  if (service.isError || !service.data)
    return (
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <ErrorNotice
          message={
            service.error instanceof Error
              ? service.error.message
              : 'We couldn’t find that service.'
          }
          retry={() => void service.refetch()}
        />
        <Link
          to="/services"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#45684f]"
        >
          <ArrowLeft size={16} /> Browse services
        </Link>
      </main>
    );
  const item = service.data;
  return (
    <main className="mx-auto max-w-7xl px-5 pb-12 pt-8 sm:px-8 sm:pt-10">
      <Link
        to="/services"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#365843]"
      >
        <ArrowLeft size={15} /> Back to explore
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{item.category.replaceAll('_', ' ')}</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-.05em] text-[#20382b] sm:text-4xl">
            {item.title}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin size={15} className="text-[#799380]" />
            {item.location}
          </p>
        </div>
        <div className="text-right">
          <span className="font-display text-2xl font-extrabold text-[#244b36]">
            {formatPrice(item.pricePerDay)}
          </span>
          <span className="ml-1 text-sm text-slate-400">/ day</span>
        </div>
      </div>
      <ServiceGallery title={item.title} images={item.images} key={item.id} />
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <section>
          <h2 className="font-display text-2xl font-bold text-[#253c2d]">
            A little about this service
          </h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
            {item.description}
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="flex gap-3 rounded-2xl border border-[#e7ece7] bg-white p-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#edf3ed] text-[#587963]">
                <MapPin size={17} />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-400">Location</p>
                <p className="mt-1 text-sm font-bold text-[#304639]">{item.location}</p>
                <p className="mt-1 text-xs text-slate-500">{item.address}</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-2xl border border-[#e7ece7] bg-white p-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#edf3ed] text-[#587963]">
                <Phone size={17} />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-400">Your service contact</p>
                <p className="mt-1 text-sm font-bold text-[#304639]">{item.contactDetails.name}</p>
                <a
                  href={`tel:${item.contactDetails.phone}`}
                  className="mt-1 block text-xs text-[#56725f]"
                >
                  {item.contactDetails.phone}
                </a>
                {item.contactDetails.email && (
                  <a
                    href={`mailto:${item.contactDetails.email}`}
                    className="mt-1 block text-xs text-[#56725f]"
                  >
                    {item.contactDetails.email}
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-start gap-3 rounded-2xl bg-[#f0f4ef] p-5">
            <ShieldCheck className="mt-0.5 shrink-0 text-[#5b7c65]" size={19} />
            <div>
              <p className="text-sm font-bold text-[#31503c]">Clear, thoughtful booking</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Your request is sent to the service provider. The booking status will be shown in
                your account.
              </p>
            </div>
          </div>
        </section>
        <ServiceBookingPanel
          service={item}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          availability={available}
          onContinue={() => navigate(`/checkout/${id}?startDate=${startDate}&endDate=${endDate}`)}
        />
      </div>
    </main>
  );
}
