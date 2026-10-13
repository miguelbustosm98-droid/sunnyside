'use client';

import { useEffect } from 'react';
import { track } from './track';

export function TrackView({ name, id, value, currency }: { name: string; id: string; value: number | null; currency: string }) {
  useEffect(() => {
    // fbq se carga afterInteractive; reintenta brevemente.
    let tries = 0;
    const t = setInterval(() => {
      tries++;
      if (window.fbq || tries > 20) {
        clearInterval(t);
        track('ViewContent', { content_name: name, content_ids: [id], content_type: 'product', value: value ? value / 100 : undefined, currency });
      }
    }, 250);
    return () => clearInterval(t);
  }, [name, id, value, currency]);
  return null;
}
