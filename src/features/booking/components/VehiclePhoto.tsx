import type { Dict } from '@/i18n';

export type VehicleKind = 'atv1' | 'atv2' | 'utv2' | 'utv4';

/** Deduce el vehículo a partir del nombre de la opción y cuántos viajeros cubre. */
export function vehicleKind(name: string, travelers: number): VehicleKind | null {
  if (/rzr|utv|buggy|can-?am|maverick/i.test(name)) return travelers >= 3 ? 'utv4' : 'utv2';
  if (/atv|cuatri|quad/i.test(name)) return travelers >= 2 ? 'atv2' : 'atv1';
  return null;
}

export function vehicleLabel(kind: VehicleKind, t: Dict) {
  return t.booking.vehicles[kind];
}

const photos: Record<VehicleKind, string> = {
  atv1: '/vehicles/atv.png',
  atv2: '/vehicles/atv.png',
  utv2: '/vehicles/rzr-2.png',
  utv4: '/vehicles/rzr-4.png',
};

/** Foto real del vehículo sin fondo (Can-Am Outlander y Maverick X3 / MAX). */
export function VehiclePhoto({ kind, className = '' }: { kind: VehicleKind; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- PNG local diminuto, no vale la pena next/image
  return <img src={photos[kind]} alt="" aria-hidden className={`object-contain ${className}`} />;
}
