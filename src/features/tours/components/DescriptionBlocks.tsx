import type { DescriptionBlock } from '@/core/blocks';
import { SectionCta } from './SectionCta';

/** Tras cada lista se intercala un CTA; los textos rotan para no repetir el mismo botón. */
export function DescriptionBlocks({ blocks, ctaLabels, ctaNote }: { blocks: DescriptionBlock[]; ctaLabels: string[]; ctaNote?: string }) {
  let n = 0;
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-navy/85">
      {blocks.map((b, i) => {
        if (b.type === 'h') return <h3 key={i} className="pt-4 font-display text-[26px] font-extrabold uppercase leading-none tracking-tight text-navy">{b.text}</h3>;
        if (b.type === 'p') return <p key={i}>{b.text}</p>;
        return (
          <div key={i} className="space-y-4">
            <div className="rounded-2xl bg-soft p-4">
              {b.title && <p className="mb-2 font-bold text-navy">{b.title}</p>}
              <ul className="space-y-1.5">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-2"><span className="text-brand">✔</span><span>{it}</span></li>
                ))}
              </ul>
            </div>
            <SectionCta label={ctaLabels[n++ % ctaLabels.length]} note={ctaNote} />
          </div>
        );
      })}
    </div>
  );
}
