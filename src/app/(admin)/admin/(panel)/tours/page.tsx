import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function ToursAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from('tours').select('id,slug,status,tour_translations(locale,title)').order('sort_order');
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-extrabold">Tours</h1>
        <Link href="/admin/tours/new" className="rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white">Nuevo tour</Link>
      </div>
      <ul className="divide-y divide-line rounded-2xl bg-white shadow-sm">
        {((data ?? []) as any[]).map((t) => (
          <li key={t.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-semibold">{t.tour_translations?.find((x: any) => x.locale === 'es')?.title ?? t.slug}</p>
              <p className="text-sm text-navy/60">/{t.slug} · {t.status}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link className="text-brand underline" href={`/es/tours/${t.slug}`} target="_blank">Ver</Link>
              <Link className="text-brand underline" href={`/admin/tours/${t.id}`}>Editar</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
