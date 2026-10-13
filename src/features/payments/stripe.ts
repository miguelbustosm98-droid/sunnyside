import 'server-only';
import Stripe from 'stripe';
import { serverEnv } from '@/lib/env.server';

let _stripe: Stripe | null = null;
export function stripe(): Stripe {
  if (!_stripe) _stripe = new Stripe(serverEnv.stripeSecretKey);
  return _stripe;
}
