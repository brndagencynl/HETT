/**
 * Product Kind Determination
 * 
 * Determines product type (configurable vs simple) based on Shopify data.
 * Uses multiple fallbacks for robustness.
 */

import { Product, CategorySlug } from '../../types';

export type ProductKind = 'configurable' | 'simple';

/**
 * Categories that require configuration before adding to cart
 */
export const CONFIGURABLE_CATEGORIES: CategorySlug[] = ['verandas', 'sandwichpanelen'];

/**
 * Categories that are simple add-to-cart (no configuration needed)
 */
export const SIMPLE_CATEGORIES: CategorySlug[] = ['accessoires'];

/**
 * Product handles that are always configurable (hardcoded fallback)
 */
export const CONFIGURABLE_HANDLES: string[] = ['sandwichpaneel'];

/**
 * Determine if a product requires configuration
 * 
 * Priority order:
 * 1. Shopify tag "configurable" → requires config
 * 2. Shopify tag "simple" → simple add-to-cart
 * 3. Product handle is in CONFIGURABLE_HANDLES → configurable
 * 4. Product.requiresConfiguration field
 * 5. Category-based fallback:
 *    - verandas, sandwichpanelen → configurable
 *    - accessoires → simple
 * 6. Default: simple (safe fallback)
 */
export function getProductKind(product: Product): ProductKind {
  // 1. Check badges/tags for "configurable" or "simple"
  if (product.badges?.some(b => b.toLowerCase() === 'configurable')) {
    return 'configurable';
  }
  if (product.badges?.some(b => b.toLowerCase() === 'simple')) {
    return 'simple';
  }

  // 2. Check if product handle is in configurable handles list
  if (product.id && CONFIGURABLE_HANDLES.includes(product.id.toLowerCase())) {
    return 'configurable';
  }

  // 3. Check explicit requiresConfiguration field
  if (product.requiresConfiguration === true) {
    return 'configurable';
  }
  if (product.requiresConfiguration === false) {
    return 'simple';
  }

  // 4. Category-based fallback
  if (CONFIGURABLE_CATEGORIES.includes(product.category)) {
    return 'configurable';
  }

  if (SIMPLE_CATEGORIES.includes(product.category)) {
    return 'simple';
  }

  // 5. Default to simple (safe fallback - no configuration UI needed)
  return 'simple';
}

/**
 * Check if a product requires configuration
 */
export function requiresConfiguration(product: Product): boolean {
  return getProductKind(product) === 'configurable';
}

/**
 * Check if a product is a simple add-to-cart item
 */
export function isSimpleProduct(product: Product): boolean {
  return getProductKind(product) === 'simple';
}

/**
 * Get the appropriate CTA label for a product
 */
export function getProductCTALabel(product: Product): string {
  return requiresConfiguration(product) ? 'Stel samen' : 'In winkelwagen';
}

/**
 * Get the appropriate CTA label for product cards on listing pages
 */
export function getCardCTALabel(product: Product): string {
  return requiresConfiguration(product) ? 'Stel samen' : 'In winkelwagen';
}
