import type { DescriptionBlock } from '@/core/blocks';

export function DescriptionBlocks({ blocks }: { blocks: DescriptionBlock[] }) {
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-navy/85">
      {blocks.map((b, i) => {
        if (b.type === 'h') return <h3 key={i} className="pt-2 text-lg font-bold text-navy">{b.text}</h3>;
        if (b.type === 'p') return <p key={i}>{b.text}</p>;
        return (
          <div key={i} className="rounded-2xl bg-soft p-4">
            {b.title && <p className="mb-2 font-bold text-navy">{b.title}</p>}
            <ul className="space-y-1.5">
              {b.items.map((it, j) => (
                <li key={j} className="flex gap-2"><span className="text-brand">✔</span><span>{it}</span></li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
