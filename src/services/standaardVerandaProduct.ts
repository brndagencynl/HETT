/**
 * Standaard Veranda Product Service
 * ==================================
 * 
 * Fetches the "Standaard Veranda" product from Shopify and extracts
 * variant information for width/depth selection in the configurator.
 * 
 * The product should have:
 * - Option 1: "Breedte (cm)" with values like 306, 406, 506, etc.
 * - Option 2: "Diepte (cm)" with values like 250, 300, 350, 400
 */

import { shopifyFetch, isShopifyConfigured } from '../lib/shopify/client';
import { toCents, fromCents } from '../utils/money';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * The Shopify handle for the standaard veranda product.
 * Change this if your product has a different handle.
 */
export const STANDAARD_VERANDA_HANDLE = 'standaard-veranda';

/**
 * Option names in Shopify (must match exactly)
 */
const WIDTH_OPTION_NAME = 'Breedte (cm)';
const DEPTH_OPTION_NAME = 'Diepte (cm)';

// =============================================================================
// TYPES
// =============================================================================

export interface StandaardVerandaVariant {
  id: string;
  widthCm: number;
  depthCm: number;
  priceCents: number;
  priceEur: number;
  available: boolean;
}

export interface StandaardVerandaProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  imageUrl: string;
  availableWidths: number[];
  variants: StandaardVerandaVariant[];
}

// =============================================================================
// GRAPHQL QUERY
// =============================================================================

const GET_STANDAARD_VERANDA_QUERY = `
  query GetStandaardVeranda($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      featuredImage {
        url
        altText
      }
      options {
        name
        values
      }
      variants(first: 100) {
        nodes {
          id
          availableForSale
          price {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
`;

// =============================================================================
// CACHE
// =============================================================================

let cachedProduct: StandaardVerandaProduct | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// =============================================================================
// FALLBACK MOCK DATA (used when Shopify product not found)
// =============================================================================

/**
 * Generate fallback mock data based on the matrix catalog
 * This allows the configurator to work even if the Shopify product is not yet created
 */
function generateFallbackProduct(): StandaardVerandaProduct {
  // Use standard visible sizes from matrixCatalog
  const WIDTHS = [506, 606, 706];
  const DEPTHS = [250, 300, 350, 400];
  
  // Base prices (approximate, in euros) - these match typical matrix pricing
  const BASE_PRICES: Record<string, number> = {
    '506x250': 699,
    '506x300': 799,
    '506x350': 899,
    '506x400': 999,
    '606x250': 899,
    '606x300': 999,
    '606x350': 1099,
    '606x400': 1199,
    '706x250': 1099,
    '706x300': 1199,
    '706x350': 1299,
    '706x400': 1399,
  };

  const variants: StandaardVerandaVariant[] = [];
  
  for (const width of WIDTHS) {
    for (const depth of DEPTHS) {
      const key = `${width}x${depth}`;
      const priceEur = BASE_PRICES[key] || 999;
      variants.push({
        id: `mock-variant-${key}`,
        widthCm: width,
        depthCm: depth,
        priceCents: toCents(priceEur),
        priceEur,
        available: true,
      });
    }
  }

  return {
    id: 'mock-standaard-veranda',
    handle: STANDAARD_VERANDA_HANDLE,
    title: 'Standaard Veranda',
    description: 'Hoogwaardige aluminium veranda met standaard afmetingen. Snel leverbaar en eenvoudig te configureren.',
    imageUrl: '/assets/images/home_hero.webp',
    availableWidths: WIDTHS,
    variants,
  };
}

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

/**
 * Fetch the Standaard Veranda product from Shopify
 */
export async function getStandaardVerandaProduct(): Promise<StandaardVerandaProduct | null> {
  // Check cache
  if (cachedProduct && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedProduct;
  }

  if (!isShopifyConfigured()) {
    console.warn('[StandaardVeranda] Shopify not configured, using fallback data');
    return generateFallbackProduct();
  }

  try {
    interface ShopifyVariantNode {
      id: string;
      availableForSale: boolean;
      price: { amount: string; currencyCode: string };
      selectedOptions: Array<{ name: string; value: string }>;
    }

    interface ShopifyProductResponse {
      product: {
        id: string;
        handle: string;
        title: string;
        description: string;
        featuredImage: { url: string; altText: string | null } | null;
        options: Array<{ name: string; values: string[] }>;
        variants: { nodes: ShopifyVariantNode[] };
      } | null;
    }

    const data = await shopifyFetch<ShopifyProductResponse>(GET_STANDAARD_VERANDA_QUERY, {
      handle: STANDAARD_VERANDA_HANDLE,
    });

    if (!data.product) {
      console.warn('[StandaardVeranda] Product not found:', STANDAARD_VERANDA_HANDLE, '- using fallback data');
      return generateFallbackProduct();
    }

    const product = data.product;

    // Parse variants
    const variants: StandaardVerandaVariant[] = [];
    const widthSet = new Set<number>();

    for (const variant of product.variants.nodes) {
      const widthOption = variant.selectedOptions.find(o => o.name === WIDTH_OPTION_NAME);
      const depthOption = variant.selectedOptions.find(o => o.name === DEPTH_OPTION_NAME);

      if (!widthOption || !depthOption) {
        console.warn('[StandaardVeranda] Variant missing width/depth options:', variant.id);
        continue;
      }

      const widthCm = parseInt(widthOption.value, 10);
      const depthCm = parseInt(depthOption.value, 10);

      if (isNaN(widthCm) || isNaN(depthCm)) {
        console.warn('[StandaardVeranda] Invalid width/depth values:', widthOption.value, depthOption.value);
        continue;
      }

      const priceCents = toCents(variant.price.amount);
      
      variants.push({
        id: variant.id,
        widthCm,
        depthCm,
        priceCents,
        priceEur: fromCents(priceCents),
        available: variant.availableForSale,
      });

      widthSet.add(widthCm);
    }

    // Sort widths
    const availableWidths = Array.from(widthSet).sort((a, b) => a - b);

    const result: StandaardVerandaProduct = {
      id: product.id,
      handle: product.handle,
      title: product.title,
      description: product.description,
      imageUrl: product.featuredImage?.url || '/assets/images/home_hero.webp',
      availableWidths,
      variants,
    };

    // Update cache
    cachedProduct = result;
    cacheTimestamp = Date.now();

    console.log('[StandaardVeranda] Loaded product:', {
      variantCount: variants.length,
      widths: availableWidths,
    });

    return result;
  } catch (error) {
    console.error('[StandaardVeranda] Failed to fetch product:', error, '- using fallback data');
    return generateFallbackProduct();
  }
}

/**
 * Get available depths for a given width
 */
export function getAvailableDepthsForWidth(
  product: StandaardVerandaProduct,
  widthCm: number
): number[] {
  const depths = product.variants
    .filter(v => v.widthCm === widthCm && v.available)
    .map(v => v.depthCm);
  
  return [...new Set(depths)].sort((a, b) => a - b);
}

/**
 * Get all available depths (across all widths)
 */
export function getAllAvailableDepths(product: StandaardVerandaProduct): number[] {
  const depths = product.variants
    .filter(v => v.available)
    .map(v => v.depthCm);
  
  return [...new Set(depths)].sort((a, b) => a - b);
}

/**
 * Get the variant ID for a specific width/depth combination
 */
export function getVariantForSize(
  product: StandaardVerandaProduct,
  widthCm: number,
  depthCm: number
): StandaardVerandaVariant | null {
  return product.variants.find(
    v => v.widthCm === widthCm && v.depthCm === depthCm
  ) || null;
}

/**
 * Get the price for a specific width/depth combination
 */
export function getPriceForSize(
  product: StandaardVerandaProduct,
  widthCm: number,
  depthCm: number
): { priceCents: number; priceEur: number } | null {
  const variant = getVariantForSize(product, widthCm, depthCm);
  if (!variant) return null;
  
  return {
    priceCents: variant.priceCents,
    priceEur: variant.priceEur,
  };
}

/**
 * Clear the cache (useful for development)
 */
export function clearStandaardVerandaCache(): void {
  cachedProduct = null;
  cacheTimestamp = 0;
}
