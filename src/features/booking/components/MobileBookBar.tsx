import { BookNowButton } from './BookNowButton';

/** Barra fija inferior en móvil: un solo botón grande. */
export function MobileBookBar({ label }: { label: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(7,29,52,0.08)] lg:hidden">
      <div className="mx-auto max-w-xl">
        <BookNowButton label={label} large />
      </div>
    </div>
  );
}
