export interface Slot {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  scheduleId: string;
  capacity: number;
  booked: number;
  remaining: number;
}

export function groupSlotsByDate(slots: Slot[]): Map<string, Slot[]> {
  const map = new Map<string, Slot[]>();
  for (const s of slots) {
    const list = map.get(s.date) ?? [];
    list.push(s);
    map.set(s.date, list);
  }
  for (const list of map.values()) list.sort((a, b) => a.time.localeCompare(b.time));
  return map;
}

/** Una fecha está disponible si algún horario tiene cupo >= travelers. */
export function availableDates(slots: Slot[], travelers = 1): Set<string> {
  const out = new Set<string>();
  for (const s of slots) if (s.remaining >= travelers) out.add(s.date);
  return out;
}
