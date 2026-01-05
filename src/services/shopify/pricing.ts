/**
 * Shopify Pricing Helpers
 * 
 * Utility functions for extracting and working with variant prices from Shopify.
 * Used for standard veranda products where base price comes from Shopify variants.
 */

import type { Product } from '../../../types';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Shopify variant structure (minimal, from queries.ts)
 */
export interface ShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: {
    amount: string;
    currencyCode: string;
  };
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Convert Shopify price string to number (euros)
 * Shopify returns amounts as strings like "1350.00"
 * 
 * @param amountStr - Price string from Shopify (e.g., "1350.00")
 * @returns Number in euros (e.g., 1350.00)
 */
export function toNumber(amountStr: string | undefined): number {
  if (!amountStr) {
    console.warn('[shopify/pricing] toNumber: received undefined/null amount');
    return 0;
  }
  const parsed = parseFloat(amountStr);
  if (isNaN(parsed)) {
    console.warn('[shopify/pricing] toNumber: failed to parse:', amountStr);
    return 0;
  }
  console.log('[shopify/pricing] toNumber:', amountStr, '->', parsed);
  return parsed;
}

/**
 * Get the first available (in-stock) variant from a product's variants
 * Falls back to first variant if none are available for sale
 * 
 * @param variants - Array of Shopify variants
 * @returns First available variant, or first variant, or null
 */
export function getFirstAvailableVariant(variants: ShopifyVariant[]): ShopifyVariant | null {
  if (!variants || variants.length === 0) {
    console.warn('[shopify/pricing] getFirstAvailableVariant: no variants');
    return null;
  }
  
  // Prefer available variant
  const available = variants.find(v => v.availableForSale);
  if (available) {
    console.log('[shopify/pricing] getFirstAvailableVariant: found available variant:', available.id);
    return available;
  }
  
  // Fallback to first variant
  console.log('[shopify/pricing] getFirstAvailableVariant: no available variant, using first:', variants[0].id);
  return variants[0];
}

/**
 * Get price in euros from a variant
 * 
 * @param variant - Shopify variant with price
 * @returns Price in euros (number)
 */
export function getVariantPrice(variant: ShopifyVariant | null): number {
  if (!variant) {
    console.warn('[shopify/pricing] getVariantPrice: variant is null');
    return 0;
  }
  
  const price = toNumber(variant.price?.amount);
  console.log('[shopify/pricing] getVariantPrice:', variant.id, '->', price);
  return price;
}

/**
 * Get base price from a Product object (already transformed from Shopify)
 * This is the primary method to get Shopify-sourced price for standard verandas.
 * 
 * @param product - Product with priceCents/price from Shopify
 * @returns Price in euros (number)
 */
export function getProductBasePrice(product: Product): number {
  if (!product) {
    console.warn('[shopify/pricing] getProductBasePrice: product is null');
    return 0;
  }
  
  // product.price is already in euros (fromCents(priceCents))
  const price = product.price;
  
  console.log('[shopify/pricing] getProductBasePrice:', product.id, {
    price,
    priceCents: product.priceCents,
    shopifyVariantId: product.shopifyVariantId,
  });
  
  return price;
}

/**
 * Validate that a product has a valid Shopify price
 * Use this to ensure we're not using local fallback prices
 * 
 * @param product - Product to validate
 * @returns true if product has valid Shopify-sourced price
 */
export function hasValidShopifyPrice(product: Product): boolean {
  if (!product) return false;
  
  const valid = typeof product.price === 'number' && 
                product.price > 0 &&
                typeof product.priceCents === 'number' &&
                product.priceCents > 0;
  
  console.log('[shopify/pricing] hasValidShopifyPrice:', product.id, valid);
  return valid;
}
