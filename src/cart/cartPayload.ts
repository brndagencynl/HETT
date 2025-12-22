/**
 * Cart Payload Types
 * ===================
 * 
 * WooCommerce-ready cart payload structures.
 * These types define the shape of cart items for storage and API integration.
 * 
 * IMPORTANT:
 * - All payloads must be JSON serializable (storable in localStorage)
 * - Structure maps 1-to-1 to future WooCommerce cart item meta
 * - productSize is stored separately from configuration selection
 */

import type { VerandaProductSize } from '../configurator/pricing/verandapricing';
import type { 
  PriceBreakdown, 
  ReadableSelection, 
  VerandaSelection 
} from '../pricing/pricingHelpers';

// =============================================================================
// PRODUCT KIND
// =============================================================================

/**
 * Product category/kind identifier
 * Used to determine which pricing logic and UI to apply
 */
export type ProductKind = 'veranda' | 'sandwichpanelen' | 'accessoires';

// =============================================================================
// VERANDA CONFIGURATION PAYLOAD
// =============================================================================

/**
 * Veranda configuration stored in cart
 * Separates type identifier from actual selection data
 */
export interface VerandaConfigurationPayload {
  /** Type discriminator for configuration parsing */
  type: 'veranda-config';
  
  /** 
   * User selections (WITHOUT productSize)
   * productSize is stored at cart item level, not in config
   */
  selection: VerandaSelection;
  
  /** Human-readable summary of selections with labels and prices */
  readableSummary: ReadableSelection[];
}

// =============================================================================
// PRICING SNAPSHOT
// =============================================================================

/**
 * Frozen pricing at moment of add-to-cart
 * 
 * Prices are captured at add time because:
 * - Prices may change over time
 * - Cart must reflect price when item was added
 * - WooCommerce will validate on checkout
 */
export interface PricingSnapshot {
  /** Base price of the product (from verandapricing.ts or WooCommerce) */
  basePrice: number;
  
  /** Total of all selected options */
  optionsTotal: number;
  
  /** Grand total (basePrice + optionsTotal) */
  total: number;
  
  /** Full breakdown for display and verification */
  breakdown: PriceBreakdown;
  
  /** ISO timestamp when price was calculated */
  calculatedAt: string;
  
  /** Currency code */
  currency: 'EUR';
}

// =============================================================================
// CART ITEM PAYLOAD (Before ID assignment)
// =============================================================================

/**
 * Base cart item payload for veranda products
 * 
 * This is the payload structure BEFORE cart item ID is assigned.
 * Used as input to buildCartItem()
 */
export interface VerandaCartItemPayload {
  /** External product ID (WooCommerce product ID or local ID) */
  productId: string;
  
  /** Product kind discriminator */
  kind: 'veranda';
  
  /** Product size - determines base price and size-dependent option prices */
  size: VerandaProductSize;
  
  /** Quantity (typically 1 for verandas) */
  quantity: number;
  
  /** Configuration selection with readable summary */
  configuration: VerandaConfigurationPayload;
  
  /** Frozen pricing snapshot */
  pricing: PricingSnapshot;
  
  /** Optional metadata for future extensibility */
  meta?: Record<string, unknown>;
}

/**
 * Generic cart item payload union
 * Extend with other product kinds as needed
 */
export type CartItemPayload = 
  | VerandaCartItemPayload
  // | SandwichpanelenCartItemPayload  // Future
  // | AccessoiresCartItemPayload      // Future
  ;

// =============================================================================
// CART ITEM (With ID and timestamp)
// =============================================================================

/**
 * Complete cart item with unique ID and timestamp
 * 
 * This is the final structure stored in cart state and localStorage
 */
export interface VerandaCartItem extends VerandaCartItemPayload {
  /** Unique cart item identifier (UUID) */
  id: string;
  
  /** ISO timestamp when item was added to cart */
  addedAt: string;
}

/**
 * Generic cart item union
 */
export type CartItem = 
  | VerandaCartItem
  // | SandwichpanelenCartItem  // Future
  // | AccessoiresCartItem      // Future
  ;

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Check if a cart item is a veranda item
 */
export function isVerandaCartItem(item: CartItem): item is VerandaCartItem {
  return item.kind === 'veranda';
}

/**
 * Check if a payload is a veranda payload
 */
export function isVerandaPayload(payload: CartItemPayload): payload is VerandaCartItemPayload {
  return payload.kind === 'veranda';
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate a veranda cart item payload has all required fields
 * Throws if validation fails
 */
export function validateVerandaPayload(payload: unknown): asserts payload is VerandaCartItemPayload {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload must be an object');
  }

  const p = payload as Record<string, unknown>;

  if (typeof p.productId !== 'string' || !p.productId) {
    throw new Error('productId is required and must be a non-empty string');
  }

  if (p.kind !== 'veranda') {
    throw new Error('kind must be "veranda"');
  }

  if (typeof p.size !== 'string' || !p.size) {
    throw new Error('size is required and must be a valid VerandaProductSize');
  }

  if (typeof p.quantity !== 'number' || p.quantity < 1) {
    throw new Error('quantity must be a positive number');
  }

  if (!p.configuration || typeof p.configuration !== 'object') {
    throw new Error('configuration is required');
  }

  const config = p.configuration as Record<string, unknown>;
  if (config.type !== 'veranda-config') {
    throw new Error('configuration.type must be "veranda-config"');
  }

  if (!p.pricing || typeof p.pricing !== 'object') {
    throw new Error('pricing snapshot is required');
  }

  const pricing = p.pricing as Record<string, unknown>;
  if (typeof pricing.basePrice !== 'number') {
    throw new Error('pricing.basePrice is required');
  }
  if (typeof pricing.total !== 'number') {
    throw new Error('pricing.total is required');
  }
}

// =============================================================================
// SERIALIZATION HELPERS
// =============================================================================

/**
 * Serialize cart item to JSON string for storage
 */
export function serializeCartItem(item: CartItem): string {
  return JSON.stringify(item);
}

/**
 * Deserialize cart item from JSON string
 * Returns null if parsing fails
 */
export function deserializeCartItem(json: string): CartItem | null {
  try {
    const parsed = JSON.parse(json);
    // Basic structure check
    if (parsed && typeof parsed === 'object' && 'id' && 'kind' in parsed) {
      return parsed as CartItem;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Serialize array of cart items
 */
export function serializeCart(items: CartItem[]): string {
  return JSON.stringify(items);
}

/**
 * Deserialize array of cart items
 */
export function deserializeCart(json: string): CartItem[] {
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) {
      return parsed.filter(item => item && typeof item === 'object' && 'id' in item) as CartItem[];
    }
    return [];
  } catch {
    return [];
  }
}
