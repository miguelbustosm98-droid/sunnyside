export interface PricingOption {
  id: string;
  priceCents: number;
  travelersPerUnit: number;
  maxQuantity: number;
}
export interface Selection {
  optionId: string;
  quantity: number;
}
export interface Totals {
  totalCents: number;
  travelers: number;
}

/** Calcula total y viajeros. Es solo para mostrar: el servidor recalcula con precios de la BD. */
export function computeTotals(options: PricingOption[], selections: Selection[]): Totals {
  const byId = new Map(options.map((o) => [o.id, o]));
  let totalCents = 0;
  let travelers = 0;
  for (const s of selections) {
    const o = byId.get(s.optionId);
    if (!o || s.quantity <= 0) continue;
    const q = Math.min(s.quantity, o.maxQuantity);
    totalCents += o.priceCents * q;
    travelers += o.travelersPerUnit * q;
  }
  return { totalCents, travelers };
}
