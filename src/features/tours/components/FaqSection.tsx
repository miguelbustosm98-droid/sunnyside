/** Preguntas frecuentes en acordeón: resuelven objeciones sin alargar la página. */
export function FaqSection({ title, items }: { title: string; items: { q: string; a: string }[] }) {
  return (
    <section className="pt-2">
      <h3 className="mb-3 font-display text-[26px] font-extrabold uppercase leading-none tracking-tight">{title}</h3>
      <div className="divide-y divide-line rounded-2xl border border-line">
        {items.map((f) => (
          <details key={f.q} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
              {f.q}
              <span aria-hidden className="text-xl leading-none text-brand transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2 text-[15px] leading-relaxed text-navy/75">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
