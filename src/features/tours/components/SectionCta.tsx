import { BookNowButton } from '@/features/booking/components/BookNowButton';

/** CTA entre secciones de texto, con un rebote leve y una línea que quita el miedo a reservar. */
export function SectionCta({ label, note }: { label: string; note?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div className="w-full animate-nudge sm:w-auto">
        <BookNowButton label={label} className="sm:min-w-80" />
      </div>
      {note && <p className="text-center text-xs text-navy/60">{note}</p>}
    </div>
  );
}
