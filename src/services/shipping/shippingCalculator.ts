/**
 * Shipping Calculator
 * ====================
 * 
 * Calculates shipping costs based on distance.
 * 
 * Pricing rules:
 * - NL (Netherlands): Free delivery (€0)
 * - BE (Belgium): €1 per km (rounded up)
 * - DE (Germany): €1 per km (rounded up)
 * 
 * Note: Distance is calculated from warehouse in Eindhoven.
 */

import { fetchDistance, type DistanceRequest } from './distanceClient';

// =============================================================================
// TYPES
// =============================================================================

export interface ShippingAddress {
  country: 'NL' | 'BE' | 'DE';
  postalCode: string;
  street?: string;
  city?: string;
}

export interface ShippingCalculationResult {
  success: true;
  country: 'NL' | 'BE' | 'DE';
  distanceKm: number;
  costCents: number;
  costEuros: number;
  durationText: string;
  origin: string;
  destination: string;
}

export interface ShippingCalculationError {
  success: false;
  error: string;
}

export type ShippingResult = ShippingCalculationResult | ShippingCalculationError;

// =============================================================================
// PRICING CONFIGURATION
// =============================================================================

/**
 * Price per kilometer in cents.
 * NL = 0 (free delivery)
 * BE/DE = 100 cents (€1) per km
 */
export const PRICE_PER_KM_CENTS: Record<'NL' | 'BE' | 'DE', number> = {
  NL: 0,
  BE: 100,
  DE: 100,
};

/**
 * Minimum shipping cost in cents per country (if not free).
 * This ensures very short distances don't result in €0 shipping.
 */
export const MINIMUM_COST_CENTS: Record<'NL' | 'BE' | 'DE', number> = {
  NL: 0,      // Free for NL
  BE: 5000,   // Minimum €50 for BE
  DE: 5000,   // Minimum €50 for DE
};

/**
 * Maximum shipping cost cap in cents per country.
 * Prevents extremely high costs for far destinations.
 */
export const MAXIMUM_COST_CENTS: Record<'NL' | 'BE' | 'DE', number> = {
  NL: 0,       // Free for NL
  BE: 50000,   // Max €500 for BE
  DE: 50000,   // Max €500 for DE
};

// =============================================================================
// SHIPPING CALCULATION
// =============================================================================

/**
 * Calculates shipping cost based on distance.
 * 
 * @param distanceKm - Distance in kilometers
 * @param country - Destination country
 * @returns Cost in cents
 */
export function calculateCostFromDistance(
  distanceKm: number,
  country: 'NL' | 'BE' | 'DE'
): number {
  // NL is always free
  if (country === 'NL') {
    return 0;
  }

  // Calculate raw cost (€1/km = 100 cents/km, rounded UP)
  const pricePerKm = PRICE_PER_KM_CENTS[country];
  const rawCostCents = Math.ceil(distanceKm) * pricePerKm;

  // Apply minimum
  const withMinimum = Math.max(rawCostCents, MINIMUM_COST_CENTS[country]);

  // Apply maximum cap
  const finalCost = Math.min(withMinimum, MAXIMUM_COST_CENTS[country]);

  return finalCost;
}

/**
 * Converts cents to euros.
 * 
 * @param cents - Amount in cents
 * @returns Amount in euros
 */
export function centsToEuros(cents: number): number {
  return cents / 100;
}

/**
 * Formats a price in euros for display.
 * 
 * @param cents - Amount in cents
 * @returns Formatted string like "€ 99,00"
 */
export function formatPrice(cents: number): string {
  const euros = centsToEuros(cents);
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(euros);
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

/**
 * Calculates shipping cost for a given address.
 * 
 * This function:
 * 1. Calls the /api/distance endpoint to get driving distance
 * 2. Applies pricing rules based on country
 * 3. Returns detailed shipping information
 * 
 * @param address - The shipping address
 * @returns ShippingResult with cost details or error
 * 
 * @example
 * const result = await calculateShipping({
 *   country: 'BE',
 *   postalCode: '2000',
 *   city: 'Antwerpen'
 * });
 * 
 * if (result.success) {
 *   console.log(`Shipping: ${formatPrice(result.costCents)}`);
 *   console.log(`Distance: ${result.distanceKm} km`);
 * }
 */
export async function calculateShipping(
  address: ShippingAddress
): Promise<ShippingResult> {
  // For NL, we can skip the distance calculation since it's always free
  // But we still call it to get the distance for display purposes
  
  const distanceRequest: DistanceRequest = {
    country: address.country,
    postalCode: address.postalCode,
    street: address.street,
    city: address.city,
  };

  // Fetch distance from API
  const distanceResult = await fetchDistance(distanceRequest);

  if (distanceResult.success === false) {
    return {
      success: false,
      error: distanceResult.error,
    };
  }

  const { distanceKm, durationText, origin, destination } = distanceResult.data;

  // Calculate cost
  const costCents = calculateCostFromDistance(distanceKm, address.country);
  const costEuros = centsToEuros(costCents);

  return {
    success: true,
    country: address.country,
    distanceKm,
    costCents,
    costEuros,
    durationText,
    origin,
    destination,
  };
}

// =============================================================================
// INSTANT ESTIMATE (without API call)
// =============================================================================

/**
 * Returns an instant estimate without calling the API.
 * Useful for showing approximate costs while the real calculation loads.
 * 
 * Based on average distances:
 * - NL: ~100km average → €0 (free)
 * - BE: ~150km average → €150
 * - DE: ~300km average → €300
 * 
 * @param country - Destination country
 * @returns Estimated cost in cents
 */
export function getInstantEstimate(country: 'NL' | 'BE' | 'DE'): number {
  const estimates: Record<'NL' | 'BE' | 'DE', number> = {
    NL: 0,
    BE: 15000, // €150
    DE: 30000, // €300
  };
  return estimates[country];
}

/**
 * Gets a human-readable shipping description.
 * 
 * @param country - Destination country
 * @returns Description string
 */
export function getShippingDescription(country: 'NL' | 'BE' | 'DE'): string {
  if (country === 'NL') {
    return 'Gratis bezorging in Nederland';
  }
  return `Bezorgkosten: €1,- per km (afstand vanaf Eindhoven)`;
}

/**
 * Checks if shipping is available for a country.
 * 
 * @param countryCode - Country code to check
 * @returns true if shipping is available
 */
export function isShippingAvailable(countryCode: string): boolean {
  const validCountries = ['NL', 'BE', 'DE'];
  return validCountries.includes(countryCode.toUpperCase());
}
