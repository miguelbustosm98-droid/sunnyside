import 'server-only';
import { serverEnv } from '@/lib/env.server';
import { formatMoney } from '@/core/money';

export interface ConfirmationData {
  to: string;
  locale: 'es' | 'en';
  code: string;
  tourTitle: string;
  date: string;
  time: string;
  travelers: number;
  totalCents: number;
  currency: string;
}

async function send(to: string, subject: string, html: string) {
  const { resendApiKey, resendFrom } = serverEnv;
  if (!resendApiKey || !resendFrom) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${resendApiKey}` },
      body: JSON.stringify({ from: resendFrom, to, subject, html }),
    });
  } catch (e) {
    console.error('Email error', e);
  }
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export async function sendConfirmation(d: ConfirmationData) {
  const en = d.locale === 'en';
  const money = formatMoney(d.totalCents, d.currency, en ? 'en-US' : 'es-MX');
  const html = `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;color:#0b1630">
    <h2>${en ? 'Booking confirmed' : 'Reserva confirmada'}</h2>
    <p><b>${esc(d.tourTitle)}</b></p>
    <p>${esc(d.date)} · ${esc(d.time)} · ${d.travelers} ${en ? 'traveler(s)' : 'viajero(s)'}</p>
    <p>${en ? 'Total paid' : 'Total pagado'}: <b>${money}</b></p>
    <p>${en ? 'Booking code' : 'Código de reserva'}: <b>${esc(d.code)}</b></p></div>`;
  await send(d.to, en ? `Booking confirmed · ${d.code}` : `Reserva confirmada · ${d.code}`, html);

  if (serverEnv.adminNotifyEmail) {
    await send(serverEnv.adminNotifyEmail, `Nueva reserva pagada · ${d.code}`,
      `<p>${esc(d.tourTitle)} — ${esc(d.date)} ${esc(d.time)} — ${d.travelers} pax — ${money}</p><p>${esc(d.to)}</p>`);
  }
}
