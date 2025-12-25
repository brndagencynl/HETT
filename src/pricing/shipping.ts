/**
 * Shipping Module
 * ===============
 * 
 * Single source of truth for shipping methods, countries, and fees.
 * 
 * Business Rules:
 * - Pickup is ALWAYS free
 * - Delivery fee depends on country:
 *   - NL: €0 (free)
 *   - BE: €99
 *   - DE: €199
 */

// =============================================================================
// TYPES
// =============================================================================

export type ShippingMethod = 'pickup' | 'delivery';
export type CountryCode = 'NL' | 'BE' | 'DE';

// =============================================================================
// CONSTANTS
// =============================================================================

/** Delivery fees per country (in euros) */
const DELIVERY_FEES: Record<CountryCode, number> = {
  NL: 0,
  BE: 99,
  DE: 199,
};

/** Country labels for UI */
const COUNTRY_LABELS: Record<CountryCode, string> = {
  NL: 'Nederland',
  BE: 'België',
  DE: 'Duitsland',
};

/** Shipping method labels */
const METHOD_LABELS: Record<ShippingMethod, string> = {
  pickup: 'Afhalen',
  delivery: 'Bezorgen',
};

/** All available countries */
export const AVAILABLE_COUNTRIES: CountryCode[] = ['NL', 'BE', 'DE'];

/** Default shipping values */
export const DEFAULT_SHIPPING_METHOD: ShippingMethod = 'delivery';
export const DEFAULT_SHIPPING_COUNTRY: CountryCode = 'NL';

// =============================================================================
// FUNCTIONS
// =============================================================================

/**
 * Get shipping fee for given method and country
 * Pickup is always free, delivery depends on country
 */
export function getShippingFee(method: ShippingMethod, country: CountryCode): number {
  if (method === 'pickup') {
    return 0;
  }
  return DELIVERY_FEES[country] ?? 0;
}

/**
 * Get human-readable shipping label
 * e.g., "Bezorgen - Nederland (Gratis)" or "Afhalen (Gratis)"
 */
export function getShippingLabel(method: ShippingMethod, country: CountryCode): string {
  const methodLabel = METHOD_LABELS[method];
  const fee = getShippingFee(method, country);
  const feeLabel = fee === 0 ? 'Gratis' : `€${fee}`;
  
  if (method === 'pickup') {
    return `${methodLabel} (${feeLabel})`;
  }
  
  const countryLabel = COUNTRY_LABELS[country];
  return `${methodLabel} - ${countryLabel} (${feeLabel})`;
}

/**
 * Get country label for UI
 */
export function getCountryLabel(country: CountryCode): string {
  return COUNTRY_LABELS[country];
}

/**
 * Get method label for UI
 */
export function getMethodLabel(method: ShippingMethod): string {
  return METHOD_LABELS[method];
}

/**
 * Format shipping fee for display
 */
export function formatShippingFee(fee: number): string {
  if (fee === 0) {
    return 'Gratis';
  }
  return `€${fee},-`;
}
