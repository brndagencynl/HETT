/**
 * Shipping Quote Service (v2)
 * ===========================
 * 
 * Frontend service to call the /api/shipping-quote serverless endpoint.
 * 
 * New shipping rules:
 * - Veranda: free within 300km, €299.99 beyond
 * - Accessories only: €29.99 flat rate
 * - Waddeneilanden: blocked
 * - Pickup: free
 */

// =============================================================================
// TYPES
// =============================================================================

export type ShippingMode = 'pickup' | 'delivery';
export type ShippingCountry = 'NL' | 'BE' | 'DE';
export type ShippingType = 'free' | 'veranda_flat' | 'accessories' | 'pickup';

export interface ShippingAddress {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
}

export interface ShippingQuoteRequest {
  mode: ShippingMode;
  country: ShippingCountry;
  postalCode: string;
  houseNumber: string;
  street: string;
  city: string;
  hasVeranda: boolean; // NEW: Whether cart contains veranda products
}

export interface ShippingQuote {
  type: ShippingType;
  km: number | null;
  priceCents: number;
  priceEur: number;
  formattedPrice: string;
  description: string;
  origin: string;
  destination: string;
  durationText?: string;
  lastUpdated: number;
}

export interface ShippingQuoteSuccess {
  ok: true;
  type: ShippingType;
  km: number | null;
  priceCents: number;
  priceEur: number;
  formattedPrice: string;
  description: string;
  origin: string;
  destination: string;
  durationText?: string;
}

export interface ShippingQuoteBlocked {
  ok: false;
  blocked: true;
  code: 'WADDENEILANDEN';
  message: string;
}

export interface ShippingQuoteError {
  ok: false;
  blocked?: false;
  code: 'INVALID_ADDRESS' | 'GOOGLE_ERROR' | 'MISSING_FIELDS' | 'CONFIG_ERROR' | 'NETWORK_ERROR';
  message: string;
}

export type ShippingQuoteResponse = ShippingQuoteSuccess | ShippingQuoteBlocked | ShippingQuoteError;

/**
 * Check if response is a blocked response (Waddeneilanden)
 */
export function isShippingBlocked(response: ShippingQuoteResponse): response is ShippingQuoteBlocked {
  return !response.ok && 'blocked' in response && response.blocked === true;
}

// =============================================================================
// API CALL
// =============================================================================

/**
 * Fetch a shipping quote from the serverless API.
 * 
 * @param request - Shipping quote request parameters
 * @returns Promise with quote data or error
 * 
 * @example
 * const result = await fetchShippingQuote({
 *   mode: 'delivery',
 *   country: 'BE',
 *   postalCode: '2000',
 *   houseNumber: '1',
 *   street: 'Meir',
 *   city: 'Antwerpen'
 * });
 * 
 * if (result.ok) {
 *   console.log(`Distance: ${result.km} km, Price: ${result.formattedPrice}`);
 * }
 */
export async function fetchShippingQuote(
  request: ShippingQuoteRequest
): Promise<ShippingQuoteResponse> {
  console.log('[Shipping] request payload', request);

  try {
    const response = await fetch('/api/shipping-quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    console.log('[Shipping] response', data);

    if (!response.ok) {
      // Server returned an error
      if (data && 'ok' in data && data.ok === false) {
        return data as ShippingQuoteError;
      }
      return {
        ok: false,
        code: 'GOOGLE_ERROR',
        message: data?.message || `Server error: ${response.status}`,
      };
    }

    return data as ShippingQuoteResponse;
  } catch (error) {
    console.error('[Shipping] error', error);
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      message: 'Kan geen verbinding maken met de server. Controleer je internetverbinding.',
    };
  }
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Build a ShippingQuoteRequest from separate parameters.
 */
export function buildShippingQuoteRequest(
  mode: ShippingMode,
  country: ShippingCountry,
  address: ShippingAddress,
  hasVeranda: boolean = false
): ShippingQuoteRequest {
  return {
    mode,
    country,
    postalCode: address.postalCode,
    houseNumber: address.houseNumber,
    street: address.street,
    city: address.city,
    hasVeranda,
  };
}

/**
 * Convert a successful quote response to a ShippingQuote object.
 */
export function toShippingQuote(response: ShippingQuoteSuccess): ShippingQuote {
  return {
    type: response.type,
    km: response.km,
    priceCents: response.priceCents,
    priceEur: response.priceEur,
    formattedPrice: response.formattedPrice,
    description: response.description,
    origin: response.origin,
    destination: response.destination,
    durationText: response.durationText,
    lastUpdated: Date.now(),
  };
}

/**
 * Format shipping cost for display.
 * Always shows 2 decimals.
 */
export function formatShippingPrice(priceCents: number): string {
  if (priceCents === 0) {
    return 'Gratis';
  }
  const priceEur = priceCents / 100;
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(priceEur);
}

/**
 * Check if shipping is available for a country.
 */
export function isShippingAvailable(country: string): country is ShippingCountry {
  return ['NL', 'BE', 'DE'].includes(country.toUpperCase());
}

/**
 * Get shipping description based on cart contents.
 */
export function getShippingDescription(mode: ShippingMode, hasVeranda: boolean, country?: ShippingCountry): string {
  if (mode === 'pickup') {
    return 'Gratis afhalen in Eindhoven';
  }
  
  if (!hasVeranda) {
    return 'Verzendkosten accessoires: €29,99';
  }
  
  // Veranda orders
  return 'Gratis bezorging binnen 300km. Daarbuiten: €299,99';
}

/**
 * Validate if address fields are complete for shipping calculation.
 */
export function isAddressComplete(
  address: Partial<ShippingAddress>,
  country?: ShippingCountry
): boolean {
  if (!country) return false;
  if (!address.postalCode?.trim()) return false;
  if (!address.city?.trim()) return false;
  // Street and house number are optional but recommended for accuracy
  return true;
}
