import type { Dict } from '@/i18n';
import type { Tour } from '../types';

export function QuickFacts({ tour, t }: { tour: Tour; t: Dict }) {
  const h = Math.floor(tour.durationMinutes / 60);
  const m = tour.durationMinutes % 60;
  const duration = [h ? `${h} ${t.tour.hours}` : '', m ? `${m} ${t.tour.minutes}` : ''].filter(Boolean).join(' ');
  const facts = [
    { icon: '⏱️', label: t.tour.duration, value: duration },
    tour.meetingPoint ? { icon: '📍', label: t.tour.meetingPoint, value: tour.meetingPoint } : null,
    { icon: '⚡', label: t.tour.instantConfirm, value: '' },
  ].filter(Boolean) as { icon: string; label: string; value: string }[];

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {facts.map((f) => (
        <li key={f.label} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-sm">
          <span aria-hidden>{f.icon}</span>
          <span><b>{f.label}</b>{f.value && <span className="text-navy/70"> · {f.value}</span>}</span>
        </li>
      ))}
    </ul>
  );
}
