'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { isoDate, todayInMexico, time12h } from '@/core/dates';
import { formatMoney } from '@/core/money';
import { computeTotals } from '@/core/pricing';
import { availableDates, groupSlotsByDate, type Slot } from '@/core/slots';
import { getDict, type Dict, type Locale } from '@/i18n';
import type { Tour } from '@/features/tours/types';
import { getAttribution } from '@/features/analytics/attribution';
import { newEventId, track } from '@/features/analytics/track';
import { Calendar } from './Calendar';
import { OPEN_BOOKING_EVENT } from './BookNowButton';
import { VehiclePhoto, vehicleKind, vehicleLabel } from './VehiclePhoto';
import { StripeBadge } from '@/components/ui/StripeBadge';

interface Props {
  tour: Tour;
  locale: Locale;
}

const inputCls = 'w-full rounded-xl border border-line px-3 py-2.5 text-[15px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20';

export function BookingWidget({ tour, locale }: Props) {
  // El diccionario tiene funciones: no puede venir como prop desde el servidor.
  const t = getDict(locale);
  const today = todayInMexico();
  const [ty, tm] = today.split('-').map(Number);
  const [view, setView] = useState({ y: ty, m: tm - 1 });
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [qty, setQty] = useState<Record<string, number>>(() =>
    tour.options[0] ? { [tour.options[0].id]: 1 } : {},
  );
  const [form, setForm] = useState({ name: '', email: '', phone: '', lodging: '', comments: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false); // solo móvil (bottom sheet)

  const options = tour.options;
  const totals = useMemo(
    () => computeTotals(options.map((o) => ({ id: o.id, priceCents: o.priceCents, travelersPerUnit: o.travelers, maxQuantity: o.maxQuantity })),
      Object.entries(qty).map(([optionId, quantity]) => ({ optionId, quantity }))),
    [options, qty],
  );

  // Abrir hoja móvil desde cualquier CTA de la página.
  useEffect(() => {
    const h = () => {
      setOpen(true);
      if (window.matchMedia('(min-width: 1024px)').matches) {
        document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    window.addEventListener(OPEN_BOOKING_EVENT, h);
    return () => window.removeEventListener(OPEN_BOOKING_EVENT, h);
  }, []);

  // Cargar disponibilidad del mes visible.
  useEffect(() => {
    const from = isoDate(new Date(view.y, view.m, 1));
    const last = isoDate(new Date(view.y, view.m + 1, 0));
    const start = from < today ? today : from;
    if (last < today) { setSlots([]); return; }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/availability?slug=${encodeURIComponent(tour.slug)}&from=${start}&to=${last}`)
      .then((r) => (r.ok ? r.json() : { slots: [] }))
      .then((d) => { if (!cancelled) setSlots(d.slots ?? []); })
      .catch(() => { if (!cancelled) setSlots([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [view, tour.slug, today]);

  const needed = Math.max(totals.travelers, 1);
  const okDates = useMemo(() => availableDates(slots, needed), [slots, needed]);
  const byDate = useMemo(() => groupSlotsByDate(slots), [slots]);
  const daySlots = date ? (byDate.get(date) ?? []).filter((s) => s.remaining >= needed) : [];

  // Si cambia la selección y la fecha/hora deja de ser válida, limpiar.
  useEffect(() => {
    if (date && !okDates.has(date)) { setDate(null); setTime(null); }
    else if (time && !daySlots.some((s) => s.time === time)) setTime(null);
  }, [okDates, date, time, daySlots]);

  const changeMonth = useCallback((delta: number) => {
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }, []);
  const canGoPrev = view.y > ty || (view.y === ty && view.m > tm - 1);

  const setOptionQty = (id: string, q: number, max: number) =>
    setQty((cur) => {
      const next = { ...cur };
      const v = Math.max(0, Math.min(max, q));
      if (v === 0) delete next[id]; else next[id] = v;
      return next;
    });

  const ready =
    !!date && !!time && totals.travelers >= tour.minTravelers && totals.travelers <= tour.maxTravelersPerBooking &&
    form.name.trim().length > 1 && /.+@.+\..+/.test(form.email) && form.phone.trim().length >= 7;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || submitting || !date || !time) return;
    setSubmitting(true);
    setError(null);
    const attribution = { ...getAttribution(), eventId: newEventId() };
    track('InitiateCheckout', { value: totals.totalCents / 100, currency: tour.currency, content_name: tour.title, num_items: totals.travelers });
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          slug: tour.slug, date, time,
          items: Object.entries(qty).map(([optionId, quantity]) => ({ optionId, quantity })),
          customer: form, locale, attribution,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) { window.location.href = data.url; return; }
      const key = (data.error as keyof Dict['booking']['errors']) ?? 'unknown';
      setError(t.booking.errors[key] ?? t.booking.errors.unknown);
    } catch {
      setError(t.booking.errors.unknown);
    }
    setSubmitting(false);
  }

  const priceLabel = formatMoney(totals.totalCents, tour.currency, locale === 'en' ? 'en-US' : 'es-MX');

  return (
    <>
      {/* Fondo oscuro de la hoja móvil */}
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}

      <div
        id="reservar"
        className={`fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl transition-transform duration-300
          lg:static lg:z-auto lg:max-h-none lg:translate-y-0 lg:rounded-2xl lg:border lg:border-line lg:shadow-xl
          ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">{t.booking.title}</h2>
          <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-line px-3 py-1 text-sm lg:hidden">
            {t.booking.close}
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5">
          {/* Opciones */}
          <section>
            <p className="mb-2 text-sm font-bold">{t.booking.options}</p>
            <div className="space-y-2">
              {options.map((o) => {
                const q = qty[o.id] ?? 0;
                const kind = vehicleKind(o.name, o.travelers);
                const label = kind ? vehicleLabel(kind, t) : null;
                return (
                  <div key={o.id} className={`flex items-center justify-between gap-2 rounded-xl border p-2.5 ${q ? 'border-brand bg-brand/5' : 'border-line'}`}>
                    <div className="flex min-w-0 items-center gap-2.5">
                      {kind && (
                        <div className={`flex h-14 w-20 shrink-0 items-center justify-center rounded-lg ${q ? 'bg-white' : 'bg-soft'}`}>
                          <VehiclePhoto kind={kind} className="h-12 w-[72px]" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight">{label?.name ?? o.name}</p>
                        {(label?.sub ?? o.description) && <p className="mt-0.5 text-xs leading-snug text-navy/60">{label?.sub ?? o.description}</p>}
                        <p className="mt-0.5 text-sm font-bold text-navy">{formatMoney(o.priceCents, tour.currency, locale === 'en' ? 'en-US' : 'es-MX')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" aria-label="−" onClick={() => setOptionQty(o.id, q - 1, o.maxQuantity)} className="h-8 w-8 rounded-full border border-line text-lg leading-none">−</button>
                      <span className="w-5 text-center font-bold">{q}</span>
                      <button type="button" aria-label="+" onClick={() => setOptionQty(o.id, q + 1, o.maxQuantity)} className="h-8 w-8 rounded-full border border-line text-lg leading-none">+</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-1 text-xs text-navy/60">{t.booking.travelers}: {totals.travelers}</p>
          </section>

          {/* Fecha */}
          <section>
            <p className="mb-2 text-sm font-bold">{t.booking.date}</p>
            <Calendar
              year={view.y} month={view.m} available={okDates} selected={date}
              onSelect={(d) => { setDate(d); setTime(null); }}
              onMonthChange={changeMonth} canGoPrev={canGoPrev} t={t}
            />
            {loading && <p className="mt-2 text-xs text-navy/60">{t.booking.loading}</p>}
            {!loading && okDates.size === 0 && <p className="mt-2 text-xs text-navy/60">{t.booking.noSlots}</p>}
          </section>

          {/* Hora */}
          {date && (
            <section>
              <p className="mb-2 text-sm font-bold">{t.booking.time}</p>
              {daySlots.length === 0 ? (
                <p className="text-sm text-navy/60">{t.booking.noSlots}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((s) => (
                    <button key={s.scheduleId + s.time} type="button" onClick={() => setTime(s.time)}
                      className={`rounded-xl border px-4 py-2 text-sm font-semibold ${time === s.time ? 'border-brand bg-brand text-white' : 'border-line'}`}>
                      {time12h(s.time)}
                      {s.remaining <= 5 && <span className="ml-1 text-xs opacity-80">· {t.booking.spotsLeft(s.remaining)}</span>}
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Datos */}
          <section className="space-y-2.5">
            <p className="text-sm font-bold">{t.booking.details}</p>
            <input className={inputCls} placeholder={t.booking.name} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className={inputCls} type="email" placeholder={t.booking.email} autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input className={inputCls} type="tel" placeholder={t.booking.phone} autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <input className={inputCls} placeholder={t.booking.lodging} value={form.lodging} onChange={(e) => setForm({ ...form, lodging: e.target.value })} />
            <textarea className={inputCls} rows={2} placeholder={t.booking.comments} value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
          </section>

          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}

          <div className="flex items-center justify-between border-t border-line pt-4">
            <span className="text-sm text-navy/70">{t.booking.total}</span>
            <span className="text-2xl font-extrabold">{priceLabel}</span>
          </div>
          <button type="submit" disabled={!ready || submitting}
            className="w-full rounded-xl bg-brand px-5 py-3.5 text-base font-extrabold text-white shadow-lg shadow-brand/25 transition enabled:hover:bg-brand-dark disabled:opacity-50">
            {submitting ? t.booking.paying : t.booking.pay}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-navy/60">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
            {t.booking.securedBy} <StripeBadge />
          </p>
        </form>
      </div>
    </>
  );
}

