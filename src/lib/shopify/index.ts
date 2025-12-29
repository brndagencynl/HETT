/**
 * Shopify Storefront API - Public Exports
 */

// Client
export { shopifyFetch, ShopifyError, isShopifyConfigured, getShopifyDomain } from './client';

// Types
export type {
  ShopifyProduct,
  ShopifyProductVariant,
  ShopifyCollection,
  ShopifyCart,
  ShopifyCartLine,
  ShopifyCartLineAttribute,
  ShopifyMoney,
  ShopifyImage,
  CartLineInput,
  CartLineUpdateInput,
} from './types';

// Products
export {
  getCollectionProducts,
  getAllCollectionProducts,
  getProductByHandle,
  getProductVariantId,
  searchProducts,
  getAllProducts,
  transformShopifyProduct,
} from './products';

// Cart Store
export {
  getCart,
  createCart,
  ensureCart,
  addToCart,
  addLinesToCart,
  updateCartLine,
  removeCartLine,
  removeCartLines,
  clearCart,
  getCheckoutUrl,
  resetCart,
} from './cartStore';

// Checkout
export { beginCheckout, redirectToShopifyCheckout } from './beginCheckout';
export type { BeginCheckoutOptions, BeginCheckoutResult } from './beginCheckout';

// Queries (for advanced usage)
export * from './queries';
