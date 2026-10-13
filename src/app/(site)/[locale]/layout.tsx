import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/config';
import { MetaPixel } from '@/features/analytics/MetaPixel';

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <>
      {children}
      <MetaPixel />
    </>
  );
}
