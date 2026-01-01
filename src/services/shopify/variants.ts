/**
 * Shopify Variant Helpers
 * 
 * Utilities for working with Shopify product variants.
 * Used to get the correct variant ID for add-to-cart operations.
 */

export interface ShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice?: {
    amount: string;
    currencyCode: string;
  } | null;
  selectedOptions?: Array<{
    name: string;
    value: string;
  }>;
  image?: {
    url: string;
    altText?: string;
  } | null;
}

export interface ProductWithVariants {
  id?: string;
  handle?: string;
  title?: string;
  variants?: {
    nodes?: ShopifyVariant[];
  };
  // Our transformed Product may have this
  shopifyVariantId?: string;
}

/**
 * Get the first available variant from a product
 * 
 * Priority:
 * 1. First variant with availableForSale === true
 * 2. First variant regardless of availability
 * 3. null if no variants exist
 * 
 * @param product - Shopify product or transformed product with variants
 * @returns The best variant to use, or null
 */
export function getFirstAvailableVariant(product: ProductWithVariants): ShopifyVariant | null {
  const handle = product.handle || product.id || 'unknown';
  const variants = product.variants?.nodes;
  
  console.log('[Variant Helper] getFirstAvailableVariant', {
    handle,
    variantCount: variants?.length || 0,
  });

  if (!variants || variants.length === 0) {
    console.warn('[Variant Helper] No variants found for product:', handle);
    return null;
  }

  // Try to find an available variant first
  const availableVariant = variants.find(v => v.availableForSale === true);
  if (availableVariant) {
    console.log('[Variant Helper] Found available variant:', availableVariant.id);
    return availableVariant;
  }

  // Fall back to first variant
  console.log('[Variant Helper] No available variant, using first:', variants[0].id);
  return variants[0];
}

/**
 * Parse variant price to number
 * 
 * @param variant - Shopify variant object
 * @returns Price as number (e.g., 29.99)
 */
export function getVariantPrice(variant: ShopifyVariant | null): number {
  if (!variant?.price?.amount) {
    console.warn('[Variant Helper] No price found on variant');
    return 0;
  }

  const price = parseFloat(variant.price.amount);
  console.log('[Variant Helper] Parsed price:', price);
  return isNaN(price) ? 0 : price;
}

/**
 * Get compare-at price (original price before discount)
 * 
 * @param variant - Shopify variant object
 * @returns Compare-at price as number, or null if not set
 */
export function getVariantCompareAtPrice(variant: ShopifyVariant | null): number | null {
  if (!variant?.compareAtPrice?.amount) {
    return null;
  }

  const price = parseFloat(variant.compareAtPrice.amount);
  return isNaN(price) ? null : price;
}

/**
 * Check if a variant is on sale (has compare-at price > current price)
 * 
 * @param variant - Shopify variant object
 * @returns True if variant is on sale
 */
export function isVariantOnSale(variant: ShopifyVariant | null): boolean {
  if (!variant) return false;
  
  const currentPrice = getVariantPrice(variant);
  const compareAtPrice = getVariantCompareAtPrice(variant);
  
  return compareAtPrice !== null && compareAtPrice > currentPrice;
}

/**
 * Extract the Shopify variant GID (e.g., "gid://shopify/ProductVariant/123")
 * 
 * @param variant - Shopify variant object
 * @returns The variant GID string, or null
 */
export function getVariantGid(variant: ShopifyVariant | null): string | null {
  if (!variant?.id) {
    console.warn('[Variant Helper] No variant ID');
    return null;
  }
  return variant.id;
}

/**
 * Validate that we have everything needed for add-to-cart
 * 
 * @param variantId - The Shopify variant GID
 * @returns Object with isValid and error message
 */
export function validateVariantForCart(variantId: string | null | undefined): {
  isValid: boolean;
  error: string | null;
} {
  if (!variantId) {
    return {
      isValid: false,
      error: 'Dit product heeft geen beschikbare variant in Shopify.',
    };
  }

  // Basic GID format check
  if (!variantId.includes('ProductVariant')) {
    return {
      isValid: false,
      error: 'Ongeldige variant ID. Neem contact op met support.',
    };
  }

  return {
    isValid: true,
    error: null,
  };
}
