import { NextResponse } from 'next/server';
import { checkoutBody } from '@/features/booking/schemas';
import { createPendingBooking } from '@/features/booking/service';
import { createCheckoutSession, HOLD_MINUTES } from '@/features/payments/checkout';
import { BOOKING_ERROR_STATUS } from '@/core/errors';
import { createServiceClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = checkoutBody.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'validation' }, { status: 400 });
  const body = parsed.data;

  const created = await createPendingBooking(body, HOLD_MINUTES);
  if (!created.ok) {
    return NextResponse.json({ error: created.code }, { status: BOOKING_ERROR_STATUS[created.code] });
  }

  const db = createServiceClient();
  try {
    const { data: tr } = await db
      .from('tour_translations')
      .select('title, tours!inner(slug)')
      .eq('tours.slug', body.slug)
      .eq('locale', body.locale)
      .maybeSingle();

    const session = await createCheckoutSession({
      booking: created.booking,
      tourTitle: tr?.title ?? body.slug,
      date: body.date,
      time: body.time,
      email: body.customer.email,
      locale: body.locale,
    });
    await db.from('bookings').update({ stripe_session_id: session.id }).eq('id', created.booking.bookingId);
    return NextResponse.json({ url: session.url, code: created.booking.code, value: created.booking.totalCents });
  } catch (e) {
    console.error('checkout error', e);
    // Libera el cupo si no se pudo crear la sesión de pago.
    await db.from('bookings').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', created.booking.bookingId);
    return NextResponse.json({ error: 'unknown' }, { status: 500 });
  }
}
