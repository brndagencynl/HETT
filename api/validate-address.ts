/**
 * Vercel Serverless Function: Address Validation
 * ===============================================
 * 
 * Validates addresses using Google Address Validation API.
 * The API key is read from environment variables and never exposed to the client.
 * 
 * Endpoint: POST /api/validate-address
 * 
 * Request body:
 * {
 *   street: string,      // Street name + house number
 *   postalCode: string,  // Postal code
 *   city: string,        // City/locality
 *   country: 'NL' | 'BE' | 'DE'
 * }
 * 
 * Response:
 * {
 *   isValid: boolean,
 *   normalizedAddress: {
 *     street: string,
 *     postalCode: string,
 *     city: string,
 *     country: string
 *   } | null,
 *   countryCode: string | null,
 *   postalCode: string | null,
 *   locality: string | null,
 *   administrativeArea: string | null,
 *   messages: string[]
 * }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// =============================================================================
// TYPES
// =============================================================================

interface AddressValidationRequest {
  street: string;
  postalCode: string;
  city: string;
  country: 'NL' | 'BE' | 'DE';
}

interface AddressValidationResponse {
  isValid: boolean;
  normalizedAddress: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  } | null;
  countryCode: string | null;
  postalCode: string | null;
  locality: string | null;
  administrativeArea: string | null;
  messages: string[];
}

interface GoogleAddressComponent {
  componentName: {
    text: string;
    languageCode?: string;
  };
  componentType: string;
  confirmationLevel: string;
}

interface GoogleAddressValidationResponse {
  result: {
    verdict: {
      inputGranularity: string;
      validationGranularity: string;
      geocodeGranularity: string;
      addressComplete: boolean;
      hasUnconfirmedComponents: boolean;
      hasInferredComponents: boolean;
      hasReplacedComponents: boolean;
    };
    address: {
      formattedAddress: string;
      postalAddress: {
        regionCode: string;
        languageCode: string;
        postalCode: string;
        administrativeArea: string;
        locality: string;
        addressLines: string[];
      };
      addressComponents: GoogleAddressComponent[];
      missingComponentTypes?: string[];
      unconfirmedComponentTypes?: string[];
      unresolvedTokens?: string[];
    };
    geocode?: {
      location: {
        latitude: number;
        longitude: number;
      };
    };
  };
  responseId: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const GOOGLE_API_URL = 'https://addressvalidation.googleapis.com/v1:validateAddress';

const COUNTRY_NAMES: Record<string, string> = {
  NL: 'Nederland',
  BE: 'België',
  DE: 'Duitsland',
};

// =============================================================================
// HANDLER
// =============================================================================

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Get API key from environment
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.error('GOOGLE_MAPS_API_KEY is not configured');
    res.status(500).json({ 
      isValid: false,
      normalizedAddress: null,
      countryCode: null,
      postalCode: null,
      locality: null,
      administrativeArea: null,
      messages: ['Adresvalidatie is tijdelijk niet beschikbaar.']
    });
    return;
  }

  // Parse request body
  const { street, postalCode, city, country } = req.body as AddressValidationRequest;

  // Validate required fields
  if (!street || !postalCode || !city || !country) {
    res.status(400).json({
      isValid: false,
      normalizedAddress: null,
      countryCode: null,
      postalCode: null,
      locality: null,
      administrativeArea: null,
      messages: ['Vul alle adresvelden in.']
    });
    return;
  }

  // Validate country code
  if (!['NL', 'BE', 'DE'].includes(country)) {
    res.status(400).json({
      isValid: false,
      normalizedAddress: null,
      countryCode: null,
      postalCode: null,
      locality: null,
      administrativeArea: null,
      messages: ['Ongeldig land. Alleen NL, BE en DE worden ondersteund.']
    });
    return;
  }

  try {
    // Build address lines for Google API
    const addressLines = [
      street,
      `${postalCode} ${city}`,
    ];

    // Call Google Address Validation API
    const googleResponse = await fetch(`${GOOGLE_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: {
          regionCode: country,
          addressLines: addressLines,
        },
        enableUspsCass: false, // Not needed for European addresses
      }),
    });

    if (!googleResponse.ok) {
      const errorText = await googleResponse.text();
      console.error('Google API error:', googleResponse.status, errorText);
      
      res.status(200).json({
        isValid: false,
        normalizedAddress: null,
        countryCode: null,
        postalCode: null,
        locality: null,
        administrativeArea: null,
        messages: ['Adresvalidatie mislukt. Probeer het opnieuw.']
      });
      return;
    }

    const data: GoogleAddressValidationResponse = await googleResponse.json();
    
    // Parse the response
    const response = parseGoogleResponse(data, country);
    
    res.status(200).json(response);

  } catch (error) {
    console.error('Address validation error:', error);
    
    res.status(200).json({
      isValid: false,
      normalizedAddress: null,
      countryCode: null,
      postalCode: null,
      locality: null,
      administrativeArea: null,
      messages: ['Er is een fout opgetreden bij het valideren van het adres.']
    });
  }
}

// =============================================================================
// HELPERS
// =============================================================================

function parseGoogleResponse(
  data: GoogleAddressValidationResponse,
  requestedCountry: string
): AddressValidationResponse {
  const messages: string[] = [];
  const result = data.result;
  const verdict = result.verdict;
  const address = result.address;
  const postalAddress = address?.postalAddress;

  // Check for missing components
  if (address?.missingComponentTypes?.length) {
    const missing = address.missingComponentTypes;
    if (missing.includes('street_number')) {
      messages.push('Huisnummer ontbreekt.');
    }
    if (missing.includes('route')) {
      messages.push('Straatnaam ontbreekt.');
    }
    if (missing.includes('postal_code')) {
      messages.push('Postcode ontbreekt.');
    }
    if (missing.includes('locality')) {
      messages.push('Plaatsnaam ontbreekt.');
    }
  }

  // Check for unconfirmed components
  if (address?.unconfirmedComponentTypes?.length) {
    const unconfirmed = address.unconfirmedComponentTypes;
    if (unconfirmed.includes('postal_code')) {
      messages.push('Postcode kon niet worden geverifieerd.');
    }
    if (unconfirmed.includes('route')) {
      messages.push('Straatnaam kon niet worden geverifieerd.');
    }
    if (unconfirmed.includes('street_number')) {
      messages.push('Huisnummer kon niet worden geverifieerd.');
    }
  }

  // Check for unresolved tokens (parts that couldn't be matched)
  if (address?.unresolvedTokens?.length) {
    messages.push(`Niet herkend: "${address.unresolvedTokens.join(', ')}"`);
  }

  // Determine validity based on verdict
  // We use strict validation: address must be complete and have no unconfirmed components
  const isComplete = verdict?.addressComplete === true;
  const hasUnconfirmed = verdict?.hasUnconfirmedComponents === true;
  const hasInferred = verdict?.hasInferredComponents === true;
  
  // Check if country matches
  const returnedCountry = postalAddress?.regionCode;
  const countryMatches = returnedCountry === requestedCountry;
  
  if (!countryMatches && returnedCountry) {
    messages.push(`Adres lijkt in ${COUNTRY_NAMES[returnedCountry] || returnedCountry} te liggen, niet in ${COUNTRY_NAMES[requestedCountry]}.`);
  }

  // Strict validation: must be complete, no unconfirmed, and country must match
  const isValid = isComplete && !hasUnconfirmed && countryMatches;

  // If not valid but no specific messages, add a generic one
  if (!isValid && messages.length === 0) {
    if (!isComplete) {
      messages.push('Adres is onvolledig.');
    } else if (hasUnconfirmed) {
      messages.push('Adres kon niet volledig worden geverifieerd.');
    }
  }

  // Extract normalized address components
  let normalizedStreet = '';
  let normalizedPostalCode = postalAddress?.postalCode || '';
  let normalizedCity = postalAddress?.locality || '';
  
  // Build street from address lines or components
  if (postalAddress?.addressLines?.length) {
    normalizedStreet = postalAddress.addressLines[0] || '';
  }

  // Try to get more specific components
  if (address?.addressComponents) {
    for (const comp of address.addressComponents) {
      const type = comp.componentType;
      const text = comp.componentName?.text || '';
      
      if (type === 'postal_code' && text) {
        normalizedPostalCode = text;
      }
      if (type === 'locality' && text) {
        normalizedCity = text;
      }
    }
  }

  return {
    isValid,
    normalizedAddress: isValid ? {
      street: normalizedStreet,
      postalCode: normalizedPostalCode,
      city: normalizedCity,
      country: returnedCountry || requestedCountry,
    } : null,
    countryCode: returnedCountry || null,
    postalCode: normalizedPostalCode || null,
    locality: normalizedCity || null,
    administrativeArea: postalAddress?.administrativeArea || null,
    messages: messages.length > 0 ? messages : (isValid ? ['Adres is geldig.'] : ['Adres kon niet worden gevalideerd.']),
  };
}
