import 'server-only';
import { createHash } from 'node:crypto';
import { publicEnv } from '@/lib/env';
import { serverEnv } from '@/lib/env.server';

const sha = (v: string) => createHash('sha256').update(v.trim().toLowerCase()).digest('hex');

interface PurchaseArgs {
  eventId: string;
  email: string;
  phone?: string;
  valueCents: number;
  currency: string;
  fbp?: string;
  fbc?: string;
  pageUrl?: string;
  contentName: string;
}

/** Meta Conversions API (opcional). Falla en silencio: nunca debe romper un pago. */
export async function sendPurchase(a: PurchaseArgs): Promise<void> {
  const pixel = publicEnv.metaPixelId;
  const token = serverEnv.metaCapiToken;
  if (!pixel || !token) return;
  try {
    await fetch(`https://graph.facebook.com/v21.0/${pixel}/events?access_token=${token}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        data: [
          {
            event_name: 'Purchase',
            event_time: Math.floor(Date.now() / 1000),
            event_id: a.eventId,
            action_source: 'website',
            event_source_url: a.pageUrl,
            user_data: {
              em: [sha(a.email)],
              ...(a.phone ? { ph: [sha(a.phone.replace(/\D/g, ''))] } : {}),
              ...(a.fbp ? { fbp: a.fbp } : {}),
              ...(a.fbc ? { fbc: a.fbc } : {}),
            },
            custom_data: { value: a.valueCents / 100, currency: a.currency, content_name: a.contentName },
          },
        ],
      }),
    });
  } catch (e) {
    console.error('CAPI error', e);
  }
}
