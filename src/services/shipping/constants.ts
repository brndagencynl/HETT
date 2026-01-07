/**
 * Shipping Constants
 * ==================
 * 
 * Configuration for the shipping calculation system.
 */

// =============================================================================
// ORIGIN ADDRESS
// =============================================================================

/** Warehouse address used as origin for distance calculations */
export const ORIGIN_ADDRESS = 'Hoppenkuil 17, 5626DD Eindhoven, Netherlands';

/** Warehouse location for display */
export const WAREHOUSE_LOCATION = {
  street: 'Hoppenkuil 17',
  postalCode: '5626DD',
  city: 'Eindhoven',
  country: 'Netherlands',
};

// =============================================================================
// SHOPIFY PRODUCT
// =============================================================================

/**
 * Handle of the Shopify product used for shipping costs.
 * This product should be:
 * - Priced at €1.00
 * - Have high inventory (or no inventory tracking)
 * - Not shown in collections (hidden from shop)
 */
export const SHIPPING_PRODUCT_HANDLE = 'bezorgkosten-per-km';

/**
 * Internal cart ID for the shipping line item.
 * Used to identify and update the shipping line idempotently.
 */
export const SHIPPING_LINE_CART_ID = '__shipping_bezorgkosten__';

// =============================================================================
// PRICING
// =============================================================================

/** Price per kilometer for BE/DE deliveries (in EUR) */
export const PRICE_PER_KM_EUR = 1.00;

/** Price per kilometer in cents */
export const PRICE_PER_KM_CENTS = 100;

// =============================================================================
// COUNTRIES
// =============================================================================

export type ShippingCountry = 'NL' | 'BE' | 'DE';

export const SUPPORTED_COUNTRIES: ShippingCountry[] = ['NL', 'BE', 'DE'];

export const COUNTRY_LABELS: Record<ShippingCountry, string> = {
  NL: 'Nederland',
  BE: 'België',
  DE: 'Duitsland',
};

export const COUNTRY_NAMES: Record<ShippingCountry, string> = {
  NL: 'Netherlands',
  BE: 'Belgium',
  DE: 'Germany',
};

// =============================================================================
// SHIPPING RULES
// =============================================================================

/**
 * Countries where shipping is charged per kilometer.
 * NL is always free.
 */
export const PAID_SHIPPING_COUNTRIES: ShippingCountry[] = ['BE', 'DE'];

/**
 * Check if shipping is free for a country.
 */
export function isShippingFree(country: ShippingCountry): boolean {
  return country === 'NL';
}

/**
 * Check if shipping costs apply for a country.
 */
export function isShippingPaid(country: ShippingCountry): boolean {
  return PAID_SHIPPING_COUNTRIES.includes(country);
}
