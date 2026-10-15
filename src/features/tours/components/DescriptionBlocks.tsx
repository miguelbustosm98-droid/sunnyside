import type { DescriptionBlock } from '@/core/blocks';
import { SectionCta } from './SectionCta';

/** Tras cada lista (las secciones de "qué vas a vivir") se intercala un CTA. */
export function DescriptionBlocks({ blocks, ctaLabel }: { blocks: DescriptionBlock[]; ctaLabel: string }) {
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-navy/85">
      {blocks.map((b, i) => {
        if (b.type === 'h') return <h3 key={i} className="pt-2 text-lg font-bold text-navy">{b.text}</h3>;
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
            <SectionCta label={ctaLabel} />
          </div>
        );
      })}
    </div>
  );
}
