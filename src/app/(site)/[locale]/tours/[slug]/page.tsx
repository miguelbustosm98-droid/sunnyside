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
import { formatMoney } from '@/core/money';
import { getTourMarketing } from '@/features/tours/marketing';
import { IncludedSection } from '@/features/tours/components/IncludedSection';
import { SectionCta } from '@/features/tours/components/SectionCta';
import { FaqSection } from '@/features/tours/components/FaqSection';
import { ClosingSection } from '@/features/tours/components/ClosingSection';

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const tour = await getTourBySlug(slug, locale);
  if (!tour) return {};
  const title = getTourMarketing(slug, locale)?.headline ?? tour.title;
  const index = publicEnv.indexable && tour.status === 'published';
  return {
    title,
    description: tour.shortDescription ?? undefined,
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
    alternates: { languages: { es: `/es/tours/${slug}`, en: `/en/tours/${slug}` } },
    openGraph: { title, description: tour.shortDescription ?? undefined, images: tour.images[0] ? [tour.images[0].url] : undefined },
  };
}

export default async function TourPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const tour = await getTourBySlug(slug, locale);
  if (!tour) notFound();
  const t = getDict(locale);

  const min = minPriceCents(tour);
  const mk = getTourMarketing(tour.slug, locale);
  // El CTA muestra la opción más barata que se puede reservar (no el precio por persona).
  const cheapest = tour.options.length ? Math.min(...tour.options.map((o) => o.priceCents)) : null;
  const price = cheapest === null ? null : formatMoney(cheapest, tour.currency, locale === 'en' ? 'en-US' : 'es-MX');
  const ctas = price ? t.tour.ctas(price) : [t.tour.bookNow];
  const ctaFinal = price ? t.tour.ctaFinal(price) : t.tour.bookNow;
  const note = t.tour.ctaNote(tour.cancellationHours);

  return (
    <main className="pb-32 lg:pb-12">
      <div className="mx-auto max-w-6xl px-4">
        <Logo />
        <header className="mb-5 max-w-3xl">
          {mk && <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand">{mk.eyebrow}</p>}
          <h1 className="font-display text-[34px] font-extrabold uppercase leading-[0.95] tracking-tight sm:text-5xl">
            {mk?.headline ?? tour.title}
          </h1>
          {mk?.subheadline && <p className="mt-3 text-[17px] font-medium leading-snug text-navy/75">{mk.subheadline}</p>}
        </header>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0 space-y-4">
            <TourGallery images={tour.images} title={tour.title} />
            <QuickFacts tour={tour} t={t} />
            <TrustCard t={t} cancellationHours={tour.cancellationHours} meetingPoint={tour.meetingPoint} />

            <SectionCta label={ctas[0]} note={note} />
            {tour.shortDescription && (
              <p className="pt-2 text-[19px] font-semibold leading-relaxed">{tour.shortDescription}</p>
            )}
            {tour.videoYoutubeId && <TourVideo id={tour.videoYoutubeId} title={t.tour.videoTitle} />}
            <DescriptionBlocks blocks={tour.blocks} ctaLabels={ctas.length > 1 ? ctas.slice(1) : ctas} ctaNote={note} />
            {mk && (
              <>
                <IncludedSection included={mk.included} notIncluded={mk.notIncluded} t={t} />
                {mk.faq && <FaqSection title={t.tour.faqTitle} items={mk.faq} />}
                {mk.closing && <ClosingSection title={mk.closing.title} text={mk.closing.text} />}
              </>
            )}
            <SectionCta label={ctaFinal} note={note} />
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
