/**
 * Locale index - exports all locales and types
 */

import { nl, type NlLocale } from './nl';

// Available locales
export const locales = {
  nl,
} as const;

// Default locale
export const defaultLocale = 'nl' as const;

// Locale code type
export type LocaleCode = keyof typeof locales;

// Locale type (structure of the locale object)
export type Locale = NlLocale;

// Re-export for convenience
export { nl };
