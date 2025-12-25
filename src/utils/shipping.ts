/**
 * Shipping Utilities
 * ==================
 * 
 * Client-side postal code detection and shipping cost calculation.
 * Architecture designed for easy extension to Vercel serverless routes.
 * 
 * Supported Countries:
 * - NL (Netherlands): Pattern ^[1-9][0-9]{3}\s?[A-Za-z]{2}$ (e.g., "1234 AB" or "1234AB")
 * - BE (Belgium): Pattern ^\d{4}$ (4 digits, range 1000-9992)
 * - DE (Germany): Pattern ^\d{5}$ (5 digits)
 * 
 * Shipping Costs:
 * - Pickup: Always free
 * - Delivery NL: €0 (free)
 * - Delivery BE: €99
 * - Delivery DE: €199
 */

// =============================================================================
// TYPES
// =============================================================================

export type ShippingMethod = 'pickup' | 'delivery';
export type CountryCode = 'NL' | 'BE' | 'DE';

export interface ShippingValidation {
  isValid: boolean;
  country: CountryCode | null;
  cost: number;
  message: string;
}

export interface ShippingState {
  method: ShippingMethod;
  postcode: string;
  country: CountryCode | null;
  cost: number;
  isValid: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Postal code regex patterns per country */
const POSTCODE_PATTERNS: Record<CountryCode, RegExp> = {
  NL: /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/,
  BE: /^\d{4}$/,
  DE: /^\d{5}$/,
};

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

/** Shipping result messages */
const SHIPPING_MESSAGES: Record<CountryCode, string> = {
  NL: 'Nederland – Gratis levering',
  BE: 'België – €99 bezorgkosten',
  DE: 'Duitsland – €199 bezorgkosten',
};

// =============================================================================
// DETECTION FUNCTIONS
// =============================================================================

/**
 * Detect country from postal code pattern.
 * Tests NL first (most specific pattern), then DE, then BE.
 * 
 * @param postcode - Raw postcode input (will be trimmed)
 * @returns Country code or null if not recognized
 */
export function detectCountryFromPostcode(postcode: string): CountryCode | null {
  const trimmed = postcode.trim();
  
  if (!trimmed) return null;
  
  // Test NL first (most specific: 4 digits + 2 letters)
  if (POSTCODE_PATTERNS.NL.test(trimmed)) {
    return 'NL';
  }
  
  // Test DE next (5 digits)
  if (POSTCODE_PATTERNS.DE.test(trimmed)) {
    return 'DE';
  }
  
  // Test BE last (4 digits - could overlap with partial input)
  if (POSTCODE_PATTERNS.BE.test(trimmed)) {
    return 'BE';
  }
  
  return null;
}

/**
 * Validate a postal code for a specific country.
 * 
 * @param postcode - Postal code to validate
 * @param country - Country to validate against
 * @returns Whether the postcode matches the country's pattern
 */
export function validatePostcodeForCountry(postcode: string, country: CountryCode): boolean {
  const trimmed = postcode.trim();
  return POSTCODE_PATTERNS[country].test(trimmed);
}

// =============================================================================
// COST FUNCTIONS
// =============================================================================

/**
 * Get shipping cost for a country.
 * Pickup is always free regardless of country.
 * 
 * @param method - Shipping method
 * @param country - Destination country (null = not determined)
 * @returns Shipping cost in euros
 */
export function getShippingCost(method: ShippingMethod, country: CountryCode | null): number {
  if (method === 'pickup') {
    return 0;
  }
  
  if (!country) {
    return 0; // Not determined yet
  }
  
  return DELIVERY_FEES[country];
}

/**
 * Format shipping cost for display.
 * 
 * @param cost - Cost in euros
 * @returns Formatted string (e.g., "Gratis" or "€99")
 */
export function formatShippingCost(cost: number): string {
  return cost === 0 ? 'Gratis' : `€${cost}`;
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate postal code and return full shipping information.
 * This is the main function to use for validating shipping input.
 * 
 * @param method - Shipping method selected
 * @param postcode - Postal code entered (only used for delivery)
 * @returns Full validation result with country, cost, and message
 */
export function validateShipping(method: ShippingMethod, postcode: string): ShippingValidation {
  // Pickup is always valid and free
  if (method === 'pickup') {
    return {
      isValid: true,
      country: null,
      cost: 0,
      message: 'Afhalen in Eindhoven (gratis)',
    };
  }
  
  // Delivery requires valid postcode
  const trimmed = postcode.trim();
  
  if (!trimmed) {
    return {
      isValid: false,
      country: null,
      cost: 0,
      message: 'Voer een postcode in',
    };
  }
  
  const country = detectCountryFromPostcode(trimmed);
  
  if (!country) {
    return {
      isValid: false,
      country: null,
      cost: 0,
      message: 'Postcode niet herkend. Alleen NL/BE/DE.',
    };
  }
  
  return {
    isValid: true,
    country,
    cost: DELIVERY_FEES[country],
    message: SHIPPING_MESSAGES[country],
  };
}

// =============================================================================
// LABEL FUNCTIONS
// =============================================================================

/**
 * Get country label for display.
 */
export function getCountryLabel(country: CountryCode): string {
  return COUNTRY_LABELS[country];
}

/**
 * Get shipping method label for display.
 */
export function getMethodLabel(method: ShippingMethod): string {
  return method === 'pickup' ? 'Afhalen' : 'Bezorgen';
}

/**
 * Get full shipping summary for display (e.g., on checkout page).
 */
export function getShippingSummary(method: ShippingMethod, country: CountryCode | null, postcode: string): string {
  if (method === 'pickup') {
    return 'Afhalen in Eindhoven';
  }
  
  if (!country) {
    return 'Bezorgen';
  }
  
  const countryLabel = COUNTRY_LABELS[country];
  const normalizedPostcode = postcode.trim().toUpperCase();
  
  return `Bezorgen naar ${countryLabel} (${normalizedPostcode})`;
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const DEFAULT_SHIPPING_STATE: ShippingState = {
  method: 'delivery',
  postcode: '',
  country: null,
  cost: 0,
  isValid: false,
};

// =============================================================================
// STORAGE KEY (for localStorage persistence)
// =============================================================================

export const SHIPPING_STORAGE_KEY = 'hett_shipping';
