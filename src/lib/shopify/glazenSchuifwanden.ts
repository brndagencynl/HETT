/**
 * Glazen Schuifwanden — Shopify Product Fetcher
 * ================================================
 *
 * Fetches Shopify products tagged "glazen-schuifwand" and merges them
 * with the hardcoded rail configs from src/config/glazenSchuifwanden.ts.
 *
 * Each Shopify product should have tags:
 *   - "glazen-schuifwand"          ← identifies it as part of this category
 *   - "rail:2" / "rail:3" / etc.   ← identifies the rail variant
 */

import { searchProducts, transformShopifyProduct } from './products';
import { shopifyFetch, isShopifyConfigured } from './client';
import { GET_PRODUCTS } from './queries';
import type { ProductsResponse } from './types';
import type { Product } from '../../../types';
import {
  RAIL_CONFIGS,
  getRailConfigBySlug,
  getFromPriceCents,
  type RailConfig,
} from '../../config/glazenSchuifwanden';

// =============================================================================
// TYPES
// =============================================================================

/** A merged product: Shopify product data + hardcoded rail config */
export interface GlazenSchuifwandProduct {
  /** The Shopify product (images, title, handle, variant ID, price) */
  shopifyProduct: Product;
  /** The hardcoded rail config (width/height options, USPs, pricing) */
  railConfig: RailConfig;
  /** "From" price in cents from the hardcoded pricing table */
  fromPriceCents: number;
}

// =============================================================================
// CACHE
// =============================================================================

let cachedProducts: GlazenSchuifwandProduct[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function isCacheValid(): boolean {
  return cachedProducts !== null && Date.now() - cacheTimestamp < CACHE_TTL_MS;
}

// =============================================================================
// FETCH
// =============================================================================

/**
 * Extract rail number from product tags.
 * Looks for "rail:N" pattern.
 */
function extractRailFromTags(tags: string[]): number | null {
  for (const tag of tags) {
    const match = tag.match(/^rail:(\d+)$/i);
    if (match) return parseInt(match[1], 10);
  }
  return null;
}

/**
 * Fetch all glazen schuifwand products from Shopify and merge
 * with hardcoded rail configs.
 *
 * Returns products sorted by rail number (2, 3, 4, 5, 6).
 */
export async function getGlazenSchuifwandenProducts(
  options: { forceRefresh?: boolean } = {}
): Promise<GlazenSchuifwandProduct[]> {
  // Return cached if valid
  if (!options.forceRefresh && isCacheValid()) {
    return cachedProducts!;
  }

  if (!isShopifyConfigured()) {
    console.warn('[GlazenSchuifwanden] Shopify not configured, returning empty');
    return [];
  }

  try {
    // Search for products tagged "glazen-schuifwand"
    const { products } = await searchProducts('tag:glazen-schuifwand', { first: 20 });

    console.log('[GlazenSchuifwanden] Fetched products from Shopify:', products.length);

    // Also fetch raw Shopify data to get tags (our transform strips them)
    // The searchProducts result already has tags mapped via transformShopifyProduct,
    // but tags aren't kept on the Product interface. We fetch raw data separately.
    const rawData = await shopifyFetch<ProductsResponse>(GET_PRODUCTS, {
      first: 20,
      query: 'tag:glazen-schuifwand',
    });

    // Build a handle → tags map from raw Shopify data
    const tagsByHandle = new Map<string, string[]>();
    for (const edge of rawData.products.edges) {
      const node = edge.node;
      tagsByHandle.set(node.handle, node.tags || []);
    }

    // Merge: match each Shopify product with its rail config
    const merged: GlazenSchuifwandProduct[] = [];

    for (const product of products) {
      const tags = tagsByHandle.get(product.handle || product.id) || [];
      const rail = extractRailFromTags(tags);

      if (rail === null) {
        console.warn(
          `[GlazenSchuifwanden] Product "${product.title}" has no rail:N tag, skipping`
        );
        continue;
      }

      const railConfig = RAIL_CONFIGS.find((c) => c.rail === rail);
      if (!railConfig) {
        console.warn(
          `[GlazenSchuifwanden] No rail config for rail=${rail} (product "${product.title}"), skipping`
        );
        continue;
      }

      merged.push({
        shopifyProduct: product,
        railConfig,
        fromPriceCents: getFromPriceCents(rail),
      });
    }

    // Sort by rail number ascending
    merged.sort((a, b) => a.railConfig.rail - b.railConfig.rail);

    console.log(
      '[GlazenSchuifwanden] Merged products:',
      merged.map((m) => `${m.railConfig.rail}-rail → ${m.shopifyProduct.handle}`)
    );

    // Update cache
    cachedProducts = merged;
    cacheTimestamp = Date.now();

    return merged;
  } catch (error) {
    console.error('[GlazenSchuifwanden] Failed to fetch products:', error);
    return [];
  }
}

/**
 * Fetch a single glazen schuifwand product by rail slug (e.g. "3-rail").
 * First tries to find it in the cached list, then fetches fresh if needed.
 */
export async function getGlazenSchuifwandBySlug(
  slug: string
): Promise<GlazenSchuifwandProduct | null> {
  const all = await getGlazenSchuifwandenProducts();
  return all.find((p) => p.railConfig.slug === slug) || null;
}

/**
 * Invalidate the product cache (useful after Shopify product updates).
 */
export function clearGlazenSchuifwandenCache(): void {
  cachedProducts = null;
  cacheTimestamp = 0;
}
