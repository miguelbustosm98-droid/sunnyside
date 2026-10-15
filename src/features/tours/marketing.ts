import type { Locale } from '@/i18n';

/**
 * Textos de venta por tour que todavía no viven en la BD (muestra de diseño).
 * Si un tour no aparece aquí, la página usa su título y omite "Incluye / No incluye".
 */
export interface TourMarketing {
  eyebrow: string;
  headline: string;
  included: string[];
  notIncluded: string[];
}

const content: Record<string, Record<Locale, TourMarketing>> = {
  'atv-ixtapa': {
    es: {
      eyebrow: 'Tour en cuatrimoto · 3 horas con guía',
      headline: 'Vive Ixtapa Zihuatanejo en cuatrimoto: de la selva a la playa',
      included: [
        'Cuatrimoto o RZR automático, según la opción que elijas',
        'Guía durante todo el recorrido',
        'Casco y equipo de seguridad',
        'Recorrido por la orilla del mar',
        'Paradas para tomar fotos',
      ],
      notIncluded: [
        'Alimentos y bebidas en la parada del restaurante',
        'Propinas para tu guía',
      ],
    },
    en: {
      eyebrow: 'ATV tour · 3 hours with a guide',
      headline: 'Ride from the jungle to the beach in Ixtapa Zihuatanejo',
      included: [
        'Automatic ATV or RZR, depending on the option you choose',
        'A guide the whole way',
        'Helmet and safety gear',
        'Ride along the shoreline',
        'Photo stops',
      ],
      notIncluded: [
        'Food and drinks at the restaurant stop',
        'Tips for your guide',
      ],
    },
  },
  'paseo-a-caballo': {
    es: {
      eyebrow: 'Paseo a caballo · 1.5 horas con guía',
      headline: 'Cabalga entre palmeras hasta la playa en Ixtapa Zihuatanejo',
      included: [
        'Caballo dócil elegido según tu nivel',
        'Guías durante todo el recorrido',
        'Senderos entre palmeras y paseo junto al mar',
      ],
      notIncluded: [
        'Alimentos y bebidas',
        'Propinas para tus guías',
      ],
    },
    en: {
      eyebrow: 'Horseback ride · 1.5 hours with guides',
      headline: 'Ride through palm groves to the beach in Ixtapa Zihuatanejo',
      included: [
        'A gentle horse matched to your level',
        'Guides the whole way',
        'Palm-grove trails and a ride by the sea',
      ],
      notIncluded: [
        'Food and drinks',
        'Tips for your guides',
      ],
    },
  },
};

export function getTourMarketing(slug: string, locale: Locale): TourMarketing | null {
  return content[slug]?.[locale] ?? null;
}
