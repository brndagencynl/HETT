/**
 * Simple i18n utility for HETT Configurator
 * No external dependencies - just a dot-notation key accessor with interpolation
 */

import { locales, defaultLocale, type LocaleCode, type Locale } from '../locales';

/**
 * Get a nested value from an object using dot notation
 * @param obj The object to traverse
 * @param path Dot-separated path (e.g., "configurator.steps.daktype.title")
 * @returns The value at the path or undefined
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Interpolate variables in a string
 * Replaces {key} with the corresponding value from vars
 * @param str The string with placeholders
 * @param vars Object with key-value pairs for replacement
 */
function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, key) => {
    return vars[key] !== undefined ? String(vars[key]) : `{${key}}`;
  });
}

/**
 * Translation function type
 */
export type TranslateFunction = {
  (key: string, fallback?: string): string;
  (key: string, vars: Record<string, string | number>, fallback?: string): string;
};

/**
 * Create a translation function for a specific locale
 * @param locale The locale code (e.g., 'nl')
 * @returns A translation function t(key, fallback?) or t(key, vars, fallback?)
 */
export function createT(locale: LocaleCode = defaultLocale): TranslateFunction {
  const localeData = locales[locale] as Locale;

  return function t(
    key: string,
    varsOrFallback?: string | Record<string, string | number>,
    fallback?: string
  ): string {
    // Determine if second arg is vars object or fallback string
    const isVarsObject = typeof varsOrFallback === 'object';
    const vars = isVarsObject ? varsOrFallback : undefined;
    const finalFallback = isVarsObject ? fallback : varsOrFallback;

    const value = getNestedValue(localeData as unknown as Record<string, unknown>, key);
    
    if (typeof value === 'string') {
      return interpolate(value, vars);
    }
    
    // Return fallback or the key itself as last resort
    return finalFallback ?? key;
  };
}

/**
 * Pre-created Dutch translation function for convenience
 */
export const t = createT('nl');

/**
 * Hook-like function for components (can be used in React components)
 * Returns the translation function for the specified locale
 */
export function useTranslation(locale: LocaleCode = defaultLocale) {
  return {
    t: createT(locale),
    locale,
  };
}
