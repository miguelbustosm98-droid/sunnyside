'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { TourImage } from '../types';

interface Props {
  images: TourImage[];
  title: string;
  location: string | null;
}

/** Carrusel con scroll-snap: se desliza con el dedo, sin miniaturas. */
export function TourGallery({ images, title, location }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  const go = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const next = Math.max(0, Math.min(images.length - 1, i));
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
  };

  if (images.length === 0) {
    return <div className="aspect-[4/3] w-full rounded-2xl bg-soft" />;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-navy">
      <div ref={ref} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth">
        {images.map((img, i) => (
          <div key={img.id} className="relative aspect-[4/3] w-full shrink-0 snap-center md:aspect-[16/9]">
            <Image
              src={img.url}
              alt={img.alt ?? title}
              fill
              sizes="(min-width: 1024px) 760px, 100vw"
              className="object-cover"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-16 text-white">
        <h1 className="text-2xl font-extrabold leading-tight drop-shadow md:text-3xl">{title}</h1>
        {location && <p className="mt-1 text-sm opacity-90">📍 {location}</p>}
      </div>

      {images.length > 1 && (
        <>
          <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">
            {index + 1} / {images.length}
          </span>
          <button type="button" aria-label="Anterior" onClick={() => go(index - 1)}
            className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 rounded-full bg-white/85 text-lg shadow md:block">‹</button>
          <button type="button" aria-label="Siguiente" onClick={() => go(index + 1)}
            className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 rounded-full bg-white/85 text-lg shadow md:block">›</button>
          <div className="absolute bottom-3 right-4 flex gap-1.5">
            {images.map((img, i) => (
              <span key={img.id} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
