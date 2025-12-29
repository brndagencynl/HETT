/**
 * Shopify Cart Store
 * Manages cart state with Shopify Storefront API
 * Persists cartId in localStorage for session continuity
 */

import { shopifyFetch, ShopifyError, isShopifyConfigured } from './client';
import {
  GET_CART,
  CREATE_CART,
  ADD_CART_LINES,
  UPDATE_CART_LINES,
  REMOVE_CART_LINES,
} from './queries';
import type {
  ShopifyCart,
  CartLineInput,
  CartLineUpdateInput,
  CartResponse,
  CartCreateResponse,
  CartLinesAddResponse,
  CartLinesUpdateResponse,
  CartLinesRemoveResponse,
  ShopifyCartLineAttribute,
} from './types';

// =============================================================================
// CONSTANTS
// =============================================================================

const CART_ID_KEY = 'hett_shopify_cart_id';

// =============================================================================
// STORAGE HELPERS
// =============================================================================

function getStoredCartId(): string | null {
  try {
    return localStorage.getItem(CART_ID_KEY);
  } catch {
    return null;
  }
}

function setStoredCartId(cartId: string): void {
  try {
    localStorage.setItem(CART_ID_KEY, cartId);
  } catch (e) {
    console.warn('[CartStore] Failed to store cart ID:', e);
  }
}

function clearStoredCartId(): void {
  try {
    localStorage.removeItem(CART_ID_KEY);
  } catch {
    // Ignore
  }
}

// =============================================================================
// CART OPERATIONS
// =============================================================================

/**
 * Get the current cart, or null if no cart exists
 */
export async function getCart(): Promise<ShopifyCart | null> {
  if (!isShopifyConfigured()) {
    console.warn('[CartStore] Shopify not configured');
    return null;
  }

  const cartId = getStoredCartId();
  if (!cartId) {
    return null;
  }

  try {
    const data = await shopifyFetch<CartResponse>(GET_CART, { cartId });
    
    // Cart might have expired or been completed
    if (!data.cart) {
      clearStoredCartId();
      return null;
    }

    return data.cart;
  } catch (error) {
    if (error instanceof ShopifyError) {
      // Cart not found - clear stored ID
      if (error.message.includes('not found') || error.code === 'NOT_FOUND') {
        clearStoredCartId();
        return null;
      }
    }
    throw error;
  }
}

/**
 * Create a new cart, optionally with initial lines
 */
export async function createCart(
  lines: CartLineInput[] = []
): Promise<ShopifyCart> {
  if (!isShopifyConfigured()) {
    throw new ShopifyError('Shopify not configured', 'NOT_CONFIGURED');
  }

  const input: Record<string, unknown> = {};
  if (lines.length > 0) {
    input.lines = lines;
  }

  const data = await shopifyFetch<CartCreateResponse>(CREATE_CART, { input });

  if (data.cartCreate.userErrors.length > 0) {
    const error = data.cartCreate.userErrors[0];
    throw new ShopifyError(error.message, 'CART_CREATE_ERROR');
  }

  if (!data.cartCreate.cart) {
    throw new ShopifyError('Failed to create cart', 'CART_CREATE_ERROR');
  }

  setStoredCartId(data.cartCreate.cart.id);
  return data.cartCreate.cart;
}

/**
 * Ensure a cart exists, creating one if necessary
 */
export async function ensureCart(): Promise<ShopifyCart> {
  const existingCart = await getCart();
  if (existingCart) {
    return existingCart;
  }
  return createCart();
}

/**
 * Add lines to the cart
 */
export async function addToCart(
  variantId: string,
  quantity: number = 1,
  attributes: ShopifyCartLineAttribute[] = []
): Promise<ShopifyCart> {
  const cart = await ensureCart();

  const lines: CartLineInput[] = [
    {
      merchandiseId: variantId,
      quantity,
      attributes: attributes.length > 0 ? attributes : undefined,
    },
  ];

  const data = await shopifyFetch<CartLinesAddResponse>(ADD_CART_LINES, {
    cartId: cart.id,
    lines,
  });

  if (data.cartLinesAdd.userErrors.length > 0) {
    const error = data.cartLinesAdd.userErrors[0];
    throw new ShopifyError(error.message, 'CART_ADD_ERROR');
  }

  if (!data.cartLinesAdd.cart) {
    throw new ShopifyError('Failed to add to cart', 'CART_ADD_ERROR');
  }

  return data.cartLinesAdd.cart;
}

/**
 * Add multiple lines to the cart at once
 */
export async function addLinesToCart(
  lines: CartLineInput[]
): Promise<ShopifyCart> {
  const cart = await ensureCart();

  const data = await shopifyFetch<CartLinesAddResponse>(ADD_CART_LINES, {
    cartId: cart.id,
    lines,
  });

  if (data.cartLinesAdd.userErrors.length > 0) {
    const error = data.cartLinesAdd.userErrors[0];
    throw new ShopifyError(error.message, 'CART_ADD_ERROR');
  }

  if (!data.cartLinesAdd.cart) {
    throw new ShopifyError('Failed to add lines to cart', 'CART_ADD_ERROR');
  }

  return data.cartLinesAdd.cart;
}

/**
 * Update a cart line quantity
 */
export async function updateCartLine(
  lineId: string,
  quantity: number,
  attributes?: ShopifyCartLineAttribute[]
): Promise<ShopifyCart> {
  const cartId = getStoredCartId();
  if (!cartId) {
    throw new ShopifyError('No cart found', 'NO_CART');
  }

  const lines: CartLineUpdateInput[] = [
    {
      id: lineId,
      quantity,
      ...(attributes && { attributes }),
    },
  ];

  const data = await shopifyFetch<CartLinesUpdateResponse>(UPDATE_CART_LINES, {
    cartId,
    lines,
  });

  if (data.cartLinesUpdate.userErrors.length > 0) {
    const error = data.cartLinesUpdate.userErrors[0];
    throw new ShopifyError(error.message, 'CART_UPDATE_ERROR');
  }

  if (!data.cartLinesUpdate.cart) {
    throw new ShopifyError('Failed to update cart', 'CART_UPDATE_ERROR');
  }

  return data.cartLinesUpdate.cart;
}

/**
 * Remove a line from the cart
 */
export async function removeCartLine(lineId: string): Promise<ShopifyCart> {
  const cartId = getStoredCartId();
  if (!cartId) {
    throw new ShopifyError('No cart found', 'NO_CART');
  }

  const data = await shopifyFetch<CartLinesRemoveResponse>(REMOVE_CART_LINES, {
    cartId,
    lineIds: [lineId],
  });

  if (data.cartLinesRemove.userErrors.length > 0) {
    const error = data.cartLinesRemove.userErrors[0];
    throw new ShopifyError(error.message, 'CART_REMOVE_ERROR');
  }

  if (!data.cartLinesRemove.cart) {
    throw new ShopifyError('Failed to remove from cart', 'CART_REMOVE_ERROR');
  }

  return data.cartLinesRemove.cart;
}

/**
 * Remove multiple lines from the cart
 */
export async function removeCartLines(lineIds: string[]): Promise<ShopifyCart> {
  const cartId = getStoredCartId();
  if (!cartId) {
    throw new ShopifyError('No cart found', 'NO_CART');
  }

  const data = await shopifyFetch<CartLinesRemoveResponse>(REMOVE_CART_LINES, {
    cartId,
    lineIds,
  });

  if (data.cartLinesRemove.userErrors.length > 0) {
    const error = data.cartLinesRemove.userErrors[0];
    throw new ShopifyError(error.message, 'CART_REMOVE_ERROR');
  }

  if (!data.cartLinesRemove.cart) {
    throw new ShopifyError('Failed to remove lines from cart', 'CART_REMOVE_ERROR');
  }

  return data.cartLinesRemove.cart;
}

/**
 * Clear the cart (by removing all lines)
 */
export async function clearCart(): Promise<ShopifyCart | null> {
  const cart = await getCart();
  if (!cart) {
    return null;
  }

  const lineIds = cart.lines.edges.map(edge => edge.node.id);
  if (lineIds.length === 0) {
    return cart;
  }

  return removeCartLines(lineIds);
}

/**
 * Get the checkout URL for the current cart
 */
export async function getCheckoutUrl(): Promise<string | null> {
  const cart = await getCart();
  return cart?.checkoutUrl || null;
}

/**
 * Reset the cart (clear stored ID, will create new cart on next operation)
 */
export function resetCart(): void {
  clearStoredCartId();
}
