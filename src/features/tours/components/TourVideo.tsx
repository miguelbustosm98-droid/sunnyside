'use client';

import { useState } from 'react';

/** Video de YouTube con carga diferida (no descarga el reproductor hasta el clic). */
export function TourVideo({ id, title }: { id: string; title: string }) {
  const [play, setPlay] = useState(false);
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-navy">
      {play ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setPlay(true)} className="group absolute inset-0" aria-label={title}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" className="h-full w-full object-cover" loading="lazy" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition group-hover:bg-black/35">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl text-brand shadow-lg">▶</span>
          </span>
        </button>
      )}
    </div>
  );
}
