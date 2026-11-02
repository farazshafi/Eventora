import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function ServiceGallery({ title, images }: { title: string; images: string[] }) {
  const [imageIndex, setImageIndex] = useState(0);
  if (!images.length) {
    return (
      <div className="mt-7 flex min-h-72 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#e4eee8] to-[#f1eee4] font-display text-5xl font-bold text-[#91a795]">
        {title.charAt(0)}
      </div>
    );
  }
  return (
    <div className="mt-7 grid gap-3 overflow-hidden rounded-[28px] sm:aspect-[2.1] sm:grid-cols-[1.5fr_1fr] sm:grid-rows-2 sm:gap-3">
      <div className="relative row-span-2 aspect-[1.25] overflow-hidden bg-[#e8eee8] sm:aspect-auto">
        {images.map((src, index) => (
          <img
            key={`${src}-${index}`}
            src={src}
            alt={`${title}, photo ${index + 1}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${index === imageIndex ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              aria-label="Previous photo"
              onClick={() => setImageIndex((imageIndex + images.length - 1) % images.length)}
              className="flex size-9 items-center justify-center rounded-full bg-white/90"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              aria-label="Next photo"
              onClick={() => setImageIndex((imageIndex + 1) % images.length)}
              className="flex size-9 items-center justify-center rounded-full bg-white/90"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
      {[1, 2].map((offset) => (
        <div key={offset} className="hidden min-h-0 overflow-hidden bg-[#eef2ec] sm:block">
          <img
            src={images[(imageIndex + offset) % images.length]}
            alt={`${title}, photo ${((imageIndex + offset) % images.length) + 1}`}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
