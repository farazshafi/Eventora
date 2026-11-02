import { ArrowLeft, CalendarDays, MapPin, Pencil, Phone, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AdminEmpty,
  AdminError,
  AdminPageTitle,
  AdminSkeleton,
  ConfirmDialog,
} from '../../components/admin/AdminUI';
import { Button, ButtonLink } from '../../components/ui/Button';
import { useAdminToast } from '../../components/admin/AdminUI';
import { useAdminServices, useDeleteAdminService } from '../../hooks/useAdminServices';
import { categoryLabels, formatDate, formatPrice } from '../../utils/format';

export default function AdminServiceDetailsPage() {
  const { id = '' } = useParams();
  const query = useAdminServices();
  const remove = useDeleteAdminService();
  const notify = useAdminToast();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const service = query.data?.find((item) => item.id === id);
  if (query.isPending) return <AdminSkeleton rows={6} />;
  if (query.isError) return <AdminError retry={() => void query.refetch()} />;
  if (!service)
    return (
      <AdminEmpty
        title="Service not found"
        detail="This listing may have been removed or may belong to another administrator."
        action={
          <ButtonLink variant="secondary" to="/admin/services">
            <ArrowLeft size={16} />
            Back to services
          </ButtonLink>
        }
      />
    );
  const deleteService = async () => {
    try {
      await remove.mutateAsync(service.id);
      notify('Service deleted.');
      navigate('/admin/services');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not delete this service.', 'error');
    }
  };
  return (
    <>
      <AdminPageTitle
        eyebrow={categoryLabels[service.category]}
        title={service.title}
        detail={`${service.location} · ${formatPrice(service.pricePerDay)} per day`}
        action={
          <div className="flex gap-2">
            <ButtonLink to="/admin/services" variant="ghost">
              <ArrowLeft size={16} />
              All services
            </ButtonLink>
            <ButtonLink to={`/admin/services/${service.id}/edit`} variant="secondary">
              <Pencil size={16} />
              Edit
            </ButtonLink>
          </div>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6 rounded-[28px] border border-[#e5ece4] bg-white p-5 sm:p-7">
          {service.images.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {service.images.slice(0, 4).map((image, index) => (
                <img
                  key={image}
                  src={image}
                  alt={`${service.title} ${index + 1}`}
                  className={`max-h-[420px] w-full rounded-2xl object-cover ${index === 0 ? 'sm:col-span-2' : ''}`}
                />
              ))}
            </div>
          ) : (
            <div className="grid h-48 place-items-center rounded-2xl bg-[#f0f4ef] text-sm text-slate-400">
              No images added
            </div>
          )}
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#789080]">
              About this service
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {service.description}
            </p>
          </div>
          <div className="flex items-start gap-3 border-t border-slate-100 pt-5">
            <MapPin className="mt-0.5 text-[#64816d]" size={18} />
            <div>
              <p className="text-sm font-bold">{service.location}</p>
              <p className="mt-1 text-sm text-slate-500">{service.address}</p>
            </div>
          </div>
        </div>
        <aside className="h-fit rounded-[28px] border border-[#e5ece4] bg-white p-6">
          <h2 className="font-display text-xl font-bold">Listing details</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-slate-400">Daily price</dt>
              <dd className="mt-1 text-lg font-bold">{formatPrice(service.pricePerDay)}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Contact</dt>
              <dd className="mt-1 font-semibold">{service.contactDetails.name}</dd>
              <dd className="mt-1 flex items-center gap-2 text-slate-600">
                <Phone size={14} />
                {service.contactDetails.phone}
              </dd>
              {service.contactDetails.email && (
                <dd className="mt-1 text-slate-600">{service.contactDetails.email}</dd>
              )}
            </div>
            <div>
              <dt className="text-slate-400">Created</dt>
              <dd className="mt-1">{formatDate(service.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Unavailable dates</dt>
              {service.unavailableDates.length ? (
                <dd className="mt-2 space-y-2">
                  {service.unavailableDates.map((range, index) => (
                    <p
                      key={index}
                      className="flex items-center gap-2 rounded-xl bg-[#f7f9f6] p-3 text-xs"
                    >
                      <CalendarDays size={14} />
                      {formatDate(range.startDate)} – {formatDate(range.endDate)}
                    </p>
                  ))}
                </dd>
              ) : (
                <dd className="mt-1 text-slate-600">No unavailable dates recorded</dd>
              )}
            </div>
          </dl>
          <Button
            className="mt-7 w-full bg-rose-700 hover:bg-rose-800"
            onClick={() => setConfirming(true)}
          >
            <Trash2 size={16} />
            Delete service
          </Button>
        </aside>
      </div>
      {confirming && (
        <ConfirmDialog
          title={`Delete “${service.title}”?`}
          detail="This removes the listing from your services. Existing bookings remain in your history."
          confirmLabel="Delete service"
          busy={remove.isPending}
          onCancel={() => setConfirming(false)}
          onConfirm={() => void deleteService()}
        />
      )}
    </>
  );
}
