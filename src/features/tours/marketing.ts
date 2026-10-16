import type { Locale } from '@/i18n';

/**
 * Textos de venta por tour que todavía no viven en la BD.
 * La descripción larga sigue en la BD (editable desde el admin); aquí va lo que la rodea.
 * Si un tour no aparece aquí, la página usa su título y omite las secciones opcionales.
 */
export interface TourMarketing {
  eyebrow: string;
  headline: string;
  /** Subtítulo bajo el H1: respalda la promesa con hechos concretos. */
  subheadline?: string;
  /** Clip POV para la primera diapositiva del carrusel (archivos en /public/videos). */
  video?: { src: string; poster: string };
  included: string[];
  notIncluded: string[];
  faq?: { q: string; a: string }[];
  /** Cierre emocional antes del último botón. */
  closing?: { title: string; text: string };
}

const content: Record<string, Record<Locale, TourMarketing>> = {
  'atv-ixtapa': {
    es: {
      eyebrow: 'Ixtapa Zihuatanejo · Tour guiado en cuatrimoto',
      headline: 'Conoce Ixtapa Zihuatanejo en cuatrimoto y vive la aventura que soñaste para tus vacaciones',
      video: { src: '/videos/atv-pov.mp4', poster: '/videos/atv-pov.jpg' },
      subheadline:
        'Tú vas al volante. Cuatrimotos automáticas y fáciles de manejar, guía contigo todo el camino y equipo de seguridad incluido.',
      included: [
        'Cuatrimoto o RZR automático, según la opción que elijas',
        'Guía contigo durante las 3 horas',
        'Todo el equipo de seguridad, casco incluido',
        'Ruta por selva, terracería y la orilla del mar',
        'Paradas para fotos en los mejores puntos',
      ],
      notIncluded: [
        'Lo que consumas en la parada del restaurante',
        'Propinas para tu guía',
      ],
      faq: [
        {
          q: '¿Necesito experiencia para manejar?',
          a: 'No. Las cuatrimotos son automáticas: aceleras, frenas y listo. Tu guía va contigo todo el recorrido y marca el ritmo.',
        },
        {
          q: '¿Qué opción me conviene?',
          a: 'Si quieres manejar tú solo, la cuatrimoto individual. Si van en pareja y solo uno quiere manejar, la cuatrimoto para 2. Si son un grupo y quieren ir juntos, el RZR para 2 o para 4.',
        },
        {
          q: '¿Qué incluye el precio?',
          a: 'Tu vehículo, el guía durante las 3 horas y todo el equipo de seguridad. Solo pagas aparte lo que consumas en el restaurante.',
        },
        {
          q: '¿Y si tengo que cancelar?',
          a: 'Cancela sin costo hasta 48 horas antes de tu tour.',
        },
        {
          q: '¿A qué hora salen y dónde nos vemos?',
          a: 'Hay dos salidas diarias, a las 9:00 y a las 14:00. El punto de encuentro es el lobby del hotel; al confirmar tu reserva te mandamos todos los detalles a tu correo.',
        },
        {
          q: '¿Qué me llevo?',
          a: 'Ropa cómoda que no te importe ensuciar, zapato cerrado, lentes de sol, bloqueador y algo de efectivo para el restaurante.',
        },
        {
          q: '¿Es seguro pagar en línea?',
          a: 'Sí. El pago lo procesa Stripe, una de las plataformas de pago más usadas del mundo. Nosotros nunca vemos los datos de tu tarjeta.',
        },
      ],
      closing: {
        title: 'Dentro de unos años no vas a recordar la alberca del hotel',
        text: 'Vas a recordar el lodo en la cara, el rugido del motor y el momento en que la selva se abre y aparece el mar. Esa historia empieza eligiendo tu fecha.',
      },
    },
    en: {
      eyebrow: 'Ixtapa Zihuatanejo · Guided ATV tour',
      headline: 'Discover Ixtapa Zihuatanejo on an ATV and live the adventure you dreamed of for your vacation',
      video: { src: '/videos/atv-pov.mp4', poster: '/videos/atv-pov.jpg' },
      subheadline:
        "You're in the driver's seat. Automatic, easy-to-drive ATVs, a guide by your side the whole way and all safety gear included.",
      included: [
        'Automatic ATV or RZR, depending on the option you choose',
        'A guide with you for all 3 hours',
        'All safety gear, helmet included',
        'Route through jungle, dirt trails and along the shoreline',
        'Photo stops at the best spots',
      ],
      notIncluded: [
        'Whatever you order at the restaurant stop',
        'Tips for your guide',
      ],
      faq: [
        {
          q: 'Do I need experience to drive?',
          a: "No. The ATVs are automatic: you accelerate, you brake, that's it. Your guide rides with you the whole way and sets the pace.",
        },
        {
          q: 'Which option is right for me?',
          a: 'If you want to drive on your own, the single ATV. If you are a couple and only one of you wants to drive, the ATV for 2. If you are a group and want to ride together, the RZR for 2 or 4.',
        },
        {
          q: "What's included in the price?",
          a: 'Your vehicle, your guide for all 3 hours and all safety gear. The only extra is whatever you order at the restaurant.',
        },
        {
          q: 'What if I need to cancel?',
          a: 'Cancel free of charge up to 48 hours before your tour.',
        },
        {
          q: 'What time do you leave and where do we meet?',
          a: 'There are two departures a day, at 9:00 am and 2:00 pm. The meeting point is the hotel lobby; once your booking is confirmed we email you all the details.',
        },
        {
          q: 'What should I bring?',
          a: "Comfortable clothes you don't mind getting dirty, closed-toe shoes, sunglasses, sunscreen and some cash for the restaurant.",
        },
        {
          q: 'Is it safe to pay online?',
          a: 'Yes. Payments are processed by Stripe, one of the most widely used payment platforms in the world. We never see your card details.',
        },
      ],
      closing: {
        title: "Years from now, you won't remember the hotel pool",
        text: "You'll remember the mud on your face, the roar of the engine and the moment the jungle opens up and the ocean appears. That story starts by picking your date.",
      },
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
