'use client';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function track(event: string, params?: Record<string, unknown>, eventId?: string) {
  if (typeof window === 'undefined' || !window.fbq) return;
  if (eventId) window.fbq('track', event, params ?? {}, { eventID: eventId });
  else window.fbq('track', event, params ?? {});
}

export function newEventId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
