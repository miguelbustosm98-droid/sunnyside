'use client';

import { useEffect } from 'react';
import { track } from './track';

/** Dispara Purchase una sola vez por reserva (el mismo eventID deduplica con CAPI). */
export function PurchaseEvent({ eventId, value, currency }: { eventId: string; value: number; currency: string }) {
  useEffect(() => {
    const key = `ss_purchase_${eventId}`;
    try { if (sessionStorage.getItem(key)) return; } catch { /* ignore */ }
    let tries = 0;
    const t = setInterval(() => {
      tries++;
      if (window.fbq || tries > 20) {
        clearInterval(t);
        track('Purchase', { value, currency }, eventId);
        try { sessionStorage.setItem(key, '1'); } catch { /* ignore */ }
      }
    }, 250);
    return () => clearInterval(t);
  }, [eventId, value, currency]);
  return null;
}
