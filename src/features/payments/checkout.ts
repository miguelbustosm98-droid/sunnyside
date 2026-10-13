import 'server-only';
import { stripe } from './stripe';
import { publicEnv } from '@/lib/env';
import type { PendingBooking } from '../booking/service';

interface Args {
  booking: PendingBooking;
  tourTitle: string;
  date: string;
  time: string;
  email: string;
  locale: 'es' | 'en';
}

/** Stripe exige que la sesión dure >= 30 min. */
export const STRIPE_SESSION_MINUTES = 30;
/** La reserva retiene cupo un poco más que la sesión de Stripe. */
export const HOLD_MINUTES = 32;

export async function createCheckoutSession({ booking, tourTitle, date, time, email, locale }: Args) {
  const base = publicEnv.siteUrl;
  return stripe().checkout.sessions.create({
    mode: 'payment',
    customer_email: email,
    locale,
    client_reference_id: booking.bookingId,
    metadata: { booking_id: booking.bookingId, booking_code: booking.code },
    payment_intent_data: { metadata: { booking_id: booking.bookingId, booking_code: booking.code } },
    expires_at: Math.floor(Date.now() / 1000) + STRIPE_SESSION_MINUTES * 60,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: booking.currency.toLowerCase(),
          unit_amount: booking.totalCents,
          product_data: {
            name: tourTitle,
            description: `${date} · ${time} · ${booking.travelers} ${locale === 'en' ? 'traveler(s)' : 'viajero(s)'}`,
          },
        },
      },
    ],
    success_url: `${base}/${locale}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/${locale}`,
  });
}
