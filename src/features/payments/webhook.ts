import 'server-only';
import type Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase/admin';
import { shortTime } from '@/core/dates';
import { sendConfirmation } from './email';
import { sendPurchase } from '../analytics/capi';

/** Procesa eventos de Stripe. Es idempotente: reintentos no duplican correos ni eventos. */
export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  const db = createServiceClient();

  if (event.type === 'checkout.session.expired') {
    const s = event.data.object as Stripe.Checkout.Session;
    const id = s.metadata?.booking_id;
    if (id) await db.from('bookings').update({ status: 'expired' }).eq('id', id).eq('status', 'pending');
    return;
  }

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const s = event.data.object as Stripe.Checkout.Session;
    if (s.payment_status !== 'paid') return;
    const id = s.metadata?.booking_id;
    if (!id) return;

    const { data: updated, error } = await db
      .from('bookings')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        stripe_session_id: s.id,
        stripe_payment_intent_id: typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id ?? null,
      })
      .eq('id', id)
      .in('status', ['pending', 'expired'])
      .select('*')
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!updated) return; // ya procesada

    const { data: tr } = await db
      .from('tour_translations')
      .select('title')
      .eq('tour_id', updated.tour_id)
      .eq('locale', updated.locale)
      .maybeSingle();
    const tourTitle = tr?.title ?? 'Tour';
    const time = shortTime(updated.tour_time);

    await Promise.all([
      sendConfirmation({
        to: updated.customer_email,
        locale: updated.locale === 'en' ? 'en' : 'es',
        code: updated.code,
        tourTitle,
        date: updated.tour_date,
        time,
        travelers: updated.travelers,
        totalCents: updated.total_cents,
        currency: updated.currency,
      }),
      sendPurchase({
        eventId: (updated.utm as any)?.event_id ?? updated.code,
        email: updated.customer_email,
        phone: updated.customer_phone,
        valueCents: updated.total_cents,
        currency: updated.currency,
        fbp: (updated.utm as any)?.fbp,
        fbc: (updated.utm as any)?.fbc,
        pageUrl: (updated.utm as any)?.page_url,
        contentName: tourTitle,
      }),
    ]);
  }
}
