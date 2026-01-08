/**
 * Vercel Serverless Function: Distance Calculation
 * =================================================
 * 
 * Calculates driving distance from origin (Eindhoven warehouse) to destination
 * using Google Distance Matrix API.
 * 
 * The API key is read from environment variables and never exposed to the client.
 * 
 * Endpoint: POST /api/distance
 * 
 * Request body:
 * {
 *   country: 'NL' | 'BE' | 'DE',
 *   postalCode: string,
 *   street?: string,    // optional
 *   city?: string       // optional
 * }
 * 
 * Response:
 * {
 *   origin: string,
 *   destination: string,
 *   distanceMeters: number,
 *   distanceKm: number,
 *   durationText: string
 * }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// =============================================================================
// TYPES
// =============================================================================

interface DistanceRequest {
  country: 'NL' | 'BE' | 'DE';
  postalCode: string;
  street?: string;
  city?: string;
}

interface DistanceResponse {
  origin: string;
  destination: string;
  distanceMeters: number;
  distanceKm: number;
  durationText: string;
}

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

const ORIGIN_ADDRESS = 'Hoppenkuil 17, 5626DD Eindhoven, Netherlands';
const VALID_COUNTRIES = ['NL', 'BE', 'DE'];
const MAX_INPUT_LENGTH = 200;

// Country name mapping for better geocoding results
const COUNTRY_NAMES: Record<string, string> = {
  NL: 'Netherlands',
  BE: 'Belgium',
  DE: 'Germany',
};

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

function sanitizeInput(input: string | undefined, maxLength: number = MAX_INPUT_LENGTH): string {
  if (!input) return '';
  // Trim, remove dangerous characters, limit length
  return input
    .trim()
    .replace(/[<>{}[\]\\]/g, '')
    .slice(0, maxLength);
}

function validateRequest(body: unknown): { valid: true; data: DistanceRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required' };
  }

  const { country, postalCode, street, city } = body as Record<string, unknown>;

  // Validate country
  if (!country || typeof country !== 'string') {
    return { valid: false, error: 'country is required' };
  }
  const upperCountry = country.toUpperCase();
  if (!VALID_COUNTRIES.includes(upperCountry)) {
    return { valid: false, error: `Invalid country. Must be one of: ${VALID_COUNTRIES.join(', ')}` };
  }

  // Validate postalCode
  if (!postalCode || typeof postalCode !== 'string' || !postalCode.trim()) {
    return { valid: false, error: 'postalCode is required and must be non-empty' };
  }

  // Sanitize all inputs
  const sanitizedPostalCode = sanitizeInput(postalCode, 20);
  const sanitizedStreet = sanitizeInput(street as string | undefined, 100);
  const sanitizedCity = sanitizeInput(city as string | undefined, 100);

  if (!sanitizedPostalCode) {
    return { valid: false, error: 'postalCode must contain valid characters' };
  }

  return {
    valid: true,
    data: {
      country: upperCountry as 'NL' | 'BE' | 'DE',
      postalCode: sanitizedPostalCode,
      street: sanitizedStreet || undefined,
      city: sanitizedCity || undefined,
    },
  };
}

// =============================================================================
// DESTINATION BUILDER
// =============================================================================

function buildDestinationString(data: DistanceRequest): string {
  const countryName = COUNTRY_NAMES[data.country] || data.country;
  
  // If street and city are provided, use full address
  if (data.street && data.city) {
    return `${data.street}, ${data.postalCode} ${data.city}, ${countryName}`;
  }
  
  // If only city is provided
  if (data.city) {
    return `${data.postalCode} ${data.city}, ${countryName}`;
  }
  
  // Minimal: just postal code and country
  return `${data.postalCode}, ${countryName}`;
}

// =============================================================================
// GOOGLE DISTANCE MATRIX API
// =============================================================================

async function fetchDistanceFromGoogle(
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
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Google API HTTP error: ${response.status}`);
  }

  return response.json();
}

// =============================================================================
// HANDLER
// =============================================================================

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Runtime logging for API key presence
  console.log('[Distance API] env key present', Boolean(process.env.GOOGLE_MAPS_API_KEY));
  
  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  // Check API key
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('[Distance API] GOOGLE_MAPS_API_KEY not configured in environment');
    res.status(500).json({ error: 'Afstandsberekening niet beschikbaar. Neem contact op met de klantenservice.' });
    return;
  }

  // Validate request
  const validation = validateRequest(req.body);
  if (validation.valid === false) {
    console.log('[Distance API] Validation failed:', validation.error);
    res.status(422).json({ error: validation.error });
    return;
  }

  const { data } = validation;
  console.log('[Distance API] Request received:', { country: data.country, postalCode: data.postalCode });

  // Build destination string
  const destination = buildDestinationString(data);
  console.log('[Distance API] Destination:', destination);

  try {
    // Call Google Distance Matrix API
    const googleResponse = await fetchDistanceFromGoogle(ORIGIN_ADDRESS, destination, apiKey);
    
    console.log('[Distance API] Google API status:', googleResponse.status);

    // Check top-level status
    if (googleResponse.status !== 'OK') {
      console.error('[Distance API] Google API error:', googleResponse.status, googleResponse.error_message);
      res.status(400).json({
        error: `Distance calculation failed: ${googleResponse.error_message || googleResponse.status}`,
      });
      return;
    }

    // Check element status
    const element = googleResponse.rows?.[0]?.elements?.[0];
    if (!element || element.status !== 'OK') {
      const elementStatus = element?.status || 'UNKNOWN';
      console.error('[Distance API] Element status not OK:', elementStatus);
      
      let errorMessage = 'Kon geen route berekenen naar dit adres.';
      if (elementStatus === 'NOT_FOUND') {
        errorMessage = 'Adres niet gevonden. Controleer de postcode en probeer opnieuw.';
      } else if (elementStatus === 'ZERO_RESULTS') {
        errorMessage = 'Geen route gevonden naar dit adres.';
      }
      
      res.status(400).json({ error: errorMessage });
      return;
    }

    // Extract distance and duration
    const distanceMeters = element.distance?.value ?? 0;
    const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10; // Round to 1 decimal
    const durationText = element.duration?.text ?? '';

    console.log('[Distance API] distanceMeters:', distanceMeters);

    const response: DistanceResponse = {
      origin: googleResponse.origin_addresses?.[0] || ORIGIN_ADDRESS,
      destination: googleResponse.destination_addresses?.[0] || destination,
      distanceMeters,
      distanceKm,
      durationText,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('[Distance API] Error:', error);
    res.status(500).json({
      error: 'Er is een fout opgetreden bij het berekenen van de afstand. Probeer het later opnieuw.',
    });
  }
}
