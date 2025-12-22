/**
 * Cart Module - Public API
 * =========================
 * 
 * Re-exports all cart types and helpers for easy importing.
 * 
 * @example
 * import { buildVerandaCartItem, CartItemPayload } from '@/src/lib/cart';
 */

// Types
export type {
  ProductCategory,
  CartItemAttribute,
  CartPriceLine,
  VerandaRawConfig,
  CartItemPayload,
} from './types';

export {
  isVerandaPayload,
  isVerandaRawConfig,
  validateCartItemPayload,
} from './types';

// Helpers
export type { BuildVerandaCartItemParams } from './helpers';

export {
  buildVerandaCartItem,
  calculateCartTotals,
  formatPrice,
  getSizeLabel,
} from './helpers';
