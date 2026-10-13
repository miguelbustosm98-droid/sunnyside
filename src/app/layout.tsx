import './globals.css';
import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { publicEnv } from '@/lib/env';

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#1d5fd1' };

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: { default: 'Sunnyside · Tours en Ixtapa-Zihuatanejo', template: '%s · Sunnyside' },
  robots: publicEnv.indexable ? { index: true, follow: true } : { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = (await headers()).get('x-locale') ?? 'es';
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
