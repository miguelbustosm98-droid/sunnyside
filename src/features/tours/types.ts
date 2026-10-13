import type { DescriptionBlock } from '@/core/blocks';

export interface TourOption {
  id: string;
  priceCents: number;
  travelers: number; // viajeros que cubre cada unidad
  maxQuantity: number;
  name: string;
  description: string | null;
}

export interface TourImage {
  id: string;
  url: string;
  alt: string | null;
}

export interface Tour {
  id: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  durationMinutes: number;
  minTravelers: number;
  maxTravelersPerBooking: number;
  currency: string;
  videoYoutubeId: string | null;
  cancellationHours: number;
  title: string;
  subtitle: string | null;
  location: string | null;
  meetingPoint: string | null;
  shortDescription: string | null;
  blocks: DescriptionBlock[];
  images: TourImage[];
  options: TourOption[];
}
