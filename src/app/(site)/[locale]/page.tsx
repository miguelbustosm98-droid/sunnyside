import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { getDict, isLocale } from '@/i18n';
import { getPublishedTours, minPriceCents } from '@/features/tours/queries';
import { formatMoney } from '@/core/money';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  const tours = await getPublishedTours(locale);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16">
      <Logo />
      <h1 className="mt-4 text-3xl font-extrabold">{t.home.title}</h1>
      <p className="mt-1 text-navy/70">{t.home.subtitle}</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {tours.map((tour) => {
          const min = minPriceCents(tour);
          return (
            <Link key={tour.id} href={`/${locale}/tours/${tour.slug}`} className="group overflow-hidden rounded-2xl border border-line shadow-sm transition hover:shadow-lg">
              <div className="relative aspect-[4/3] bg-soft">
                {tour.images[0] && <Image src={tour.images[0].url} alt={tour.title} fill sizes="(min-width:640px) 50vw, 100vw" className="object-cover transition group-hover:scale-105" />}
              </div>
              <div className="p-4">
                <h2 className="text-lg font-bold">{tour.title}</h2>
                {tour.location && <p className="text-sm text-navy/60">📍 {tour.location}</p>}
                {min !== null && <p className="mt-2 text-sm">{t.tour.from} <b>{formatMoney(min, tour.currency, locale === 'en' ? 'en-US' : 'es-MX')}</b> {t.tour.perPerson}</p>}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
