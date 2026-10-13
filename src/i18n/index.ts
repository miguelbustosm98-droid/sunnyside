import { es, type Dict } from './es';
import { en } from './en';
import type { Locale } from './config';

export function getDict(locale: Locale): Dict {
  return locale === 'en' ? en : es;
}
export type { Dict };
export * from './config';
