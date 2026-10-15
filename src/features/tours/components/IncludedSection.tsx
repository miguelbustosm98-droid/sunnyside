import type { Dict } from '@/i18n';

const Check = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
const Cross = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" aria-hidden>
    <path d="M7 7l10 10M17 7L7 17" />
  </svg>
);

export function IncludedSection({ included, notIncluded, t }: { included: string[]; notIncluded: string[]; t: Dict }) {
  const cols = [
    { title: t.tour.included, items: included, icon: <Check />, tone: 'bg-emerald-50 text-emerald-600' },
    { title: t.tour.notIncluded, items: notIncluded, icon: <Cross />, tone: 'bg-red-50 text-red-500' },
  ];
  return (
    <section className="pt-2">
      <h3 className="mb-3 text-lg font-bold">{t.tour.includedTitle}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {cols.map((c) => (
          <div key={c.title} className="rounded-2xl border border-line p-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/50">{c.title}</p>
            <ul className="space-y-2.5 text-[15px] leading-snug text-navy/85">
              {c.items.map((it) => (
                <li key={it} className="flex gap-3">
                  <span className={`mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${c.tone}`}>{c.icon}</span>
                  <span className="pt-0.5">{it}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
