import { ArrowUpRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { categoryLabels, formatPrice } from '../../utils/format';
import type { Service } from '../../types/service.types';

// Lightweight copy-in SpotlightCard pattern from React Bits, with the pointer glow rendered in CSS.
export function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  function moveSpotlight(event: React.PointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
  }
  return (
    <article
      onPointerMove={moveSpotlight}
      className="service-card group overflow-hidden rounded-[25px] border border-[#e8ece7] bg-white"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <Link to={`/services/${service.id}`} className="block">
        <div className="relative aspect-[1.42] overflow-hidden bg-[#e9eee9]">
          {service.images[0] ? (
            <img
              src={service.images[0]}
              alt={service.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.045]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#e4eee8] via-[#f3f1e9] to-[#e9e5db]">
              <span className="font-display text-4xl font-bold text-[#95ac9c]">
                {service.title.slice(0, 1).toUpperCase()}
              </span>
            </div>
          )}
          <span className="absolute left-4 top-4 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-[#355c4c] backdrop-blur">
            {categoryLabels[service.category]}
          </span>
          <span className="absolute bottom-4 right-4 flex size-9 translate-y-2 items-center justify-center rounded-full bg-white text-[#173d33] opacity-0 shadow transition-all group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight size={17} />
          </span>
        </div>
        <div className="p-5">
          <h3 className="line-clamp-1 font-display text-lg font-bold tracking-tight text-[#20352b]">
            {service.title}
          </h3>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin size={14} className="text-[#8ba392]" />
            <span>{service.location}</span>
          </div>
          <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
            <div>
              <span className="font-display text-lg font-extrabold text-[#173d33]">
                {formatPrice(service.pricePerDay)}
              </span>
              <span className="ml-1 text-xs text-slate-400">/ day</span>
            </div>
            <span className="text-xs font-semibold text-[#607d6b]">View details</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
