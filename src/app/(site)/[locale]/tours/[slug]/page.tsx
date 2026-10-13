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
import { MobileBookBar } from '@/features/booking/components/MobileBookBar';
import { TrackView } from '@/features/analytics/TrackView';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
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

  return (
    <main className="pb-32 lg:pb-12">
      <div className="mx-auto max-w-6xl px-4">
        <Logo />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0 space-y-4">
            <TourGallery images={tour.images} title={tour.title} />
            <QuickFacts tour={tour} t={t} />
            <TrustCard t={t} cancellationHours={tour.cancellationHours} meetingPoint={tour.meetingPoint} />

            <header className="pt-4">
              <h1 className="font-serif text-4xl leading-tight">{tour.title}</h1>
              {tour.subtitle && <p className="mt-2 text-lg font-semibold text-navy/70">{tour.subtitle}</p>}
              {tour.location && <p className="mt-2 text-sm text-navy/60">📍 {tour.location}</p>}
            </header>
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
      <MobileBookBar label={t.tour.bookNow} />
      <WhatsAppButton label={t.tour.needHelp} text={t.tour.whatsappText(tour.title)} />
      <TrackView name={tour.title} id={tour.slug} value={min} currency={tour.currency} />
    </main>
  );
}
