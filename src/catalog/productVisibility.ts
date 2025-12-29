/**
 * Product Visibility Helpers
 * ==========================
 * 
 * Centralized helpers for filtering products by visibility.
 * Use these in all listing pages, search, and grids.
 */

import type { Product, ProductVisibility } from '../../types';

/**
 * Check if a product should be visible to customers
 * Products without visibility field default to 'public'
 */
export function isProductVisible(product: Product): boolean {
  return product.visibility !== 'hidden_anchor';
}

/**
 * Filter an array of products to only include visible ones
 * Use this in all listing pages, search results, and grids
 */
export function filterVisibleProducts(products: Product[]): Product[] {
  return products.filter(isProductVisible);
}

/**
 * Get a product by ID, regardless of visibility
 * Used for price lookup in custom configurator
 */
export function getProductById(products: Product[], id: string): Product | undefined {
  return products.find(p => p.id === id);
}

/**
 * Get a veranda product by size key (e.g., "506x300")
 * Used for price lookup in custom configurator
 */
export function getVerandaBySizeKey(products: Product[], sizeKey: string): Product | undefined {
  return products.find(p => p.category === 'verandas' && p.sizeKey === sizeKey);
}

/**
 * Get the base price for an anchor product by size key
 * Returns undefined if product not found
 */
export function getAnchorProductPrice(products: Product[], sizeKey: string): number | undefined {
  const product = getVerandaBySizeKey(products, sizeKey);
  return product?.price;
}
