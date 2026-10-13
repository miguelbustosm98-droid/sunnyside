import { BookNowButton } from './BookNowButton';

/** Barra fija inferior en móvil. */
export function MobileBookBar({ label, priceLabel }: { label: string; priceLabel: string | null }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 p-3 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-xl items-center gap-3">
        {priceLabel && <span className="shrink-0 text-sm leading-tight text-navy/70">{priceLabel}</span>}
        <BookNowButton label={label} />
      </div>
    </div>
  );
}
