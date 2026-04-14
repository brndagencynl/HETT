/**
 * Glazen Schuifwanden — Shopify Extras Fetcher
 * ==============================================
 *
 * Fetches accessory products from the Shopify "Accessoires" collection
 * and maps them to configurator ExtraOption items by handle.
 *
 * Special case: funderingskoker uses a rail-based price override.
 */

import { getCollectionProducts } from './products';
import type { Product } from '../../../types';
import type { ExtraOption, RailType } from '../../config/schuifwandConfig';

// =============================================================================
// CONSTANTS
// =============================================================================

/** Rail-based pricing for funderingskoker (EUR incl. BTW) */
const FUNDERINGSKOKER_PRICE_BY_RAIL: Record<RailType, number> = {
  2: 60,
  3: 90,
  4: 120,
  5: 150,
  6: 180,
};

/**
 * Ordered list of accessory handles to show as configurator extras.
 * This controls display order and which products are included.
 */
const EXTRA_HANDLES: string[] = [
  'glasopvang',
  'tochtstrip',
  'deurgreep-handvat',
  'komgreep',
  'meenemers',
  'funderingskoker',
];

/** Handles marked as "popular" in the configurator UI */
const POPULAR_HANDLES = new Set([
  'glasopvang',
  'tochtstrip',
  'deurgreep-handvat',
  'meenemers',
]);

// =============================================================================
// CACHE
// =============================================================================

let cachedProducts: Product[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function isCacheValid(): boolean {
  return cachedProducts !== null && Date.now() - cacheTimestamp < CACHE_TTL_MS;
}

// =============================================================================
// FETCH
// =============================================================================

/**
 * Fetch accessory products from Shopify and return them as a handle→Product map.
 */
async function fetchAccessoireProducts(): Promise<Map<string, Product>> {
  if (!isCacheValid()) {
    try {
      const { products } = await getCollectionProducts('accessoires', { first: 50 });
      cachedProducts = products;
      cacheTimestamp = Date.now();
    } catch (err) {
      console.error('[SchuifwandExtras] Failed to fetch accessoires:', err);
      cachedProducts = [];
      cacheTimestamp = Date.now();
    }
  }

  const map = new Map<string, Product>();
  for (const p of cachedProducts!) {
    if (p.handle) {
      map.set(p.handle, p);
    }
  }
  return map;
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Build ExtraOption[] for the schuifwand configurator from Shopify products.
 *
 * - Title, image come from Shopify.
 * - Price comes from Shopify, except funderingskoker which uses rail-based pricing.
 * - Only products that exist in Shopify (by handle) are returned.
 * - Ordering follows EXTRA_HANDLES.
 */
export async function getSchuifwandExtras(rail: RailType): Promise<ExtraOption[]> {
  const productMap = await fetchAccessoireProducts();

  const extras: ExtraOption[] = [];

  for (const handle of EXTRA_HANDLES) {
    const product = productMap.get(handle);
    if (!product) {
      console.warn(`[SchuifwandExtras] Product "${handle}" not found in Accessoires collection`);
      continue;
    }

    const isFunderingskoker = handle === 'funderingskoker';
    const price = isFunderingskoker
      ? FUNDERINGSKOKER_PRICE_BY_RAIL[rail]
      : product.price;

    extras.push({
      id: handle,
      label: product.title,
      priceDelta: price,
      imageUrl: product.imageUrl,
      popular: POPULAR_HANDLES.has(handle),
      infoText: product.shortDescription || undefined,
    });
  }

  return extras;
}

/**
 * Invalidate the cached accessory products.
 */
export function clearSchuifwandExtrasCache(): void {
  cachedProducts = null;
  cacheTimestamp = 0;
}
