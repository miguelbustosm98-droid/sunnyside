import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, Poppins } from 'next/font/google';
import { headers } from 'next/headers';
import { publicEnv } from '@/lib/env';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'], variable: '--font-poppins', display: 'swap' });
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-barlow', display: 'swap' });

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#ffffff' };

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: { default: 'Sunnyside · Tours en Ixtapa-Zihuatanejo', template: '%s · Sunnyside' },
  robots: publicEnv.indexable ? { index: true, follow: true } : { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = (await headers()).get('x-locale') ?? 'es';
  return (
    <html lang={lang} className={`${poppins.variable} ${barlow.variable}`}>
      <body>{children}</body>
    </html>
  );
}
