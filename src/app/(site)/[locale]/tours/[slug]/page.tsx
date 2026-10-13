import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { getDict, isLocale } from '@/i18n';
import { getTourBySlug, minPriceCents } from '@/features/tours/queries';
import { TourGallery } from '@/features/tours/components/TourGallery';
import { QuickFacts } from '@/features/tours/components/QuickFacts';
import { TrustCard } from '@/features/tours/components/TrustCard';
import { TourVideo } from '@/features/tours/components/TourVideo';
import { DescriptionBlocks } from '@/features/tours/components/DescriptionBlocks';
import { BookingWidget } from '@/features/booking/components/BookingWidget';
import { BookNowButton } from '@/features/booking/components/BookNowButton';
import { MobileBookBar } from '@/features/booking/components/MobileBookBar';
import { TrackView } from '@/features/analytics/TrackView';
import { formatMoney } from '@/core/money';
import { publicEnv } from '@/lib/env';

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const tour = await getTourBySlug(slug, locale);
  if (!tour) return {};
  const index = publicEnv.indexable && tour.status === 'published';
  return {
    title: tour.title,
    description: tour.shortDescription ?? undefined,
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
    alternates: { languages: { es: `/es/tours/${slug}`, en: `/en/tours/${slug}` } },
    openGraph: { title: tour.title, description: tour.shortDescription ?? undefined, images: tour.images[0] ? [tour.images[0].url] : undefined },
  };
}

export default async function TourPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const tour = await getTourBySlug(slug, locale);
  if (!tour) notFound();
  const t = getDict(locale);

  const min = minPriceCents(tour);
  const fmt = (c: number) => formatMoney(c, tour.currency, locale === 'en' ? 'en-US' : 'es-MX');
  const priceLabel = min !== null ? `${t.tour.from} ${fmt(min)}` : null;

  return (
    <main className="pb-28 lg:pb-12">
      <div className="mx-auto max-w-6xl px-4">
        <Logo />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0 space-y-6">
            <TourGallery images={tour.images} title={tour.title} location={tour.location} />
            <QuickFacts tour={tour} t={t} />
            <TrustCard t={t} cancellationHours={tour.cancellationHours} />
            <BookNowButton label={t.tour.bookNow} className="lg:hidden" />

            {tour.shortDescription && (
              <p className="text-[17px] font-medium leading-relaxed">{tour.shortDescription}</p>
            )}
            {tour.videoYoutubeId && <TourVideo id={tour.videoYoutubeId} title={t.tour.videoTitle} />}
            <DescriptionBlocks blocks={tour.blocks} />
          </div>

          <aside className="lg:sticky lg:top-4 lg:self-start">
            <BookingWidget tour={tour} locale={locale} />
          </aside>
        </div>
      </div>
      <MobileBookBar label={t.tour.bookNow} priceLabel={priceLabel} />
      <TrackView name={tour.title} id={tour.slug} value={min} currency={tour.currency} />
    </main>
  );
}
