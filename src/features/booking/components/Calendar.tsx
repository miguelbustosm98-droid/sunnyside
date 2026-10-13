'use client';

import { isoDate } from '@/core/dates';
import type { Dict } from '@/i18n';

interface Props {
  year: number;
  month: number; // 0-11
  available: Set<string>;
  selected: string | null;
  onSelect: (date: string) => void;
  onMonthChange: (delta: number) => void;
  canGoPrev: boolean;
  t: Dict;
}

export function Calendar({ year, month, available, selected, onSelect, onMonthChange, canGoPrev, t }: Props) {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: first.getDay() }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button type="button" onClick={() => onMonthChange(-1)} disabled={!canGoPrev} aria-label={t.booking.prevMonth}
          className="h-9 w-9 rounded-full border border-line text-lg disabled:opacity-30">‹</button>
        <span className="font-bold capitalize">{t.months[month]} {year}</span>
        <button type="button" onClick={() => onMonthChange(1)} aria-label={t.booking.nextMonth}
          className="h-9 w-9 rounded-full border border-line text-lg">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-navy/60">
        {t.weekdaysShort.map((d) => <div key={d} className="py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />;
          const iso = isoDate(new Date(year, month, day));
          const ok = available.has(iso);
          const sel = selected === iso;
          return (
            <button
              key={iso}
              type="button"
              disabled={!ok}
              onClick={() => onSelect(iso)}
              className={`aspect-square rounded-lg text-sm font-semibold transition ${
                sel ? 'bg-brand text-white' : ok ? 'bg-brand/10 text-brand hover:bg-brand/20' : 'text-navy/25'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
