export const str = (fd: FormData, k: string): string => String(fd.get(k) ?? '').trim();
export const optStr = (fd: FormData, k: string): string | null => str(fd, k) || null;
export const int = (fd: FormData, k: string, d = 0): number => {
  const n = parseInt(str(fd, k), 10);
  return Number.isFinite(n) ? n : d;
};
export const pesosToCents = (fd: FormData, k: string): number => {
  const n = parseFloat(str(fd, k).replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};
export const bool = (fd: FormData, k: string): boolean => fd.get(k) === 'on';
