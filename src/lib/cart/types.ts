/**
 * Cart Types - WooCommerce-Ready Structure
 * =========================================
 * 
 * Clean, typed cart payload structures ready for WooCommerce integration.
 * All types are JSON serializable for localStorage and API transport.
 */

import type { VerandaProductSize } from '../../configurator/pricing/verandapricing';

// =============================================================================
// PRODUCT IDENTIFIERS
// =============================================================================

/** Product category identifier */
export type ProductCategory = 'verandas' | 'sandwichpanelen' | 'accessoires';

// =============================================================================
// ATTRIBUTE & PRICE LINE TYPES
// =============================================================================

/**
 * Single attribute on a cart item
 * Used for displaying selected options in cart/checkout
 */
export interface CartItemAttribute {
  /** Machine-readable key (e.g., 'voorzijde', 'zijwand_links') */
  key: string;
  /** Human-readable label (e.g., 'Voorzijde', 'Zijwand links') */
  label: string;
  /** Human-readable value (e.g., 'Glazen schuifwanden') */
  value: string;
  /** Optional machine-readable value ID (e.g., 'glas_schuifwand') */
  valueId?: string;
}

/**
 * Single price line item for breakdown display
 * Only includes options that have a price > 0
 * 
 * NOTE: daktype and goot are NEVER included as they are always €0
 */
export interface CartPriceLine {
  /** Machine-readable key (e.g., 'voorzijde') */
  key: string;
  /** Human-readable label (e.g., 'Voorzijde') */
  label: string;
  /** Human-readable value (e.g., 'Glazen schuifwanden') */
  value: string;
  /** Price amount in cents or whole euros */
  amount: number;
}

// =============================================================================
// RAW CONFIG TYPE
// =============================================================================

/**
 * Raw veranda configuration as selected by user
 * Stored for reference and potential recalculation
 */
export interface VerandaRawConfig {
  daktype: string;
  voorzijde?: string;
  zijwand_links?: string;
  zijwand_rechts?: string;
  goot: string;
  verlichting?: boolean;
}

// =============================================================================
// CART ITEM PAYLOAD
// =============================================================================

/**
 * Complete cart item payload structure
 * 
 * This is the main type for cart items. It contains:
 * - Product identification (id, sku, slug, title)
 * - Quantity and size
 * - Pricing (basePrice, optionsTotal, totalPrice)
 * - Attributes for display
 * - Price lines for breakdown
 * - Raw config for reference
 * - Timestamps
 */
export interface CartItemPayload {
  /** Unique cart line item ID (UUID) */
  id: string;
  
  /** Product category */
  category: ProductCategory;
  
  /** WooCommerce product ID (or local ID) */
  productId: string;
  
  /** SKU if available */
  sku?: string;
  
  /** URL slug for linking */
  slug: string;
  
  /** Product title for display */
  title: string;
  
  /** Quantity (typically 1 for verandas) */
  quantity: number;
  
  /** 
   * Veranda size identifier
   * Required for verandas, undefined for other categories
   */
  verandaSize?: VerandaProductSize;
  
  // ---------------------------------------------------------------------------
  // PRICING
  // ---------------------------------------------------------------------------
  
  /** Base price of product (from product or WooCommerce) */
  basePrice: number;
  
  /** 
   * Total of all option surcharges
   * NOTE: daktype and goot are ALWAYS €0 and NOT included
   */
  optionsTotal: number;
  
  /** Grand total: basePrice + optionsTotal */
  totalPrice: number;
  
  // ---------------------------------------------------------------------------
  // ATTRIBUTES & PRICE LINES
  // ---------------------------------------------------------------------------
  
  /** 
   * All selected attributes for display
   * Includes ALL selections (even €0 ones like daktype and goot)
   */
  attributes: CartItemAttribute[];
  
  /**
   * Price breakdown lines
   * ONLY includes options with price > 0
   * daktype and goot NEVER appear here (always €0)
   */
  priceLines: CartPriceLine[];
  
  // ---------------------------------------------------------------------------
  // RAW DATA
  // ---------------------------------------------------------------------------
  
  /** 
   * Raw configuration object for reference
   * Used for recalculation or modification
   */
  rawConfig: VerandaRawConfig | Record<string, unknown>;
  
  /** ISO timestamp when item was added to cart */
  createdAt: string;
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Check if payload is for a veranda product
 */
export function isVerandaPayload(payload: CartItemPayload): boolean {
  return payload.category === 'verandas' && payload.verandaSize !== undefined;
}

/**
 * Check if a raw config is a veranda config
 */
export function isVerandaRawConfig(config: unknown): config is VerandaRawConfig {
  if (!config || typeof config !== 'object') return false;
  const c = config as Record<string, unknown>;
  return typeof c.daktype === 'string' && typeof c.goot === 'string';
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate a cart item payload has required fields
 */
export function validateCartItemPayload(payload: unknown): payload is CartItemPayload {
  if (!payload || typeof payload !== 'object') return false;
  
  const p = payload as Record<string, unknown>;
  
  // Required string fields
  if (typeof p.id !== 'string' || !p.id) return false;
  if (typeof p.productId !== 'string' || !p.productId) return false;
  if (typeof p.slug !== 'string' || !p.slug) return false;
  if (typeof p.title !== 'string' || !p.title) return false;
  if (typeof p.createdAt !== 'string' || !p.createdAt) return false;
  
  // Required category
  if (!['verandas', 'sandwichpanelen', 'accessoires'].includes(p.category as string)) return false;
  
  // Required numbers
  if (typeof p.quantity !== 'number' || p.quantity < 1) return false;
  if (typeof p.basePrice !== 'number' || p.basePrice < 0) return false;
  if (typeof p.optionsTotal !== 'number' || p.optionsTotal < 0) return false;
  if (typeof p.totalPrice !== 'number' || p.totalPrice < 0) return false;
  
  // Required arrays
  if (!Array.isArray(p.attributes)) return false;
  if (!Array.isArray(p.priceLines)) return false;
  
  return true;
}
