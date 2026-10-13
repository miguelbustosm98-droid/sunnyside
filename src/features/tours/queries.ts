import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { parseBlocks } from '@/core/blocks';
import type { Locale } from '@/i18n/config';
import type { Tour } from './types';

const SELECT = `
  id, slug, status, duration_minutes, min_travelers, max_travelers_per_booking,
  currency, video_youtube_id, cancellation_hours, sort_order,
  tour_translations ( locale, title, subtitle, location, meeting_point, short_description, description_blocks ),
  tour_images ( id, url, alt, sort_order ),
  tour_options ( id, price_cents, travelers, max_quantity, sort_order, active,
    tour_option_translations ( locale, name, description ) )
`;

/* eslint-disable @typescript-eslint/no-explicit-any */
function pickTr<T extends { locale: string }>(list: T[] | null | undefined, locale: Locale): T | undefined {
  return list?.find((t) => t.locale === locale) ?? list?.find((t) => t.locale === 'es') ?? list?.[0];
}

export function mapTour(row: any, locale: Locale): Tour {
  const tr = pickTr<any>(row.tour_translations, locale);
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    durationMinutes: row.duration_minutes,
    minTravelers: row.min_travelers,
    maxTravelersPerBooking: row.max_travelers_per_booking,
    currency: row.currency,
    videoYoutubeId: row.video_youtube_id,
    cancellationHours: row.cancellation_hours,
    title: tr?.title ?? row.slug,
    subtitle: tr?.subtitle ?? null,
    location: tr?.location ?? null,
    meetingPoint: tr?.meeting_point ?? null,
    shortDescription: tr?.short_description ?? null,
    blocks: parseBlocks(tr?.description_blocks),
    images: [...(row.tour_images ?? [])]
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((i: any) => ({ id: i.id, url: i.url, alt: i.alt })),
    options: [...(row.tour_options ?? [])]
      .filter((o: any) => o.active)
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((o: any) => {
        const otr = pickTr<any>(o.tour_option_translations, locale);
        return {
          id: o.id,
          priceCents: o.price_cents,
          travelers: o.travelers,
          maxQuantity: o.max_quantity,
          name: otr?.name ?? '',
          description: otr?.description ?? null,
        };
      }),
  };
}

export async function getPublishedTours(locale: Locale): Promise<Tour[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tours')
    .select(SELECT)
    .eq('status', 'published')
    .order('sort_order');
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => mapTour(r, locale));
}

/** RLS: el público solo ve publicados; un admin con sesión puede previsualizar borradores. */
export async function getTourBySlug(slug: string, locale: Locale): Promise<Tour | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('tours').select(SELECT).eq('slug', slug).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapTour(data, locale) : null;
}

export function minPriceCents(tour: Tour): number | null {
  const per = tour.options.map((o) => Math.round(o.priceCents / Math.max(o.travelers, 1)));
  return per.length ? Math.min(...per) : null;
}
