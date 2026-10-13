/** Bloques de descripción (jsonb en BD). */
export type DescriptionBlock =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'list'; title?: string; items: string[] };

export function parseBlocks(input: unknown): DescriptionBlock[] {
  if (!Array.isArray(input)) return [];
  const out: DescriptionBlock[] = [];
  for (const b of input) {
    if (!b || typeof b !== 'object') continue;
    const o = b as Record<string, unknown>;
    if ((o.type === 'p' || o.type === 'h') && typeof o.text === 'string') {
      out.push({ type: o.type, text: o.text });
    } else if (o.type === 'list' && Array.isArray(o.items)) {
      out.push({
        type: 'list',
        title: typeof o.title === 'string' ? o.title : undefined,
        items: o.items.filter((i): i is string => typeof i === 'string'),
      });
    }
  }
  return out;
}

/**
 * Formato de texto editable en el panel:
 *   - Párrafos separados por una línea en blanco.
 *   - "## Título" -> subtítulo.
 *   - Líneas que empiezan con "- " -> lista (una línea previa que termina en ":" es el título de la lista).
 */
export function textToBlocks(text: string): DescriptionBlock[] {
  const out: DescriptionBlock[] = [];
  for (const raw of text.replace(/\r\n/g, '\n').split(/\n\s*\n/)) {
    const chunk = raw.trim();
    if (!chunk) continue;
    if (chunk.startsWith('## ') && !chunk.includes('\n')) {
      out.push({ type: 'h', text: chunk.slice(3).trim() });
      continue;
    }
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
    const firstItem = lines.findIndex((l) => l.startsWith('- '));
    if (firstItem !== -1 && lines.slice(firstItem).every((l) => l.startsWith('- ')) && firstItem <= 1) {
      out.push({
        type: 'list',
        title: firstItem === 1 ? lines[0].replace(/:$/, '') : undefined,
        items: lines.slice(firstItem).map((l) => l.slice(2).trim()),
      });
      continue;
    }
    out.push({ type: 'p', text: lines.join(' ') });
  }
  return out;
}

export function blocksToText(blocks: DescriptionBlock[]): string {
  return blocks
    .map((b) => {
      if (b.type === 'h') return `## ${b.text}`;
      if (b.type === 'p') return b.text;
      return [b.title ? `${b.title}:` : null, ...b.items.map((i) => `- ${i}`)].filter(Boolean).join('\n');
    })
    .join('\n\n');
}
