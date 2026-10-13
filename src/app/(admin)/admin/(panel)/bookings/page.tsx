import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatMoney } from '@/core/money';
import { shortTime } from '@/core/dates';

const STATUSES = ['all', 'paid', 'pending', 'cancelled', 'expired', 'refunded'] as const;

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = 'paid' } = await searchParams;
  const supabase = await createClient();
  let q = supabase.from('bookings')
    .select('id,code,status,tour_date,tour_time,travelers,total_cents,currency,customer_name,customer_phone,tours(slug)')
    .order('created_at', { ascending: false }).limit(200);
  if (status !== 'all') q = q.eq('status', status);
  const { data } = await q;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/bookings?status=${s}`}
            className={`rounded-full px-3 py-1 text-sm ${s === status ? 'bg-brand text-white' : 'bg-white'}`}>{s}</Link>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-navy/60">
            <tr><th className="p-3">Código</th><th>Tour</th><th>Fecha</th><th>Pax</th><th>Cliente</th><th>Total</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {((data ?? []) as any[]).map((b) => (
              <tr key={b.id} className="border-b border-line last:border-0">
                <td className="p-3"><Link href={`/admin/bookings/${b.id}`} className="font-mono text-brand underline">{b.code}</Link></td>
                <td>{b.tours?.slug}</td>
                <td>{b.tour_date} {shortTime(b.tour_time)}</td>
                <td>{b.travelers}</td>
                <td>{b.customer_name}<br /><span className="text-navy/60">{b.customer_phone}</span></td>
                <td>{formatMoney(b.total_cents, b.currency)}</td>
                <td>{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(data ?? []).length === 0 && <p className="p-4 text-sm text-navy/60">Sin resultados.</p>}
      </div>
    </div>
  );
}
