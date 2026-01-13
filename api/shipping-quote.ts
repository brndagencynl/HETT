/**
 * Vercel Serverless Function: Shipping Quote (v2)
 * ================================================
 * 
 * New shipping rules:
 * 
 * 1. **Pickup**: Free (€0)
 * 
 * 2. **Veranda orders**:
 *    - Within 300km from Eindhoven: FREE
 *    - Beyond 300km: €299.99 flat rate
 * 
 * 3. **Accessories-only orders**: €29.99 flat rate (no distance calculation)
 * 
 * 4. **Waddeneilanden**: Blocked (no delivery)
 * 
 * 5. **Mixed orders (veranda + accessories)**: Veranda rules apply
 * 
 * Endpoint: POST /api/shipping-quote
 * 
 * Request body:
 * {
 *   mode: 'pickup' | 'delivery',
 *   country: 'NL' | 'BE' | 'DE',
 *   postalCode: string,
 *   houseNumber?: string,
 *   street?: string,
 *   city: string,
 *   hasVeranda: boolean  // NEW: Whether cart contains veranda products
 * }
 * 
 * Response (success):
 * {
 *   ok: true,
 *   type: 'free' | 'veranda_flat' | 'accessories' | 'pickup',
 *   km: number | null,
 *   priceCents: number,
 *   priceEur: number,
 *   formattedPrice: string,
 *   description: string,
 *   origin: string,
 *   destination: string
 * }
 * 
 * Response (blocked):
 * {
 *   ok: false,
 *   blocked: true,
 *   code: 'WADDENEILANDEN',
 *   message: string
 * }
 * 
 * Response (error):
 * {
 *   ok: false,
 *   blocked: false,
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
type ShippingType = 'free' | 'veranda_flat' | 'accessories' | 'pickup';

interface ShippingQuoteRequest {
  mode: ShippingMode;
  country: CountryCode;
  postalCode: string;
  houseNumber: string;
  street: string;
  city: string;
  hasVeranda: boolean;
}

interface ShippingQuoteSuccess {
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

interface ShippingQuoteBlocked {
  ok: false;
  blocked: true;
  code: 'WADDENEILANDEN';
  message: string;
}

interface ShippingQuoteError {
  ok: false;
  blocked: false;
  code: 'INVALID_ADDRESS' | 'GOOGLE_ERROR' | 'MISSING_FIELDS' | 'CONFIG_ERROR';
  message: string;
}

type ShippingQuoteResponse = ShippingQuoteSuccess | ShippingQuoteBlocked | ShippingQuoteError;

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
const MAX_INPUT_LENGTH = 200;

// Shipping rule constants
const FREE_SHIPPING_RADIUS_KM = 300;
const VERANDA_BEYOND_RADIUS_CENTS = 29999; // €299.99
const ACCESSORIES_SHIPPING_CENTS = 2999;   // €29.99

// ISO 3166-1 alpha-2 codes for address formatting
const COUNTRY_ISO_CODES: Record<CountryCode, string> = {
  NL: 'NL',
  BE: 'BE',
  DE: 'DE',
};

// =============================================================================
// WADDENEILANDEN BLOCKLIST
// =============================================================================

const WADDENEILANDEN_POSTCODES: string[] = [
  // Texel
  '1791', '1792', '1793', '1794', '1795', '1796', '1797',
  // Vlieland
  '8891', '8892', '8893', '8894', '8895', '8896', '8897', '8898', '8899',
  // Terschelling
  '8881', '8882', '8883', '8884', '8885',
  // Ameland (9160-9164 range)
  '9160', '9161', '9162', '9163', '9164',
  // Schiermonnikoog
  '9166',
];

const WADDENEILANDEN_PLACES: string[] = [
  'texel', 'vlieland', 'terschelling', 'ameland', 'schiermonnikoog',
  'den burg', 'de cocksdorp', 'oosterend', 'de koog',
  'west-terschelling', 'midsland', 'hoorn', 'formerum', 'lies',
  'hollum', 'ballum', 'nes', 'buren',
];

function isWaddeneiland(postalCode: string, city?: string): boolean {
  // Check postal code (first 4 digits)
  const normalizedPostal = (postalCode || '').replace(/\s/g, '').substring(0, 4);
  if (WADDENEILANDEN_POSTCODES.includes(normalizedPostal)) {
    return true;
  }

  // Check city name
  if (city) {
    const normalizedCity = city.toLowerCase().trim();
    for (const place of WADDENEILANDEN_PLACES) {
      if (normalizedCity.includes(place) || place.includes(normalizedCity)) {
        return true;
      }
    }
  }

  return false;
}

// =============================================================================
// HELPERS
// =============================================================================

function sanitize(input: unknown, maxLen = MAX_INPUT_LENGTH): string {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>{}[\]\\]/g, '').slice(0, maxLen);
}

function formatPrice(cents: number): string {
  const eur = cents / 100;
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(eur);
}

function validateRequest(body: unknown): 
  | { valid: true; data: ShippingQuoteRequest }
  | { valid: false; error: ShippingQuoteError } {
  
  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      error: { ok: false, blocked: false, code: 'MISSING_FIELDS', message: 'Request body is required' },
    };
  }

  const { mode, country, postalCode, houseNumber, street, city, hasVeranda } = body as Record<string, unknown>;

  // Validate mode
  const cleanMode = sanitize(mode) as ShippingMode;
  if (!VALID_MODES.includes(cleanMode)) {
    return {
      valid: false,
      error: { ok: false, blocked: false, code: 'MISSING_FIELDS', message: `mode must be one of: ${VALID_MODES.join(', ')}` },
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
        hasVeranda: Boolean(hasVeranda),
      },
    };
  }

  // For delivery, validate all fields
  const cleanCountry = sanitize(country).toUpperCase() as CountryCode;
  if (!VALID_COUNTRIES.includes(cleanCountry)) {
    return {
      valid: false,
      error: { ok: false, blocked: false, code: 'MISSING_FIELDS', message: `country must be one of: ${VALID_COUNTRIES.join(', ')}` },
    };
  }

  const cleanPostalCode = sanitize(postalCode, 20);
  const cleanHouseNumber = sanitize(houseNumber, 20);
  const cleanStreet = sanitize(street, 100);
  const cleanCity = sanitize(city, 100);

  if (!cleanPostalCode || !cleanCity) {
    return {
      valid: false,
      error: { ok: false, blocked: false, code: 'MISSING_FIELDS', message: 'postalCode and city are required for delivery' },
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
      hasVeranda: Boolean(hasVeranda),
    },
  };
}

function buildDestination(data: ShippingQuoteRequest): string {
  const isoCode = COUNTRY_ISO_CODES[data.country];
  const parts: string[] = [];

  if (data.street) {
    if (data.houseNumber) {
      parts.push(`${data.street} ${data.houseNumber}`);
    } else {
      parts.push(data.street);
    }
  }

  parts.push(`${data.postalCode} ${data.city}`);
  parts.push(isoCode);

  return parts.join(', ');
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
  
  console.log('[Shipping] Fetching distance to:', destination);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Google API HTTP error: ${response.status}`);
  }

  return response.json();
}

// =============================================================================
// SHIPPING CALCULATION
// =============================================================================

function calculateShipping(
  hasVeranda: boolean,
  distanceKm: number | null
): { type: ShippingType; priceCents: number; description: string } {
  // Veranda in cart
  if (hasVeranda) {
    if (distanceKm === null) {
      // Can't calculate yet - default to free (will trigger distance fetch)
      return {
        type: 'free',
        priceCents: 0,
        description: 'Bezorgkosten worden berekend...',
      };
    }

    if (distanceKm <= FREE_SHIPPING_RADIUS_KM) {
      return {
        type: 'free',
        priceCents: 0,
        description: `Gratis bezorging (${distanceKm.toFixed(0)} km)`,
      };
    } else {
      return {
        type: 'veranda_flat',
        priceCents: VERANDA_BEYOND_RADIUS_CENTS,
        description: `Bezorgkosten veranda (${distanceKm.toFixed(0)} km)`,
      };
    }
  }

  // Accessories only
  return {
    type: 'accessories',
    priceCents: ACCESSORIES_SHIPPING_CENTS,
    description: 'Verzendkosten accessoires',
  };
}

// =============================================================================
// HANDLER
// =============================================================================

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, blocked: false, code: 'MISSING_FIELDS', message: 'Method not allowed. Use POST.' });
    return;
  }

  console.log('[Shipping] Request payload:', JSON.stringify(req.body));

  // Validate request
  const validation = validateRequest(req.body);
  if (validation.valid === false) {
    console.log('[Shipping] Validation error:', validation.error);
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
      type: 'pickup',
      km: 0,
      priceCents: 0,
      priceEur: 0,
      formattedPrice: formatPrice(0),
      description: 'Gratis afhalen in Eindhoven',
      origin: ORIGIN_ADDRESS,
      destination: 'Afhalen in Eindhoven',
    };
    console.log('[Shipping] Response (pickup):', JSON.stringify(response));
    res.status(200).json(response);
    return;
  }

  // ==========================================================================
  // WADDENEILANDEN CHECK - Block delivery
  // ==========================================================================
  if (data.country === 'NL' && isWaddeneiland(data.postalCode, data.city)) {
    const blockedResponse: ShippingQuoteBlocked = {
      ok: false,
      blocked: true,
      code: 'WADDENEILANDEN',
      message: 'Wij bezorgen helaas niet naar de Waddeneilanden. Neem contact met ons op voor alternatieven.',
    };
    console.log('[Shipping] Response (blocked - Waddeneilanden):', JSON.stringify(blockedResponse));
    res.status(200).json(blockedResponse); // 200 so it's not treated as error
    return;
  }

  // ==========================================================================
  // ACCESSORIES ONLY - Fixed price, no distance calculation needed
  // ==========================================================================
  if (!data.hasVeranda) {
    const shipping = calculateShipping(false, null);
    const response: ShippingQuoteSuccess = {
      ok: true,
      type: shipping.type,
      km: null, // No distance calculation for accessories
      priceCents: shipping.priceCents,
      priceEur: shipping.priceCents / 100,
      formattedPrice: formatPrice(shipping.priceCents),
      description: shipping.description,
      origin: ORIGIN_ADDRESS,
      destination: buildDestination(data),
    };
    console.log('[Shipping] Response (accessories only):', JSON.stringify(response));
    res.status(200).json(response);
    return;
  }

  // ==========================================================================
  // VERANDA IN CART - Calculate distance
  // ==========================================================================
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    // No API key - use fallback (assume within radius for NL, beyond for BE/DE)
    console.error('[Shipping] GOOGLE_MAPS_API_KEY not configured');
    const fallbackKm = data.country === 'NL' ? 100 : 400; // Assume NL is within radius
    const shipping = calculateShipping(true, fallbackKm);
    const response: ShippingQuoteSuccess = {
      ok: true,
      type: shipping.type,
      km: fallbackKm,
      priceCents: shipping.priceCents,
      priceEur: shipping.priceCents / 100,
      formattedPrice: formatPrice(shipping.priceCents),
      description: `${shipping.description} (geschat)`,
      origin: ORIGIN_ADDRESS,
      destination: buildDestination(data),
    };
    res.status(200).json(response);
    return;
  }

  const destination = buildDestination(data);
  console.log('[Shipping] Calculating distance from:', ORIGIN_ADDRESS);
  console.log('[Shipping] Calculating distance to:', destination);

  try {
    const googleResponse = await fetchGoogleDistance(ORIGIN_ADDRESS, destination, apiKey);
    
    console.log('[Shipping] Google API status:', googleResponse.status);

    if (googleResponse.status !== 'OK') {
      console.error('[Shipping] Google API error:', googleResponse.status, googleResponse.error_message);
      // Fallback to flat rate
      const fallbackKm = data.country === 'NL' ? 100 : 400;
      const shipping = calculateShipping(true, fallbackKm);
      const response: ShippingQuoteSuccess = {
        ok: true,
        type: shipping.type,
        km: fallbackKm,
        priceCents: shipping.priceCents,
        priceEur: shipping.priceCents / 100,
        formattedPrice: formatPrice(shipping.priceCents),
        description: `${shipping.description} (geschat)`,
        origin: ORIGIN_ADDRESS,
        destination,
      };
      res.status(200).json(response);
      return;
    }

    const element = googleResponse.rows?.[0]?.elements?.[0];
    
    if (!element || element.status !== 'OK') {
      console.error('[Shipping] Element error:', element?.status);
      // Fallback
      const fallbackKm = data.country === 'NL' ? 100 : 400;
      const shipping = calculateShipping(true, fallbackKm);
      const response: ShippingQuoteSuccess = {
        ok: true,
        type: shipping.type,
        km: fallbackKm,
        priceCents: shipping.priceCents,
        priceEur: shipping.priceCents / 100,
        formattedPrice: formatPrice(shipping.priceCents),
        description: `${shipping.description} (geschat)`,
        origin: ORIGIN_ADDRESS,
        destination,
      };
      res.status(200).json(response);
      return;
    }

    // Calculate distance and shipping
    const distanceKm = Math.round((element.distance?.value || 0) / 1000);
    const shipping = calculateShipping(true, distanceKm);

    console.log('[Shipping] Distance:', distanceKm, 'km | Type:', shipping.type, '| Price:', shipping.priceCents / 100, 'EUR');

    const response: ShippingQuoteSuccess = {
      ok: true,
      type: shipping.type,
      km: distanceKm,
      priceCents: shipping.priceCents,
      priceEur: shipping.priceCents / 100,
      formattedPrice: formatPrice(shipping.priceCents),
      description: shipping.description,
      origin: googleResponse.origin_addresses?.[0] || ORIGIN_ADDRESS,
      destination: googleResponse.destination_addresses?.[0] || destination,
      durationText: element.duration?.text,
    };

    console.log('[Shipping] Success response:', JSON.stringify(response));
    res.status(200).json(response);
  } catch (error) {
    // Catch-all: use fallback
    console.error('[Shipping] Unexpected error:', error);
    const fallbackKm = data.country === 'NL' ? 100 : 400;
    const shipping = calculateShipping(true, fallbackKm);
    const response: ShippingQuoteSuccess = {
      ok: true,
      type: shipping.type,
      km: fallbackKm,
      priceCents: shipping.priceCents,
      priceEur: shipping.priceCents / 100,
      formattedPrice: formatPrice(shipping.priceCents),
      description: `${shipping.description} (geschat)`,
      origin: ORIGIN_ADDRESS,
      destination: buildDestination(data),
    };
    res.status(200).json(response);
  }
}
