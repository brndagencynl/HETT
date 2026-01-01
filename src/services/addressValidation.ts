/**
 * Address Validation Service
 * ==========================
 * 
 * Client-side service for validating addresses via the Vercel serverless API.
 * This service communicates with /api/validate-address which calls Google Address Validation API.
 */

import { formatEUR, toCents } from '../utils/money';

// =============================================================================
// TYPES
// =============================================================================

export type CountryCode = 'NL' | 'BE' | 'DE';

export interface AddressInput {
  street: string;
  postalCode: string;
  city: string;
  country: CountryCode;
}

export interface NormalizedAddress {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface AddressValidationResult {
  isValid: boolean;
  normalizedAddress: NormalizedAddress | null;
  countryCode: CountryCode | null;
  postalCode: string | null;
  locality: string | null;
  administrativeArea: string | null;
  messages: string[];
}

export type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';

// =============================================================================
// CONSTANTS
// =============================================================================

export const SUPPORTED_COUNTRIES: { code: CountryCode; label: string }[] = [
  { code: 'NL', label: 'Nederland' },
  { code: 'BE', label: 'België' },
  { code: 'DE', label: 'Duitsland' },
];

export const COUNTRY_LABELS: Record<CountryCode, string> = {
  NL: 'Nederland',
  BE: 'België',
  DE: 'Duitsland',
};

/** Delivery fees per country (in euros) */
export const DELIVERY_FEES: Record<CountryCode, number> = {
  NL: 0,
  BE: 99,
  DE: 199,
};

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Validate an address using the serverless API endpoint.
 * 
 * @param address - The address to validate
 * @returns Validation result with normalized address and messages
 */
export async function validateAddress(address: AddressInput): Promise<AddressValidationResult> {
  try {
    const response = await fetch('/api/validate-address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(address),
    });

    if (!response.ok) {
      // Handle non-2xx responses
      const errorData = await response.json().catch(() => ({}));
      return {
        isValid: false,
        normalizedAddress: null,
        countryCode: null,
        postalCode: null,
        locality: null,
        administrativeArea: null,
        messages: [errorData.message || 'Adresvalidatie mislukt. Probeer het opnieuw.'],
      };
    }

    const result: AddressValidationResult = await response.json();
    return result;
  } catch (error) {
    console.error('Address validation error:', error);
    return {
      isValid: false,
      normalizedAddress: null,
      countryCode: null,
      postalCode: null,
      locality: null,
      administrativeArea: null,
      messages: ['Kan geen verbinding maken met de server. Controleer uw internetverbinding.'],
    };
  }
}

// =============================================================================
// SHIPPING COST FUNCTIONS
// =============================================================================

/**
 * Get the shipping cost for a validated country.
 * 
 * @param country - The validated country code
 * @returns Shipping cost in euros
 */
export function getShippingCost(country: CountryCode | null): number {
  if (!country) return 0;
  return DELIVERY_FEES[country] ?? 0;
}

/**
 * Format shipping cost for display.
 * 
 * @param cost - Cost in euros
 * @returns Formatted string (e.g., "Gratis" or "€99")
 */
export function formatShippingCost(cost: number): string {
  return cost === 0 ? 'Gratis' : formatEUR(toCents(cost), 'cents');
}

/**
 * Check if delivery is available for a country.
 * Currently only NL, BE, DE are supported.
 * 
 * @param country - Country code to check
 * @returns Whether delivery is available
 */
export function isDeliveryAvailable(country: string | null): boolean {
  if (!country) return false;
  return ['NL', 'BE', 'DE'].includes(country);
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Check if all required address fields are filled.
 * 
 * @param address - Address input to check
 * @returns Whether all fields have values
 */
export function isAddressComplete(address: Partial<AddressInput>): boolean {
  return !!(
    address.street?.trim() &&
    address.postalCode?.trim() &&
    address.city?.trim() &&
    address.country
  );
}

/**
 * Get summary string for a validated address.
 * 
 * @param address - Normalized address
 * @returns Human-readable summary
 */
export function getAddressSummary(address: NormalizedAddress | null): string {
  if (!address) return '';
  
  const countryLabel = COUNTRY_LABELS[address.country as CountryCode] || address.country;
  return `${address.street}, ${address.postalCode} ${address.city}, ${countryLabel}`;
}
