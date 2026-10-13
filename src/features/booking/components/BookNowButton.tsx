'use client';

import { track } from '@/features/analytics/track';

export const OPEN_BOOKING_EVENT = 'ss:open-booking';

export function BookNowButton({ label, className = '' }: { label: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent(OPEN_BOOKING_EVENT));
        track('Lead');
      }}
      className={`w-full rounded-xl bg-brand px-5 py-3.5 text-base font-extrabold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark active:scale-[.99] ${className}`}
    >
      {label}
    </button>
  );
}
