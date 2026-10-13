'use client';

import { track } from '@/features/analytics/track';

export const OPEN_BOOKING_EVENT = 'ss:open-booking';

export function BookNowButton({ label, large = false, className = '' }: { label: string; large?: boolean; className?: string }) {
  const size = large ? 'rounded-2xl py-4 text-xl font-black' : 'rounded-xl py-3.5 text-base font-extrabold';
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent(OPEN_BOOKING_EVENT));
        track('Lead');
      }}
      className={`w-full bg-brand px-5 text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark active:scale-[.99] ${size} ${className}`}
    >
      {label}
    </button>
  );
}
