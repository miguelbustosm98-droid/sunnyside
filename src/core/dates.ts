/** Utilidades de fecha sin zona horaria (YYYY-MM-DD) para evitar saltos por UTC. */
export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseIsoDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(s: string, n: number): string {
  const d = parseIsoDate(s);
  d.setDate(d.getDate() + n);
  return isoDate(d);
}

export function isValidIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  return isoDate(parseIsoDate(s)) === s;
}

/** Hora "09:00:00" -> "09:00" */
export function shortTime(t: string): string {
  return t.slice(0, 5);
}

/** "09:00" -> "9:00 AM" */
export function time12h(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Fecha de hoy en America/Mexico_City (YYYY-MM-DD). */
export function todayInMexico(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(now);
}
