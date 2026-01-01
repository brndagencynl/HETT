/**
 * Product Type Resolver
 * 
 * Single source of truth for determining product type from Shopify data.
 * Used by ProductCard, ProductDetail, Cart to make decisions about:
 * - CTA buttons (add to cart vs configure)
 * - Navigation behavior
 * - Cart payload structure
 * 
 * Resolution priority:
 * 1. Collection handle (most reliable)
 * 2. Product tags
 * 3. productType field
 * 4. Default to 'accessoire'
 */

import type { Product, CategorySlug } from '../../../types';

// Canonical product types for cart/UI logic
export type ProductType = 'veranda' | 'sandwichpaneel' | 'accessoire';

// Map category slugs to product types
const CATEGORY_TO_TYPE: Record<CategorySlug, ProductType> = {
  verandas: 'veranda',
  sandwichpanelen: 'sandwichpaneel',
  accessoires: 'accessoire',
};

// Map Shopify productType values to our types
const PRODUCT_TYPE_MAP: Record<string, ProductType> = {
  'veranda': 'veranda',
  'verandas': 'veranda',
  'overkapping': 'veranda',
  'sandwichpaneel': 'sandwichpaneel',
  'sandwichpanelen': 'sandwichpaneel',
  'sandwich panel': 'sandwichpaneel',
  'accessoire': 'accessoire',
  'accessoires': 'accessoire',
  'accessory': 'accessoire',
  'accessoires & extra\'s': 'accessoire',
};

// Tags that indicate product type
const TYPE_TAGS: Record<ProductType, string[]> = {
  veranda: ['veranda', 'verandas', 'overkapping', 'terras-overkapping'],
  sandwichpaneel: ['sandwichpaneel', 'sandwichpanelen', 'sandwich'],
  accessoire: ['accessoire', 'accessoires', 'accessory', 'extra'],
};

/**
 * Resolve the product type from a Product object
 * 
 * @param product - The transformed Product from Shopify
 * @returns The canonical product type
 */
export function resolveProductType(product: Product): ProductType {
  // 1. Check category slug (most reliable - set during transform)
  if (product.category && CATEGORY_TO_TYPE[product.category]) {
    return CATEGORY_TO_TYPE[product.category];
  }

  // 2. Check if requires configuration (veranda or sandwich)
  if (product.requiresConfiguration) {
    // If we can't distinguish, default to veranda
    return 'veranda';
  }

  // 3. Default to accessoire
  return 'accessoire';
}

/**
 * Resolve product type from raw Shopify data
 * Used when you have direct Shopify response before transform
 * 
 * @param shopifyProduct - Raw Shopify product data
 * @returns The canonical product type
 */
export function resolveProductTypeFromShopify(shopifyProduct: {
  productType?: string;
  tags?: string[];
  collections?: { nodes: Array<{ handle: string }> };
}): ProductType {
  // 1. Check collections first (most reliable)
  if (shopifyProduct.collections?.nodes) {
    for (const collection of shopifyProduct.collections.nodes) {
      const handle = collection.handle.toLowerCase();
      if (handle === 'verandas') return 'veranda';
      if (handle === 'sandwichpanelen') return 'sandwichpaneel';
      if (handle === 'accessoires') return 'accessoire';
    }
  }

  // 2. Check productType field
  if (shopifyProduct.productType) {
    const normalized = shopifyProduct.productType.toLowerCase().trim();
    if (PRODUCT_TYPE_MAP[normalized]) {
      return PRODUCT_TYPE_MAP[normalized];
    }
  }

  // 3. Check tags
  if (shopifyProduct.tags) {
    const normalizedTags = shopifyProduct.tags.map(t => t.toLowerCase());
    
    for (const tag of normalizedTags) {
      if (TYPE_TAGS.veranda.some(t => tag.includes(t))) return 'veranda';
      if (TYPE_TAGS.sandwichpaneel.some(t => tag.includes(t))) return 'sandwichpaneel';
      if (TYPE_TAGS.accessoire.some(t => tag.includes(t))) return 'accessoire';
    }
  }

  // 4. Default to accessoire
  return 'accessoire';
}

/**
 * Check if product requires configuration
 * 
 * @param type - The resolved product type
 * @returns True if the product needs to go through a configurator
 */
export function requiresConfiguration(type: ProductType): boolean {
  return type === 'veranda' || type === 'sandwichpaneel';
}

/**
 * Get the appropriate cart item type for a product
 * 
 * @param type - The resolved product type
 * @returns The cart item type string
 */
export function getCartItemType(type: ProductType): 'custom_veranda' | 'sandwichpanelen' | 'product' {
  switch (type) {
    case 'veranda':
      return 'custom_veranda';
    case 'sandwichpaneel':
      return 'sandwichpanelen';
    default:
      return 'product';
  }
}

/**
 * Get the CTA label for a product type
 * 
 * @param type - The resolved product type
 * @returns The appropriate CTA button text
 */
export function getCtaLabel(type: ProductType): string {
  switch (type) {
    case 'veranda':
    case 'sandwichpaneel':
      return 'Stel samen';
    default:
      return 'In winkelwagen';
  }
}
