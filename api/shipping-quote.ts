/**
 * Vercel Serverless Function: Shipping Quote
 * ==========================================
 * 
 * Calculates shipping cost based on delivery mode and distance.
 * 
 * Pricing rules:
 * - Pickup: Free (€0)
 * - Delivery NL: Free (€0)
 * - Delivery BE/DE: €1 per km (exact distance from Eindhoven warehouse)
 * 
 * Endpoint: POST /api/shipping-quote
 * 
 * Request body:
 * {
 *   mode: 'pickup' | 'delivery',
 *   country: 'NL' | 'BE' | 'DE',
 *   postalCode: string,
 *   houseNumber: string,
 *   street: string,
 *   city: string
 * }
 * 
 * Response (success):
 * {
 *   ok: true,
 *   km: number,
 *   price: number,
 *   currency: 'EUR',
 *   formattedPrice: string,
 *   origin: string,
 *   destination: string
 * }
 * 
 * Response (error):
 * {
 *   ok: false,
 *   code: 'INVALID_ADDRESS' | 'GOOGLE_ERROR' | 'MISSING_FIELDS' | 'CONFIG_ERROR',
 *   message: string
 * }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// =============================================================================
// TYPES
// =============================================================================

type ShippingMode = 'pickup' | 'delivery';
type CountryCode = 'NL' | 'BE' | 'DE';

interface ShippingQuoteRequest {
  mode: ShippingMode;
  country: CountryCode;
  postalCode: string;
  houseNumber: string;
  street: string;
  city: string;
}

interface ShippingQuoteSuccess {
  ok: true;
  km: number;
  price: number;
  currency: 'EUR';
  formattedPrice: string;
  origin: string;
  destination: string;
  durationText?: string;
}

interface ShippingQuoteError {
  ok: false;
  code: 'INVALID_ADDRESS' | 'GOOGLE_ERROR' | 'MISSING_FIELDS' | 'CONFIG_ERROR';
  message: string;
}

type ShippingQuoteResponse = ShippingQuoteSuccess | ShippingQuoteError;

interface GoogleDistanceMatrixResponse {
  status: string;
  origin_addresses: string[];
  destination_addresses: string[];
  rows: Array<{
    elements: Array<{
      status: string;
      distance?: {
        value: number;
        text: string;
      };
      duration?: {
        value: number;
        text: string;
      };
    }>;
  }>;
  error_message?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const ORIGIN_ADDRESS = 'Hoppenkuil 17, 5626DD Eindhoven, NL';
const VALID_COUNTRIES: CountryCode[] = ['NL', 'BE', 'DE'];
const VALID_MODES: ShippingMode[] = ['pickup', 'delivery'];
const PRICE_PER_KM = 1.00; // €1 per km for BE/DE
const MAX_INPUT_LENGTH = 200;

// Fallback prices when Google API fails (approximate distances from Eindhoven)
const FALLBACK_PRICES: Record<CountryCode, number> = {
  NL: 0,    // NL is always free
  BE: 100,  // ~100km average to Belgium
  DE: 150,  // ~150km average to Germany
};

const COUNTRY_NAMES: Record<CountryCode, string> = {
  NL: 'Netherlands',
  BE: 'Belgium',
  DE: 'Germany',
};

// ISO 3166-1 alpha-2 codes for address formatting
const COUNTRY_ISO_CODES: Record<CountryCode, string> = {
  NL: 'NL',
  BE: 'BE',
  DE: 'DE',
};

// =============================================================================
// HELPERS
// =============================================================================

function sanitize(input: unknown, maxLen = MAX_INPUT_LENGTH): string {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>{}[\]\\]/g, '').slice(0, maxLen);
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

function validateRequest(body: unknown): 
  | { valid: true; data: ShippingQuoteRequest }
  | { valid: false; error: ShippingQuoteError } {
  
  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      error: { ok: false, code: 'MISSING_FIELDS', message: 'Request body is required' },
    };
  }

  const { mode, country, postalCode, houseNumber, street, city } = body as Record<string, unknown>;

  // Validate mode
  const cleanMode = sanitize(mode) as ShippingMode;
  if (!VALID_MODES.includes(cleanMode)) {
    return {
      valid: false,
      error: { ok: false, code: 'MISSING_FIELDS', message: `mode must be one of: ${VALID_MODES.join(', ')}` },
    };
  }

  // For pickup, we don't need address details
  if (cleanMode === 'pickup') {
    return {
      valid: true,
      data: {
        mode: 'pickup',
        country: 'NL',
        postalCode: '',
        houseNumber: '',
        street: '',
        city: '',
      },
    };
  }

  // For delivery, validate all fields
  const cleanCountry = sanitize(country).toUpperCase() as CountryCode;
  if (!VALID_COUNTRIES.includes(cleanCountry)) {
    return {
      valid: false,
      error: { ok: false, code: 'MISSING_FIELDS', message: `country must be one of: ${VALID_COUNTRIES.join(', ')}` },
    };
  }

  const cleanPostalCode = sanitize(postalCode, 20);
  const cleanHouseNumber = sanitize(houseNumber, 20);
  const cleanStreet = sanitize(street, 100);
  const cleanCity = sanitize(city, 100);

  if (!cleanPostalCode || !cleanCity) {
    return {
      valid: false,
      error: { ok: false, code: 'MISSING_FIELDS', message: 'postalCode and city are required for delivery' },
    };
  }

  return {
    valid: true,
    data: {
      mode: 'delivery',
      country: cleanCountry,
      postalCode: cleanPostalCode,
      houseNumber: cleanHouseNumber,
      street: cleanStreet,
      city: cleanCity,
    },
  };
}

function buildDestination(data: ShippingQuoteRequest): string {
  const isoCode = COUNTRY_ISO_CODES[data.country];
  const parts: string[] = [];

  // Build address: "Street HouseNumber, PostalCode City, ISO_CODE"
  // Always include ISO country code for reliable geocoding
  if (data.street) {
    if (data.houseNumber) {
      parts.push(`${data.street} ${data.houseNumber}`);
    } else {
      parts.push(data.street);
    }
  }

  parts.push(`${data.postalCode} ${data.city}`);
  parts.push(isoCode); // Use ISO code instead of full country name

  return parts.join(', ');
}

/**
 * Calculate fallback price when Google API is unavailable
 */
function calculateFallbackPrice(country: CountryCode): ShippingQuoteSuccess {
  const fallbackKm = FALLBACK_PRICES[country];
  const price = country === 'NL' ? 0 : fallbackKm * PRICE_PER_KM;
  
  console.warn(`[Shipping] Using fallback price for ${country}: ${fallbackKm}km = €${price}`);
  
  return {
    ok: true,
    km: fallbackKm,
    price,
    currency: 'EUR',
    formattedPrice: formatPrice(price),
    origin: ORIGIN_ADDRESS,
    destination: `${country} (geschatte afstand)`,
    durationText: undefined,
  };
}

async function fetchGoogleDistance(
  origin: string,
  destination: string,
  apiKey: string
): Promise<GoogleDistanceMatrixResponse> {
  const params = new URLSearchParams({
    origins: origin,
    destinations: destination,
    mode: 'driving',
    units: 'metric',
    key: apiKey,
  });

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;
  
  console.log('[Shipping] Google API request URL (without key):', url.replace(apiKey, 'REDACTED'));
  
  const response = await fetch(url);
  const responseText = await response.text();
  
  console.log('[Shipping] Google API raw response:', responseText);

  if (!response.ok) {
    console.error('[Shipping] Google API HTTP error:', response.status, responseText);
    throw new Error(`Google API HTTP error: ${response.status}`);
  }

  try {
    return JSON.parse(responseText);
  } catch (e) {
    console.error('[Shipping] Failed to parse Google API response:', e);
    throw new Error('Failed to parse Google API response');
  }
}

// =============================================================================
// HANDLER
// =============================================================================

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // CORS headers for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, code: 'MISSING_FIELDS', message: 'Method not allowed. Use POST.' });
    return;
  }

  console.log('[Shipping] request payload', req.body);

  // Validate request
  const validation = validateRequest(req.body);
  if (validation.valid === false) {
    console.log('[Shipping] validation error', validation.error);
    res.status(422).json(validation.error);
    return;
  }

  const { data } = validation;

  // ==========================================================================
  // PICKUP MODE - Always free
  // ==========================================================================
  if (data.mode === 'pickup') {
    const response: ShippingQuoteSuccess = {
      ok: true,
      km: 0,
      price: 0,
      currency: 'EUR',
      formattedPrice: formatPrice(0),
      origin: ORIGIN_ADDRESS,
      destination: 'Afhalen in Eindhoven',
    };
    console.log('[Shipping] response (pickup)', response);
    res.status(200).json(response);
    return;
  }

  // ==========================================================================
  // DELIVERY NL - Free but optionally compute distance
  // ==========================================================================
  if (data.country === 'NL') {
    // For NL, shipping is free. We can optionally compute distance for display.
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (apiKey) {
      try {
        const destination = buildDestination(data);
        const googleResponse = await fetchGoogleDistance(ORIGIN_ADDRESS, destination, apiKey);
        
        if (googleResponse.status === 'OK') {
          const element = googleResponse.rows?.[0]?.elements?.[0];
          if (element?.status === 'OK' && element.distance) {
            const km = Math.round((element.distance.value / 1000) * 10) / 10;
            const response: ShippingQuoteSuccess = {
              ok: true,
              km,
              price: 0, // NL is always free
              currency: 'EUR',
              formattedPrice: formatPrice(0),
              origin: googleResponse.origin_addresses?.[0] || ORIGIN_ADDRESS,
              destination: googleResponse.destination_addresses?.[0] || destination,
              durationText: element.duration?.text,
            };
            console.log('[Shipping] response (NL with distance)', response);
            res.status(200).json(response);
            return;
          }
        }
      } catch (error) {
        console.log('[Shipping] NL distance calculation failed, returning free anyway:', error);
      }
    }

    // Fallback: return free shipping without distance
    const response: ShippingQuoteSuccess = {
      ok: true,
      km: 0,
      price: 0,
      currency: 'EUR',
      formattedPrice: formatPrice(0),
      origin: ORIGIN_ADDRESS,
      destination: buildDestination(data),
    };
    console.log('[Shipping] response (NL fallback)', response);
    res.status(200).json(response);
    return;
  }

  // ==========================================================================
  // DELIVERY BE/DE - €1 per km
  // ==========================================================================
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  // If no API key configured, use fallback pricing (never fail checkout)
  if (!apiKey) {
    console.error('[Shipping] GOOGLE_MAPS_API_KEY not configured - using fallback pricing for', data.country);
    const fallbackResponse = calculateFallbackPrice(data.country);
    res.status(200).json(fallbackResponse);
    return;
  }

  const destination = buildDestination(data);
  console.log('[Shipping] Calculating distance from:', ORIGIN_ADDRESS);
  console.log('[Shipping] Calculating distance to:', destination);
  console.log('[Shipping] Country:', data.country, '| ISO:', COUNTRY_ISO_CODES[data.country]);

  try {
    const googleResponse = await fetchGoogleDistance(ORIGIN_ADDRESS, destination, apiKey);
    
    console.log('[Shipping] Google API response status:', googleResponse.status);
    if (googleResponse.error_message) {
      console.error('[Shipping] Google API error_message:', googleResponse.error_message);
    }

    if (googleResponse.status !== 'OK') {
      console.error('[Shipping] Google API top-level error:', googleResponse.status, googleResponse.error_message);
      // Use fallback instead of failing
      console.warn('[Shipping] Falling back to estimated price due to Google API error');
      const fallbackResponse = calculateFallbackPrice(data.country);
      res.status(200).json(fallbackResponse);
      return;
    }

    const element = googleResponse.rows?.[0]?.elements?.[0];
    console.log('[Shipping] Element status:', element?.status);
    
    if (!element || element.status !== 'OK') {
      const errorStatus = element?.status || 'UNKNOWN';
      console.error('[Shipping] Element error:', errorStatus);
      
      // Use fallback instead of failing - Shopify checkout must never break
      console.warn('[Shipping] Falling back to estimated price due to element error:', errorStatus);
      const fallbackResponse = calculateFallbackPrice(data.country);
      res.status(200).json(fallbackResponse);
      return;
    }

    // Calculate distance and price
    const distanceMeters = element.distance?.value ?? 0;
    const km = Math.round((distanceMeters / 1000) * 10) / 10; // One decimal
    const price = Math.round(km * PRICE_PER_KM * 100) / 100; // Two decimals

    console.log('[Shipping] Distance calculated:', km, 'km | Price:', price, 'EUR');

    const response: ShippingQuoteSuccess = {
      ok: true,
      km,
      price,
      currency: 'EUR',
      formattedPrice: formatPrice(price),
      origin: googleResponse.origin_addresses?.[0] || ORIGIN_ADDRESS,
      destination: googleResponse.destination_addresses?.[0] || destination,
      durationText: element.duration?.text,
    };

    console.log('[Shipping] Success response:', JSON.stringify(response));
    res.status(200).json(response);
  } catch (error) {
    // Catch-all: use fallback pricing so checkout never fails
    console.error('[Shipping] Unexpected error:', error);
    console.warn('[Shipping] Using fallback pricing due to unexpected error');
    const fallbackResponse = calculateFallbackPrice(data.country);
    res.status(200).json(fallbackResponse);
  }
}
