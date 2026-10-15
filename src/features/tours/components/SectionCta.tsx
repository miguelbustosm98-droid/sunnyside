import { BookNowButton } from '@/features/booking/components/BookNowButton';

/** CTA entre secciones de texto, con un rebote leve para llamar la atención. */
export function SectionCta({ label }: { label: string }) {
  return (
    <div className="flex justify-center py-2">
      <div className="w-full animate-nudge sm:w-auto">
        <BookNowButton label={label} className="sm:min-w-80" />
      </div>
    </div>
  );
}
