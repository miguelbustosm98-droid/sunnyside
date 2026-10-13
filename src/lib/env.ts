/** Variables públicas (disponibles en cliente y servidor). */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '',
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  indexable: process.env.NEXT_PUBLIC_INDEXABLE === 'true',
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '',
};
