import type { ReactNode } from 'react';

const base = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

export const ClockIcon = () => (
  <svg {...base}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const UserIcon = () => (
  <svg {...base}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg>
);
export const ShieldIcon = () => (
  <svg {...base}><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></svg>
);
export const PinIcon = () => (
  <svg {...base}><path d="M12 21s-7-6.1-7-11.5a7 7 0 0114 0C19 14.9 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);

/** Ícono con la barrita amarilla debajo (estilo del sitio de Sunnyside). */
export function IconWithBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-3 pt-0.5 text-navy">
      {children}
      <span className="h-[3px] w-7 rounded-full bg-accent" />
    </div>
  );
}
