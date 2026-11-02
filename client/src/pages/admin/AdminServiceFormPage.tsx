import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ImagePlus, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminError, AdminPageTitle, AdminSkeleton } from '../../components/admin/AdminUI';
import { Button, ButtonLink } from '../../components/ui/Button';
import { useAdminToast } from '../../components/admin/AdminUI';
import {
  useAdminServices,
  useCreateAdminService,
  useUpdateAdminService,
} from '../../hooks/useAdminServices';
import {
  managedServiceSchema,
  type ManagedServiceFormInput,
  type ManagedServiceFormOutput,
} from '../../schemas/service.schema';
import { serviceCategories } from '../../types/service.types';
import { categoryLabels } from '../../utils/format';
import { uploadServiceImages } from '../../api/service.api';

const inputClass =
  'mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#799985] focus:ring-4 focus:ring-[#dce9df]';

export default function AdminServiceFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const services = useAdminServices();
  const current = services.data?.find((item) => item.id === id);
  const create = useCreateAdminService();
  const update = useUpdateAdminService();
  const notify = useAdminToast();
  const navigate = useNavigate();
  const {
    register,
    control,
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ManagedServiceFormInput, unknown, ManagedServiceFormOutput>({
    resolver: zodResolver(managedServiceSchema),
    defaultValues: {
      title: '',
      category: 'MARRIAGE_VENUE',
      description: '',
      pricePerDay: '',
      location: '',
      address: '',
      images: [],
      contactDetails: { name: '', phone: '', email: '' },
      unavailableDates: [],
    },
  });
  const windows = useFieldArray({ control, name: 'unavailableDates' });
  useEffect(() => {
    if (!current) return;
    reset({
      title: current.title,
      category: current.category,
      description: current.description,
      pricePerDay: String(current.pricePerDay),
      location: current.location,
      address: current.address,
      images: current.images,
      contactDetails: {
        name: current.contactDetails.name,
        phone: current.contactDetails.phone,
        email: current.contactDetails.email ?? '',
      },
      unavailableDates: current.unavailableDates.map((window) => ({
        startDate: window.startDate.slice(0, 10),
        endDate: window.endDate.slice(0, 10),
      })),
    });
  }, [current, reset]);
  const submit = async (values: ManagedServiceFormOutput) => {
    try {
      if (id) await update.mutateAsync({ id, input: values });
      else await create.mutateAsync(values);
      notify(editing ? 'Service changes saved.' : 'Your service has been created.');
      navigate(editing ? `/admin/services/${id}` : '/admin/services');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not save this service.', 'error');
    }
  };
  const images = watch('images');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageError, setImageError] = useState('');
  const addImages = async (files: FileList | null) => {
    if (!files?.length) return;
    if (images.length + files.length > 20) {
      setImageError('Choose up to 20 images.');
      return;
    }
    setUploadingImages(true);
    setImageError('');
    try {
      const uploaded = await uploadServiceImages(Array.from(files));
      setValue('images', [...images, ...uploaded], { shouldValidate: true, shouldDirty: true });
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Could not upload images.');
    } finally {
      setUploadingImages(false);
    }
  };
  if (editing && services.isPending)
    return (
      <>
        <AdminPageTitle eyebrow="Your catalogue" title="Edit service" />
        <AdminSkeleton rows={7} />
      </>
    );
  if (editing && services.isError) return <AdminError retry={() => void services.refetch()} />;
  if (editing && !current)
    return (
      <>
        <AdminPageTitle
          eyebrow="Your catalogue"
          title="Service not found"
          detail="This service may have been removed or may belong to another administrator."
        />
        <ButtonLink variant="secondary" to="/admin/services">
          <ArrowLeft size={16} />
          Back to services
        </ButtonLink>
      </>
    );
  return (
    <>
      <AdminPageTitle
        eyebrow="Your catalogue"
        title={editing ? 'Edit service' : 'Add a service'}
        detail={
          editing
            ? 'Keep your listing up to date.'
            : 'Share the details customers need to picture their event.'
        }
        action={
          <ButtonLink to="/admin/services" variant="ghost">
            <ArrowLeft size={16} />
            Back to services
          </ButtonLink>
        }
      />
      <form
        onSubmit={handleSubmit(submit)}
        noValidate
        className="grid gap-6 xl:grid-cols-[1fr_340px]"
      >
        <div className="space-y-6">
          <section className="rounded-[28px] border border-[#e5ece4] bg-white p-5 sm:p-7">
            <h2 className="font-display text-xl font-bold">The essentials</h2>
            <p className="mt-1 text-sm text-slate-500">
              Give your service a clear, welcoming introduction.
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold sm:col-span-2">
                Service name
                <input
                  {...register('title')}
                  className={inputClass}
                  placeholder="e.g. Garden ceremony at Willow House"
                />
                {errors.title && <FieldError>{errors.title.message}</FieldError>}
              </label>
              <label className="text-sm font-semibold">
                Category
                <select {...register('category')} className={inputClass}>
                  {serviceCategories.map((category) => (
                    <option key={category} value={category}>
                      {categoryLabels[category]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold">
                Price per day
                <input
                  {...register('pricePerDay')}
                  inputMode="decimal"
                  className={inputClass}
                  placeholder="25000"
                />
                {errors.pricePerDay && <FieldError>{errors.pricePerDay.message}</FieldError>}
              </label>
              <label className="text-sm font-semibold">
                City or area
                <input {...register('location')} className={inputClass} placeholder="Jaipur" />
                {errors.location && <FieldError>{errors.location.message}</FieldError>}
              </label>
              <label className="text-sm font-semibold">
                Full address
                <input
                  {...register('address')}
                  className={inputClass}
                  placeholder="Area, landmark, city"
                />
                {errors.address && <FieldError>{errors.address.message}</FieldError>}
              </label>
              <label className="text-sm font-semibold sm:col-span-2">
                Description
                <textarea
                  {...register('description')}
                  rows={5}
                  className={inputClass}
                  placeholder="Tell customers what makes this service special…"
                />
                {errors.description && <FieldError>{errors.description.message}</FieldError>}
              </label>
              <div className="text-sm font-semibold sm:col-span-2">
                Service images <span className="font-normal text-slate-400">(up to 20)</span>
                <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-[#fafbf9] px-4 py-6 text-sm font-semibold text-slate-600 hover:border-[#799985]">
                  <ImagePlus size={18} /> {uploadingImages ? 'Uploading images…' : 'Choose images'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    disabled={uploadingImages}
                    onChange={(event) => {
                      void addImages(event.target.files);
                      event.target.value = '';
                    }}
                  />
                </label>
                {imageError && <FieldError>{imageError}</FieldError>}
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {images.map((src, index) => (
                    <div
                      key={src}
                      className="relative aspect-square overflow-hidden rounded-xl bg-slate-100"
                    >
                      <img
                        src={src}
                        alt={`Service image ${index + 1}`}
                        className="size-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setValue(
                            'images',
                            images.filter((_, item) => item !== index),
                            { shouldDirty: true },
                          )
                        }
                        aria-label="Remove image"
                        className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/90 text-slate-700"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <section className="rounded-[28px] border border-[#e5ece4] bg-white p-5 sm:p-7">
            <h2 className="font-display text-xl font-bold">Contact information</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              <label className="text-sm font-semibold">
                Contact name
                <input {...register('contactDetails.name')} className={inputClass} />
                {errors.contactDetails?.name && (
                  <FieldError>{errors.contactDetails.name.message}</FieldError>
                )}
              </label>
              <label className="text-sm font-semibold">
                Phone
                <input {...register('contactDetails.phone')} className={inputClass} />
                {errors.contactDetails?.phone && (
                  <FieldError>{errors.contactDetails.phone.message}</FieldError>
                )}
              </label>
              <label className="text-sm font-semibold">
                Email <span className="font-normal text-slate-400">optional</span>
                <input {...register('contactDetails.email')} type="email" className={inputClass} />
                {errors.contactDetails?.email && (
                  <FieldError>{errors.contactDetails.email.message}</FieldError>
                )}
              </label>
            </div>
          </section>
        </div>
        <aside className="h-fit rounded-[28px] border border-[#e5ece4] bg-white p-5 sm:p-7">
          <h2 className="font-display text-xl font-bold">Availability</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Mark dates this service is unavailable. Date ranges include both their start and end
            dates.
          </p>
          <div className="mt-5 space-y-3">
            {windows.fields.map((field, index) => (
              <div key={field.id} className="rounded-2xl bg-[#f7f9f6] p-3">
                <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                  <label className="text-xs font-semibold">
                    From
                    <input
                      type="date"
                      {...register(`unavailableDates.${index}.startDate`)}
                      className={inputClass}
                    />
                  </label>
                  <label className="text-xs font-semibold">
                    Through
                    <input
                      type="date"
                      {...register(`unavailableDates.${index}.endDate`)}
                      className={inputClass}
                    />
                  </label>
                  <button
                    type="button"
                    aria-label="Remove unavailable dates"
                    onClick={() => windows.remove(index)}
                    className="mb-1 grid size-10 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {(errors.unavailableDates?.[index]?.startDate ||
                  errors.unavailableDates?.[index]?.endDate) && (
                  <FieldError>Choose a valid date range.</FieldError>
                )}
              </div>
            ))}
          </div>
          {errors.unavailableDates?.root && (
            <FieldError>{errors.unavailableDates.root.message}</FieldError>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={() => windows.append({ startDate: '', endDate: '' })}
            className="mt-4 w-full"
          >
            <Plus size={16} />
            Add dates
          </Button>
          <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6">
            <Button disabled={isSubmitting || create.isPending || update.isPending}>
              {create.isPending || update.isPending
                ? 'Saving…'
                : editing
                  ? 'Save changes'
                  : 'Create service'}
            </Button>
            <ButtonLink
              variant="ghost"
              to={editing && id ? `/admin/services/${id}` : '/admin/services'}
              className="w-full"
            >
              Cancel
            </ButtonLink>
          </div>
        </aside>
      </form>
    </>
  );
}

function FieldError({ children }: { children?: React.ReactNode }) {
  return children ? (
    <span className="mt-1 block text-xs font-medium text-rose-700">{children}</span>
  ) : null;
}
