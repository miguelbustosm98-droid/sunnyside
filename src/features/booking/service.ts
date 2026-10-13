import 'server-only';
import { createServiceClient } from '@/lib/supabase/admin';
import { parseBookingError, type BookingErrorCode } from '@/core/errors';
import { shortTime } from '@/core/dates';
import type { Slot } from '@/core/slots';
import type { CheckoutBody } from './schemas';

export async function getAvailability(slug: string, from: string, to: string): Promise<Slot[] | null> {
  const db = createServiceClient();
  const { data: tour } = await db.from('tours').select('id').eq('slug', slug).eq('status', 'published').maybeSingle();
  if (!tour) return null;
  const { data, error } = await db.rpc('slot_availability', { p_tour_id: tour.id, p_from: from, p_to: to });
  if (error) throw new Error(error.message);
  return ((data ?? []) as any[]).map((r) => ({
    date: r.slot_date,
    time: shortTime(r.slot_time),
    scheduleId: r.schedule_id,
    capacity: r.capacity,
    booked: r.booked,
    remaining: r.remaining,
  }));
}

export interface PendingBooking {
  bookingId: string;
  code: string;
  totalCents: number;
  currency: string;
  travelers: number;
}

export type CreateResult =
  | { ok: true; booking: PendingBooking }
  | { ok: false; code: BookingErrorCode };

/** Crea la reserva pendiente (bloquea cupo). Los precios se calculan en la BD. */
export async function createPendingBooking(body: CheckoutBody, holdMinutes: number): Promise<CreateResult> {
  const db = createServiceClient();
  const { data, error } = await db.rpc('create_pending_booking', {
    p_tour_slug: body.slug,
    p_date: body.date,
    p_time: body.time,
    p_items: body.items.map((i) => ({ option_id: i.optionId, quantity: i.quantity })),
    p_name: body.customer.name,
    p_email: body.customer.email,
    p_phone: body.customer.phone,
    p_lodging: body.customer.lodging || null,
    p_comments: body.customer.comments || null,
    p_locale: body.locale,
    p_utm: { ...(body.attribution?.utm ?? {}), fbp: body.attribution?.fbp, fbc: body.attribution?.fbc, page_url: body.attribution?.pageUrl, event_id: body.attribution?.eventId },
    p_hold_minutes: holdMinutes,
  } as never);
  if (error) return { ok: false, code: parseBookingError(error.message) };
  const row = (data as any[])?.[0];
  if (!row) return { ok: false, code: 'unknown' };
  return {
    ok: true,
    booking: {
      bookingId: row.booking_id,
      code: row.booking_code,
      totalCents: row.total_cents,
      currency: row.currency,
      travelers: row.travelers,
    },
  };
}
