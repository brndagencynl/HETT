/**
 * Distance Client
 * ================
 * 
 * Frontend service to call the /api/distance serverless endpoint.
 * This keeps the Google Maps API key on the server side.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface DistanceRequest {
  country: 'NL' | 'BE' | 'DE';
  postalCode: string;
  street?: string;
  city?: string;
}

export interface DistanceResponse {
  origin: string;
  destination: string;
  distanceMeters: number;
  distanceKm: number;
  durationText: string;
}

export interface DistanceError {
  error: string;
}

export type DistanceResult = 
  | { success: true; data: DistanceResponse }
  | { success: false; error: string };

// =============================================================================
// FETCH DISTANCE
// =============================================================================

/**
 * Fetches the driving distance from the warehouse (Eindhoven) to the given address.
 * 
 * @param request - The destination address details
 * @returns Promise with distance data or error
 * 
 * @example
 * const result = await fetchDistance({
 *   country: 'BE',
 *   postalCode: '2000',
 *   city: 'Antwerpen'
 * });
 * 
 * if (result.success) {
 *   console.log(`Distance: ${result.data.distanceKm} km`);
 * } else {
 *   console.error(result.error);
 * }
 */
export async function fetchDistance(request: DistanceRequest): Promise<DistanceResult> {
  try {
    const response = await fetch('/api/distance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      // Server returned an error status
      const errorMessage = (data as DistanceError).error || `HTTP error ${response.status}`;
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Success
    return {
      success: true,
      data: data as DistanceResponse,
    };
  } catch (error) {
    // Network or parsing error
    console.error('[distanceClient] fetchDistance error:', error);
    return {
      success: false,
      error: 'Kon geen verbinding maken met de server. Controleer je internetverbinding.',
    };
  }
}

// =============================================================================
// HELPER: Extract postal code from address string
// =============================================================================

/**
 * Attempts to extract a postal code from an address string.
 * Supports Dutch, Belgian, and German postal code formats.
 * 
 * @param address - Full address string
 * @returns Extracted postal code or undefined
 */
export function extractPostalCode(address: string): string | undefined {
  // Dutch: 4 digits + 2 letters (e.g., "1234 AB" or "1234AB")
  const dutchMatch = address.match(/\b(\d{4}\s?[A-Z]{2})\b/i);
  if (dutchMatch) {
    return dutchMatch[1].replace(/\s/g, '').toUpperCase();
  }

  // Belgian/German: 4-5 digits (e.g., "2000" or "10115")
  const numericMatch = address.match(/\b(\d{4,5})\b/);
  if (numericMatch) {
    return numericMatch[1];
  }

  return undefined;
}

// =============================================================================
// HELPER: Detect country from postal code format
// =============================================================================

/**
 * Attempts to detect the country from a postal code format.
 * 
 * @param postalCode - The postal code
 * @returns Detected country code or undefined
 */
export function detectCountryFromPostalCode(postalCode: string): 'NL' | 'BE' | 'DE' | undefined {
  const cleaned = postalCode.replace(/\s/g, '').toUpperCase();

  // Dutch: 4 digits + 2 letters
  if (/^\d{4}[A-Z]{2}$/.test(cleaned)) {
    return 'NL';
  }

  // German: 5 digits (starts with 0-9)
  if (/^\d{5}$/.test(cleaned)) {
    return 'DE';
  }

  // Belgian: 4 digits (starts with 1-9)
  if (/^[1-9]\d{3}$/.test(cleaned)) {
    return 'BE';
  }

  return undefined;
}
