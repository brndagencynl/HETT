/**
 * Shipping Rules Configuration
 * ============================
 * 
 * Centralized shipping rules for HETT storefront:
 * 
 * 1. Veranda's:
 *    - Within 300km from Eindhoven: FREE
 *    - Beyond 300km: €299.99 flat rate
 * 
 * 2. Waddeneilanden: Blocked (no delivery)
 * 
 * 3. Accessories only: €29.99 flat rate
 * 
 * 4. Mixed cart (veranda + accessories): Veranda rules apply
 */

import type { CartItem } from '../../../types';
import { resolveProductType, type ProductType } from '../products/resolveProductType';

// =============================================================================
// CONSTANTS
// =============================================================================

/** Origin address for distance calculations */
export const SHIPPING_ORIGIN = 'Hoppenkuil 17, 5626DD Eindhoven, NL';

/** Distance threshold for free veranda shipping (in km) */
export const FREE_SHIPPING_RADIUS_KM = 300;

/** Fixed price for veranda beyond radius (in cents) */
export const VERANDA_BEYOND_RADIUS_CENTS = 29999; // €299.99

/** Fixed price for accessories-only orders (in cents) */
export const ACCESSORIES_SHIPPING_CENTS = 2999; // €29.99

/** Shopify product handle for shipping line item */
export const SHIPPING_LINE_HANDLE = 'bezorgkosten';

/** Cart line item ID for shipping */
export const SHIPPING_LINE_CART_ID = '__shipping_line__';

// =============================================================================
// WADDENEILANDEN BLOCKLIST
// =============================================================================

/**
 * Waddeneilanden postal code ranges (4-digit prefixes)
 * These are blocked from delivery.
 */
export const WADDENEILANDEN_POSTCODES: string[] = [
  '8881', '8882', '8883', '8884', '8885', // Terschelling
  '8891', '8892', '8893', '8894', '8895', '8896', '8897', '8898', '8899', // Vlieland  
  '8900', // Leeuwarden (some parts)
  '9161', '9162', '9163', '9164', '9165', '9166', // Schiermonnikoog
  '9101', '9102', '9103', '9104', '9105', '9106', '9107', '9108', '9109', // Dokkum area (not island but sometimes grouped)
  '9151', '9152', '9153', '9154', '9155', '9156', // Near coast
  '1791', '1792', '1793', '1794', '1795', '1796', '1797', // Texel
  '8861', '8862', '8863', // Harlingen ferry area
  '9166', // Schiermonnikoog
];

/**
 * Waddeneilanden place names (case-insensitive)
 */
export const WADDENEILANDEN_PLACES: string[] = [
  'texel',
  'vlieland',
  'terschelling',
  'ameland',
  'schiermonnikoog',
  // Specific villages
  'den burg',
  'de cocksdorp',
  'oosterend',
  'de koog',
  'west-terschelling',
  'midsland',
  'hoorn terschelling',
  'formerum',
  'lies',
  'hollum',
  'ballum',
  'nes ameland',
  'buren ameland',
];

// =============================================================================
// PRODUCT CLASSIFICATION
// =============================================================================

export type CartItemCategory = 'veranda' | 'accessoire';

/**
 * Classify a cart item as veranda or accessoire.
 * 
 * Classification rules (configurable):
 * 1. Check product type from category
 * 2. Check handle prefix
 * 3. Check tags
 * 4. Default to accessoire
 */
export function classifyCartItem(item: CartItem): CartItemCategory {
  // Shipping line items are not products
  if (item.id === SHIPPING_LINE_CART_ID || (item as any).isShippingLine) {
    return 'accessoire'; // Won't affect calculations
  }

  // LED spots are accessories
  if ((item as any).isLedLine) {
    return 'accessoire';
  }

  // Check category field
  if (item.category === 'verandas') {
    return 'veranda';
  }

  // Check type field
  if ((item as any).type === 'custom_veranda' || (item as any).type === 'maatwerk_veranda') {
    return 'veranda';
  }

  // Check handle/slug prefix
  const handle = (item.slug || item.handle || '').toLowerCase();
  if (
    handle.startsWith('veranda') ||
    handle.startsWith('standaard-veranda') ||
    handle.startsWith('maatwerk-veranda') ||
    handle.includes('overkapping')
  ) {
    return 'veranda';
  }

  // Check title
  const title = (item.title || '').toLowerCase();
  if (title.includes('veranda') || title.includes('overkapping')) {
    return 'veranda';
  }

  // Default to accessoire
  return 'accessoire';
}

/**
 * Classify all items in a cart.
 */
export function classifyCart(items: CartItem[]): {
  hasVeranda: boolean;
  hasAccessoires: boolean;
  verandaItems: CartItem[];
  accessoireItems: CartItem[];
} {
  const verandaItems: CartItem[] = [];
  const accessoireItems: CartItem[] = [];

  for (const item of items) {
    // Skip shipping/LED lines
    if (item.id === SHIPPING_LINE_CART_ID || (item as any).isShippingLine || (item as any).isLedLine) {
      continue;
    }

    const category = classifyCartItem(item);
    if (category === 'veranda') {
      verandaItems.push(item);
    } else {
      accessoireItems.push(item);
    }
  }

  return {
    hasVeranda: verandaItems.length > 0,
    hasAccessoires: accessoireItems.length > 0,
    verandaItems,
    accessoireItems,
  };
}

// =============================================================================
// WADDENEILANDEN CHECK
// =============================================================================

/**
 * Check if an address is in the Waddeneilanden (blocked for delivery).
 * 
 * @param postalCode - Dutch postal code (e.g., "1791AB" or "1791 AB")
 * @param city - City/place name
 * @returns true if delivery is blocked
 */
export function isWaddeneiland(postalCode: string, city?: string): boolean {
  // Normalize postal code: extract first 4 digits
  const normalizedPostal = (postalCode || '').replace(/\s/g, '').substring(0, 4);
  
  // Check postal code
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
// SHIPPING CALCULATION TYPES
// =============================================================================

export type ShippingType = 
  | 'free'           // Veranda within radius or NL (old rule)
  | 'veranda_flat'   // Veranda beyond radius: €299.99
  | 'accessories'    // Accessories only: €29.99
  | 'blocked';       // Waddeneilanden

export interface ShippingCalculationResult {
  type: ShippingType;
  costCents: number;
  costEur: number;
  distanceKm: number | null;
  description: string;
  blocked: boolean;
  blockReason?: string;
}

/**
 * Calculate shipping based on cart contents and distance.
 * 
 * @param hasVeranda - Cart contains at least one veranda
 * @param distanceKm - Distance to destination in km (null if not calculated)
 * @param isWaddeneiland - Destination is in Waddeneilanden
 */
export function calculateShippingCost(
  hasVeranda: boolean,
  distanceKm: number | null,
  isWaddeneilandDest: boolean
): ShippingCalculationResult {
  // 1. Waddeneilanden: blocked
  if (isWaddeneilandDest) {
    return {
      type: 'blocked',
      costCents: 0,
      costEur: 0,
      distanceKm,
      description: 'Bezorging niet mogelijk naar Waddeneilanden',
      blocked: true,
      blockReason: 'Wij bezorgen helaas niet naar de Waddeneilanden. Neem contact met ons op voor alternatieven.',
    };
  }

  // 2. Veranda in cart
  if (hasVeranda) {
    // Distance is required for veranda
    if (distanceKm === null) {
      // Can't calculate without distance - return blocked (will trigger distance fetch)
      return {
        type: 'free',
        costCents: 0,
        costEur: 0,
        distanceKm: null,
        description: 'Afstand wordt berekend...',
        blocked: false,
      };
    }

    if (distanceKm <= FREE_SHIPPING_RADIUS_KM) {
      return {
        type: 'free',
        costCents: 0,
        costEur: 0,
        distanceKm,
        description: `Gratis bezorging (${distanceKm.toFixed(0)} km, binnen ${FREE_SHIPPING_RADIUS_KM} km)`,
        blocked: false,
      };
    } else {
      return {
        type: 'veranda_flat',
        costCents: VERANDA_BEYOND_RADIUS_CENTS,
        costEur: VERANDA_BEYOND_RADIUS_CENTS / 100,
        distanceKm,
        description: `Bezorgkosten veranda (${distanceKm.toFixed(0)} km, buiten ${FREE_SHIPPING_RADIUS_KM} km radius)`,
        blocked: false,
      };
    }
  }

  // 3. Accessories only
  return {
    type: 'accessories',
    costCents: ACCESSORIES_SHIPPING_CENTS,
    costEur: ACCESSORIES_SHIPPING_CENTS / 100,
    distanceKm,
    description: 'Verzendkosten accessoires',
    blocked: false,
  };
}

// =============================================================================
// DISTANCE API HELPERS
// =============================================================================

export interface DistanceApiResult {
  ok: boolean;
  distanceKm: number;
  durationMinutes: number;
  error?: string;
}

/**
 * Fetch distance from Google Distance Matrix API.
 * Should be called from server-side API route.
 */
export async function fetchDistanceFromApi(
  destination: string,
  apiKey: string
): Promise<DistanceApiResult> {
  const params = new URLSearchParams({
    origins: SHIPPING_ORIGIN,
    destinations: destination,
    mode: 'driving',
    units: 'metric',
    key: apiKey,
  });

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;

  console.log('[Shipping] Fetching distance to:', destination);

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('[Shipping] Google API error:', data.status, data.error_message);
      return {
        ok: false,
        distanceKm: 0,
        durationMinutes: 0,
        error: data.error_message || 'Distance calculation failed',
      };
    }

    const element = data.rows?.[0]?.elements?.[0];
    if (!element || element.status !== 'OK') {
      console.error('[Shipping] Element error:', element?.status);
      return {
        ok: false,
        distanceKm: 0,
        durationMinutes: 0,
        error: 'Address not found',
      };
    }

    const distanceKm = (element.distance?.value || 0) / 1000;
    const durationMinutes = Math.round((element.duration?.value || 0) / 60);

    console.log('[Shipping] Distance calculated:', distanceKm, 'km');

    return {
      ok: true,
      distanceKm,
      durationMinutes,
    };
  } catch (error) {
    console.error('[Shipping] Fetch error:', error);
    return {
      ok: false,
      distanceKm: 0,
      durationMinutes: 0,
      error: 'Network error',
    };
  }
}
