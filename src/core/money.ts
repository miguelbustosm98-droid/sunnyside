/** Formatea centavos como moneda. Sin dependencias. */
export function formatMoney(cents: number, currency = 'MXN', locale = 'es-MX'): string {
  const value = cents / 100;
  const hasDecimals = cents % 100 !== 0;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}
