import type { Dict } from '@/i18n';
import type { Tour } from '../types';
import { ClockIcon, IconWithBar, UserIcon } from './icons';

/** "3 horas", "1.5 horas"; si no cae en cuartos de hora, "100 min". */
function formatDuration(minutes: number, t: Dict): string {
  const h = minutes / 60;
  if (minutes < 60 || !Number.isInteger(h * 4)) return `${minutes} ${t.tour.minutes}`;
  return `${h} ${h === 1 ? t.tour.hour : t.tour.hoursLong}`;
}

export function QuickFacts({ tour, t }: { tour: Tour; t: Dict }) {
  const facts = [
    { icon: <ClockIcon />, label: t.tour.duration, value: formatDuration(tour.durationMinutes, t) },
    { icon: <UserIcon />, label: t.tour.minimum, value: String(tour.minTravelers) },
  ];

  return (
    <ul className="grid grid-cols-2 gap-2">
      {facts.map((f) => (
        <li key={f.label} className="flex items-start gap-4 rounded-2xl border border-line px-5 py-5">
          <IconWithBar>{f.icon}</IconWithBar>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/50">{f.label}</p>
            <p className="mt-1 whitespace-nowrap font-serif text-2xl leading-tight">{f.value}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
