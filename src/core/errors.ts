export type BookingErrorCode =
  | 'tour_not_found'
  | 'slot_unavailable'
  | 'too_late'
  | 'invalid_items'
  | 'invalid_travelers'
  | 'sold_out'
  | 'unknown';

const KNOWN: BookingErrorCode[] = [
  'tour_not_found', 'slot_unavailable', 'too_late', 'invalid_items', 'invalid_travelers', 'sold_out',
];

/** Extrae el código de error lanzado por las funciones SQL (RAISE EXCEPTION 'code'). */
export function parseBookingError(message: string | null | undefined): BookingErrorCode {
  if (!message) return 'unknown';
  return KNOWN.find((c) => message.includes(c)) ?? 'unknown';
}

export const BOOKING_ERROR_STATUS: Record<BookingErrorCode, number> = {
  tour_not_found: 404,
  slot_unavailable: 409,
  too_late: 409,
  invalid_items: 400,
  invalid_travelers: 400,
  sold_out: 409,
  unknown: 500,
};
