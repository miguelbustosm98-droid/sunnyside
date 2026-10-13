import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatMoney } from '@/core/money';
import { shortTime, todayInMexico, addDays } from '@/core/dates';

export default async function Dashboard() {
  const supabase = await createClient();
  const today = todayInMexico();
  const since = addDays(today, -30);
  const [{ data: paid }, { data: upcoming }, { count: pending }] = await Promise.all([
    supabase.from('bookings').select('total_cents,currency').eq('status', 'paid').gte('paid_at', since),
    supabase.from('bookings').select('id,code,tour_date,tour_time,travelers,customer_name,tours(slug)').eq('status', 'paid')
      .gte('tour_date', today).lte('tour_date', addDays(today, 7)).order('tour_date').order('tour_time'),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);
  const revenue = (paid ?? []).reduce((s: number, b: any) => s + b.total_cents, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card label="Reservas pagadas (30 días)" value={String(paid?.length ?? 0)} />
        <Card label="Ingresos (30 días)" value={formatMoney(revenue, 'MXN')} />
        <Card label="Pendientes de pago" value={String(pending ?? 0)} />
      </div>
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold">Próximos 7 días</h2>
        {(upcoming ?? []).length === 0 ? <p className="text-sm text-navy/60">Sin reservas próximas.</p> : (
          <ul className="divide-y divide-line text-sm">
            {(upcoming as any[]).map((b) => (
              <li key={b.id} className="flex items-center justify-between py-2">
                <span>{b.tour_date} · {shortTime(b.tour_time)} · {b.tours?.slug}</span>
                <Link href={`/admin/bookings/${b.id}`} className="text-brand underline">{b.customer_name} ({b.travelers})</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-sm text-navy/60">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </div>
  );
}
