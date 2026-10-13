import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { saveBookingNotes, setBookingStatus } from '@/features/admin/actions';
import { formatMoney } from '@/core/money';
import { shortTime } from '@/core/dates';

export default async function BookingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: b } = await supabase.from('bookings').select('*, booking_items(*), tours(slug)').eq('id', id).maybeSingle();
  if (!b) notFound();
  const wa = String(b.customer_phone).replace(/\D/g, '');

  return (
    <div className="max-w-2xl space-y-5">
      <Link href="/admin/bookings" className="text-sm text-brand underline">← Reservas</Link>
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="text-xl font-extrabold">Reserva <span className="font-mono">{b.code}</span> · {b.status}</h1>
        <dl className="mt-4 grid grid-cols-[130px_1fr] gap-y-1.5 text-sm">
          <dt className="text-navy/60">Tour</dt><dd>{b.tours?.slug}</dd>
          <dt className="text-navy/60">Fecha</dt><dd>{b.tour_date} · {shortTime(b.tour_time)}</dd>
          <dt className="text-navy/60">Viajeros</dt><dd>{b.travelers}</dd>
          <dt className="text-navy/60">Total</dt><dd>{formatMoney(b.total_cents, b.currency)}</dd>
          <dt className="text-navy/60">Cliente</dt><dd>{b.customer_name}</dd>
          <dt className="text-navy/60">Correo</dt><dd>{b.customer_email}</dd>
          <dt className="text-navy/60">Teléfono</dt><dd>{b.customer_phone} · <a className="text-brand underline" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">WhatsApp</a></dd>
          <dt className="text-navy/60">Hospedaje</dt><dd>{b.lodging || '—'}</dd>
          <dt className="text-navy/60">Comentarios</dt><dd>{b.comments || '—'}</dd>
          <dt className="text-navy/60">Origen</dt><dd className="break-all">{(b.utm as any)?.utm_source ?? '—'} / {(b.utm as any)?.utm_campaign ?? '—'}</dd>
        </dl>
        <ul className="mt-4 border-t border-line pt-3 text-sm">
          {(b.booking_items ?? []).map((i: any) => (
            <li key={i.id}>{i.quantity} × {i.option_name} — {formatMoney(i.unit_price_cents, b.currency)}</li>
          ))}
        </ul>
      </div>

      <form action={saveBookingNotes} className="rounded-2xl bg-white p-5 shadow-sm">
        <input type="hidden" name="id" value={b.id} />
        <label className="text-sm font-bold">Notas internas</label>
        <textarea name="notes" defaultValue={b.internal_notes ?? ''} rows={3} className="mt-2 w-full rounded-xl border border-line p-3 text-sm" />
        <button className="mt-2 rounded-xl bg-navy px-4 py-2 text-sm font-bold text-white">Guardar nota</button>
      </form>

      <form action={setBookingStatus} className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-5 shadow-sm">
        <input type="hidden" name="id" value={b.id} />
        <span className="text-sm font-bold">Cambiar estado:</span>
        {['paid', 'cancelled', 'refunded'].map((s) => (
          <button key={s} name="status" value={s} disabled={b.status === s} className="rounded-xl border border-line px-3 py-1.5 text-sm disabled:opacity-40">{s}</button>
        ))}
        <p className="w-full text-xs text-navy/60">Cancelar o marcar reembolsada libera el cupo. El reembolso del dinero se hace desde Stripe.</p>
      </form>
    </div>
  );
}
