'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { TourImage } from '../types';

interface Props {
  images: TourImage[];
  title: string;
  /** Clip corto (sin audio, en bucle) que va como primera diapositiva. */
  video?: { src: string; poster: string };
}

/** Carrusel con scroll-snap: se desliza con el dedo, sin miniaturas. */
export function TourGallery({ images, title, video }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [index, setIndex] = useState(0);
  const total = images.length + (video ? 1 : 0);

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

  // El video solo corre mientras está a la vista: no gasta batería ni datos en segundo plano.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (index === 0) v.play().catch(() => {});
    else v.pause();
  }, [index]);

  const go = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const next = Math.max(0, Math.min(total - 1, i));
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
  };

  const slide = 'relative aspect-[4/3] w-full shrink-0 snap-center md:aspect-[16/9]';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-soft">
      {total === 0 ? (
        <div className="aspect-[4/3] w-full md:aspect-[16/9]" />
      ) : (
        <div ref={ref} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth">
          {video && (
            <div className={slide}>
              {/* muted + playsInline son obligatorios para que arranque solo en iPhone */}
              <video
                ref={videoRef}
                src={video.src}
                poster={video.poster}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          )}
          {images.map((img, i) => (
            <div key={img.id} className={slide}>
              <Image
                src={img.url}
                alt={img.alt ?? title}
                fill
                sizes="(min-width: 1024px) 760px, 100vw"
                className="object-cover"
                priority={i === 0 && !video}
              />
            </div>
          ))}
        </div>
      )}

      {total > 1 && (
        <>
          <span className="absolute right-4 top-4 rounded-full bg-black/55 px-3.5 py-1.5 text-sm font-bold tracking-wide text-white">
            {index + 1} / {total}
          </span>
          <button type="button" aria-label="Anterior" onClick={() => go(index - 1)}
            className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 rounded-full bg-white/85 text-lg shadow md:block">‹</button>
          <button type="button" aria-label="Siguiente" onClick={() => go(index + 1)}
            className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 rounded-full bg-white/85 text-lg shadow md:block">›</button>
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/60'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
