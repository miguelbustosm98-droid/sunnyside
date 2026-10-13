import { NextResponse } from 'next/server';
import { stripe } from '@/features/payments/stripe';
import { handleStripeEvent } from '@/features/payments/webhook';
import { serverEnv } from '@/lib/env.server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'no_signature' }, { status: 400 });
  const raw = await req.text();

  let event;
  try {
    event = stripe().webhooks.constructEvent(raw, signature, serverEnv.stripeWebhookSecret);
  } catch {
    return NextResponse.json({ error: 'bad_signature' }, { status: 400 });
  }

  try {
    await handleStripeEvent(event);
  } catch (e) {
    console.error('webhook error', e);
    return NextResponse.json({ error: 'handler_failed' }, { status: 500 }); // Stripe reintenta
  }
  return NextResponse.json({ received: true });
}
