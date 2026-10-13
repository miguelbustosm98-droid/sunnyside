import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { publicEnv } from '@/lib/env';
import { locales } from '@/i18n/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = createClient(publicEnv.supabaseUrl, publicEnv.supabaseKey);
  const { data } = await db.from('tours').select('slug').eq('status', 'published');
  const urls: MetadataRoute.Sitemap = locales.map((l) => ({ url: `${publicEnv.siteUrl}/${l}` }));
  for (const t of data ?? []) for (const l of locales) urls.push({ url: `${publicEnv.siteUrl}/${l}/tours/${t.slug}` });
  return urls;
}
