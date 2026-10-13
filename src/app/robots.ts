import type { MetadataRoute } from 'next';
import { publicEnv } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  return publicEnv.indexable
    ? { rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }, sitemap: `${publicEnv.siteUrl}/sitemap.xml` }
    : { rules: { userAgent: '*', disallow: '/' } };
}
