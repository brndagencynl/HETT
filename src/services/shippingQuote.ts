/**
 * Shipping Quote Service
 * ======================
 * 
 * Frontend service to call the /api/shipping-quote serverless endpoint.
 * Handles shipping cost calculation based on delivery mode and address.
 */

// =============================================================================
// TYPES
// =============================================================================

export type ShippingMode = 'pickup' | 'delivery';
export type ShippingCountry = 'NL' | 'BE' | 'DE';

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
}

export interface ShippingQuote {
  km: number;
  price: number;
  currency: 'EUR';
  formattedPrice: string;
  origin: string;
  destination: string;
  durationText?: string;
  lastUpdated: number;
}

export interface ShippingQuoteSuccess {
  ok: true;
  km: number;
  price: number;
  currency: 'EUR';
  formattedPrice: string;
  origin: string;
  destination: string;
  durationText?: string;
}

export interface ShippingQuoteError {
  ok: false;
  code: 'INVALID_ADDRESS' | 'GOOGLE_ERROR' | 'MISSING_FIELDS' | 'CONFIG_ERROR' | 'NETWORK_ERROR';
  message: string;
}

export type ShippingQuoteResponse = ShippingQuoteSuccess | ShippingQuoteError;

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
  address: ShippingAddress
): ShippingQuoteRequest {
  return {
    mode,
    country,
    postalCode: address.postalCode,
    houseNumber: address.houseNumber,
    street: address.street,
    city: address.city,
  };
}

/**
 * Convert a successful quote response to a ShippingQuote object.
 */
export function toShippingQuote(response: ShippingQuoteSuccess): ShippingQuote {
  return {
    km: response.km,
    price: response.price,
    currency: response.currency,
    formattedPrice: response.formattedPrice,
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
export function formatShippingPrice(price: number): string {
  if (price === 0) {
    return 'Gratis';
  }
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Check if shipping is available for a country.
 */
export function isShippingAvailable(country: string): country is ShippingCountry {
  return ['NL', 'BE', 'DE'].includes(country.toUpperCase());
}

/**
 * Get shipping description based on country.
 */
export function getShippingDescription(mode: ShippingMode, country?: ShippingCountry): string {
  if (mode === 'pickup') {
    return 'Gratis afhalen in Eindhoven';
  }
  if (country === 'NL') {
    return 'Gratis bezorging in Nederland';
  }
  return 'Bezorgkosten: € 1,00 per km vanaf Eindhoven';
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
