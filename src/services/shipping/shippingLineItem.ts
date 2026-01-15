/**
 * Shipping Line Item Service
 * ==========================
 * 
 * Manages shipping as a cart line item using a Shopify product.
 * 
 * The shipping product "bezorgkosten-per-km" is priced at €1.00.
 * For BE/DE deliveries, we add quantity = ceil(distance in km).
 * For NL or pickup, no shipping line is added.
 */

import { getProductByHandle } from '../../lib/shopify/products';
import type { Product, CartItem } from '../../../types';
import { toCents, fromCents, mulCents } from '../../utils/money';
import {
  SHIPPING_PRODUCT_HANDLE,
  SHIPPING_LINE_CART_ID,
  PRICE_PER_KM_CENTS,
  type ShippingCountry,
  isShippingFree,
} from './constants';

// =============================================================================
// TYPES
// =============================================================================

export interface ShippingSelection {
  method: 'pickup' | 'delivery';
  country: ShippingCountry;
  postalCode: string;
  houseNumber: string;
  houseNumberAddition?: string;
  city?: string;
  street?: string;
}

export interface ShippingQuoteResult {
  type?: 'free' | 'veranda_flat' | 'accessories' | 'pickup';
  description?: string;
  distanceKm: number;
  quantityKm: number; // ceil(distanceKm)
  totalCents: number;
  totalEur: number;
}

export interface ShippingLineItem extends CartItem {
  isShippingLine: true;
  shippingMeta: {
    method: 'pickup' | 'delivery';
    country: ShippingCountry;
    postalCode: string;
    houseNumber: string;
    distanceKm: number;
    quantityKm: number;
    shippingType?: 'free' | 'veranda_flat' | 'accessories' | 'pickup';
  };
}

// =============================================================================
// SHIPPING PRODUCT CACHE
// =============================================================================

let shippingProductCache: Product | null = null;
let shippingProductFetchPromise: Promise<Product | null> | null = null;

/**
 * Fetch the shipping product from Shopify.
 * Caches the result for subsequent calls.
 * 
 * @throws Error if product not found in Shopify
 */
export async function getShippingProduct(): Promise<Product> {
  // Return cached product if available
  if (shippingProductCache) {
    return shippingProductCache;
  }

  // If a fetch is already in progress, wait for it
  if (shippingProductFetchPromise) {
    const product = await shippingProductFetchPromise;
    if (product) return product;
    throw new Error(`Shipping product ontbreekt in Shopify (${SHIPPING_PRODUCT_HANDLE}). Neem contact op met support.`);
  }

  // Start new fetch
  console.log('[Shipping] Fetching shipping product:', SHIPPING_PRODUCT_HANDLE);
  
  shippingProductFetchPromise = getProductByHandle(SHIPPING_PRODUCT_HANDLE);
  
  try {
    const product = await shippingProductFetchPromise;
    
    if (!product) {
      console.error('[Shipping] Product not found:', SHIPPING_PRODUCT_HANDLE);
      throw new Error(`Shipping product ontbreekt in Shopify (${SHIPPING_PRODUCT_HANDLE}). Neem contact op met support.`);
    }

    if (!product.shopifyVariantId) {
      console.error('[Shipping] Product has no variant:', SHIPPING_PRODUCT_HANDLE);
      throw new Error(`Shipping product heeft geen variant in Shopify. Neem contact op met support.`);
    }

    console.log('[Shipping] Product loaded:', {
      handle: product.handle,
      variantId: product.shopifyVariantId,
      priceCents: product.priceCents,
    });

    shippingProductCache = product;
    return product;
  } finally {
    shippingProductFetchPromise = null;
  }
}

/**
 * Clear the shipping product cache.
 * Useful for testing or when product might have changed.
 */
export function clearShippingProductCache(): void {
  shippingProductCache = null;
  shippingProductFetchPromise = null;
}

// =============================================================================
// SHIPPING CALCULATION
// =============================================================================

/**
 * Calculate shipping quantity and cost from distance.
 * 
 * @param distanceKm - Distance in kilometers
 * @param country - Destination country
 * @returns Shipping quote with quantity and total
 */
export function calculateShippingFromDistance(
  distanceKm: number,
  country: ShippingCountry
): ShippingQuoteResult {
  // NL is always free
  if (isShippingFree(country)) {
    return {
      distanceKm,
      quantityKm: 0,
      totalCents: 0,
      totalEur: 0,
    };
  }

  // BE/DE: ceil(km) * €1
  const quantityKm = Math.ceil(distanceKm);
  const totalCents = mulCents(PRICE_PER_KM_CENTS, quantityKm);
  const totalEur = fromCents(totalCents);

  return {
    distanceKm,
    quantityKm,
    totalCents,
    totalEur,
  };
}

// =============================================================================
// SHIPPING LINE ITEM CREATION
// =============================================================================

/**
 * Create a shipping line item for the cart.
 * 
 * @param shippingProduct - The Shopify shipping product
 * @param quote - The calculated shipping quote
 * @param selection - The shipping selection details
 * @returns CartItem for shipping, or null if no shipping cost
 */
export function createShippingLineItem(
  shippingProduct: Product,
  quote: ShippingQuoteResult,
  selection: ShippingSelection
): ShippingLineItem | null {
  // No line item needed if free
  if (quote.totalCents === 0) {
    return null;
  }

  // For Shopify: the shipping product is priced at €1/unit
  // So quantity = totalCents / 100 to get the correct total
  // e.g. €29.99 = 2999 cents / 100 = 29.99 units (rounded to 30)
  // e.g. €299.99 = 29999 cents / 100 = 299.99 units (rounded to 300)
  const shopifyQuantity = Math.round(quote.totalCents / PRICE_PER_KM_CENTS);
  
  // Determine title based on shipping type
  let title = 'Bezorgkosten';
  if (quote.type === 'accessories') {
    title = 'Verzendkosten accessoires';
  } else if (quote.type === 'veranda_flat') {
    title = `Bezorgkosten veranda (${quote.distanceKm.toFixed(0)} km)`;
  } else if (quote.distanceKm > 0) {
    title = `Bezorgkosten (${quote.distanceKm.toFixed(0)} km)`;
  }

  const lineItem: ShippingLineItem = {
    // Cart item identification
    id: SHIPPING_LINE_CART_ID,
    slug: SHIPPING_PRODUCT_HANDLE,
    type: 'shipping',
    isShippingLine: true,

    // Product info from Shopify
    title,
    category: 'accessoires', // Doesn't matter for display
    shopifyVariantId: shippingProduct.shopifyVariantId,
    imageUrl: shippingProduct.imageUrl || '/assets/images/shipping-icon.webp',
    shortDescription: `Bezorging naar ${selection.postalCode}, ${selection.country}`,
    description: quote.description || '',
    specs: {},
    requiresConfiguration: false,

    // Pricing - use calculated quantity to match Shopify
    priceCents: PRICE_PER_KM_CENTS,
    price: fromCents(PRICE_PER_KM_CENTS),
    quantity: shopifyQuantity,
    unitPriceCents: PRICE_PER_KM_CENTS,
    lineTotalCents: quote.totalCents,
    totalPrice: quote.totalEur,

    // Shipping metadata for Shopify attributes
    shippingMeta: {
      method: selection.method,
      country: selection.country,
      postalCode: selection.postalCode,
      houseNumber: selection.houseNumber,
      distanceKm: quote.distanceKm,
      quantityKm: shopifyQuantity,
      shippingType: quote.type,
    },

    // Display details based on shipping type
    details: quote.type === 'accessories' || quote.type === 'veranda_flat'
      ? [
          { label: 'Type', value: quote.type === 'accessories' ? 'Accessoires' : 'Veranda' },
          { label: 'Totaal', value: `€ ${quote.totalEur.toFixed(2)}` },
        ]
      : [
          { label: 'Afstand', value: `${quote.distanceKm.toFixed(1)} km` },
          { label: 'Prijs per km', value: '€ 1,00' },
          { label: 'Totaal', value: `€ ${quote.totalEur.toFixed(2)}` },
        ],
  };

  return lineItem;
}

// =============================================================================
// CART HELPERS
// =============================================================================

/**
 * Check if a cart item is a shipping line.
 */
export function isShippingLineItem(item: CartItem): item is ShippingLineItem {
  return item.id === SHIPPING_LINE_CART_ID || (item as any).isShippingLine === true;
}

/**
 * Find the shipping line in a cart.
 */
export function findShippingLine(cart: CartItem[]): ShippingLineItem | null {
  const line = cart.find(isShippingLineItem);
  return line || null;
}

/**
 * Get cart items excluding shipping line.
 */
export function getProductsOnly(cart: CartItem[]): CartItem[] {
  return cart.filter(item => !isShippingLineItem(item));
}

/**
 * Get cart total excluding shipping.
 */
export function getProductsTotalCents(cart: CartItem[]): number {
  return getProductsOnly(cart).reduce((sum, item) => sum + (item.lineTotalCents || 0), 0);
}
