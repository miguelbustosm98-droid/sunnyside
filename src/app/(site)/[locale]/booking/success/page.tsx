import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDict, isLocale } from '@/i18n';
import { createServiceClient } from '@/lib/supabase/admin';
import { PurchaseEvent } from '@/features/analytics/PurchaseEvent';
import { formatMoney } from '@/core/money';
import { shortTime } from '@/core/dates';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { locale } = await params;
  const { session_id } = await searchParams;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);

  let booking: any = null;
  if (session_id) {
    const db = createServiceClient();
    const { data } = await db.from('bookings').select('*').eq('stripe_session_id', session_id).maybeSingle();
    booking = data;
  }
  const paid = booking?.status === 'paid';

  return (
    <main className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="text-5xl">{paid ? '✅' : '⏳'}</div>
      <h1 className="mt-4 text-2xl font-extrabold">{paid ? t.success.title : t.success.pending}</h1>
      {paid && <p className="mt-2 text-navy/70">{t.success.body}</p>}
      {booking && (
        <div className="mt-6 rounded-2xl border border-line p-4 text-left text-sm">
          <p>{t.success.code}: <b>{booking.code}</b></p>
          <p>{booking.tour_date} · {shortTime(booking.tour_time)} · {booking.travelers}</p>
          <p>{t.booking.total}: <b>{formatMoney(booking.total_cents, booking.currency, locale === 'en' ? 'en-US' : 'es-MX')}</b></p>
        </div>
      )}
      {paid && (
        <PurchaseEvent eventId={booking.utm?.event_id ?? booking.code} value={booking.total_cents / 100} currency={booking.currency} />
      )}
      <Link href={`/${locale}`} className="mt-8 inline-block text-brand underline">{t.success.back}</Link>
    </main>
  );
}
