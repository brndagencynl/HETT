/**
 * Build Cart Item
 * ================
 * 
 * Builder functions to construct cart payloads and items.
 * All pricing calculations are delegated to verandapricing.ts via pricingHelpers.
 * 
 * NEVER hardcode prices here - all prices come from the pricing source of truth.
 */

import { 
  calculatePriceFromSelection, 
  getReadableSummaryFromSelection,
  type VerandaSelection,
} from '../pricing/pricingHelpers';

import type { VerandaProductSize } from '../configurator/pricing/verandapricing';

import {
  type VerandaCartItemPayload,
  type VerandaCartItem,
  type PricingSnapshot,
  type VerandaConfigurationPayload,
  validateVerandaPayload,
} from './cartPayload';

// =============================================================================
// UUID GENERATION
// =============================================================================

/**
 * Generate a UUID v4
 * Uses crypto API when available, falls back to Math.random
 */
function generateUUID(): string {
  // Use crypto API if available (browser and Node 14+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// =============================================================================
// BUILDER INPUT TYPES
// =============================================================================

/**
 * Input parameters for building a veranda cart payload
 */
export interface BuildVerandaCartPayloadParams {
  /** External product ID (WooCommerce product ID or local ID) */
  productId: string;
  
  /** Product size - REQUIRED, determines pricing */
  productSize: VerandaProductSize;
  
  /** Quantity (defaults to 1) */
  quantity?: number;
  
  /** 
   * Configuration selection (WITHOUT productSize)
   * productSize is passed separately
   */
  config: VerandaSelection;
  
  /** Optional base price override from WooCommerce */
  wooCommerceBasePrice?: number;
  
  /** Optional metadata */
  meta?: Record<string, unknown>;
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate build parameters
 * Throws descriptive errors if validation fails
 */
function validateBuildParams(params: BuildVerandaCartPayloadParams): void {
  if (!params.productId || typeof params.productId !== 'string') {
    throw new Error('buildVerandaCartPayload: productId is required and must be a non-empty string');
  }

  if (!params.productSize) {
    throw new Error('buildVerandaCartPayload: productSize is required');
  }

  // Validate productSize format
  const sizePattern = /^(500|600|700)x(250|300|350|400)$/;
  if (!sizePattern.test(params.productSize)) {
    throw new Error(`buildVerandaCartPayload: invalid productSize "${params.productSize}". Expected format: {500|600|700}x{250|300|350|400}`);
  }

  if (!params.config || typeof params.config !== 'object') {
    throw new Error('buildVerandaCartPayload: config is required and must be an object');
  }

  // Validate required config fields
  if (!params.config.daktype) {
    throw new Error('buildVerandaCartPayload: config.daktype is required');
  }

  if (!params.config.goot) {
    throw new Error('buildVerandaCartPayload: config.goot is required');
  }

  if (params.quantity !== undefined && (typeof params.quantity !== 'number' || params.quantity < 1)) {
    throw new Error('buildVerandaCartPayload: quantity must be a positive number');
  }
}

// =============================================================================
// PAYLOAD BUILDER
// =============================================================================

/**
 * Build a complete veranda cart payload
 * 
 * This is the main entry point for creating cart payloads.
 * All pricing is calculated using verandapricing.ts via pricingHelpers.
 * 
 * @param params - Build parameters
 * @returns Complete cart item payload (without id and addedAt)
 * 
 * @example
 * const payload = buildVerandaCartPayload({
 *   productId: 'veranda-600x300',
 *   productSize: '600x300',
 *   config: {
 *     daktype: 'poly_opaal',
 *     voorzijde: 'glas_schuifwand',
 *     zijwand_links: 'geen',
 *     zijwand_rechts: 'poly_spie',
 *     goot: 'cube',
 *     verlichting: true,
 *   },
 * });
 */
export function buildVerandaCartPayload(
  params: BuildVerandaCartPayloadParams
): VerandaCartItemPayload {
  // Validate input
  validateBuildParams(params);

  const {
    productId,
    productSize,
    quantity = 1,
    config,
    wooCommerceBasePrice,
    meta,
  } = params;

  // Calculate pricing using verandapricing.ts
  const breakdown = calculatePriceFromSelection(
    productSize,
    config,
    wooCommerceBasePrice
  );

  // Get readable summary for display
  const readableSummary = getReadableSummaryFromSelection(productSize, config);

  // Build configuration payload
  const configuration: VerandaConfigurationPayload = {
    type: 'veranda-config',
    selection: { ...config },
    readableSummary,
  };

  // Build pricing snapshot (frozen at add-to-cart time)
  const pricing: PricingSnapshot = {
    basePrice: breakdown.base.amount,
    optionsTotal: breakdown.optionsTotal,
    total: breakdown.total,
    breakdown,
    calculatedAt: new Date().toISOString(),
    currency: 'EUR',
  };

  // Construct payload
  const payload: VerandaCartItemPayload = {
    productId,
    kind: 'veranda',
    size: productSize,
    quantity,
    configuration,
    pricing,
  };

  // Add optional meta
  if (meta && Object.keys(meta).length > 0) {
    payload.meta = meta;
  }

  // Validate the constructed payload
  validateVerandaPayload(payload);

  return payload;
}

// =============================================================================
// CART ITEM BUILDER
// =============================================================================

/**
 * Build a complete cart item from a payload
 * Adds unique ID and timestamp
 * 
 * @param payload - Cart item payload (without id and addedAt)
 * @returns Complete cart item ready for storage
 */
export function buildCartItem(payload: VerandaCartItemPayload): VerandaCartItem {
  // Validate payload before adding metadata
  validateVerandaPayload(payload);

  return {
    ...payload,
    id: generateUUID(),
    addedAt: new Date().toISOString(),
  };
}

/**
 * Convenience function: Build complete cart item in one step
 * Combines buildVerandaCartPayload and buildCartItem
 * 
 * @param params - Build parameters (same as buildVerandaCartPayload)
 * @returns Complete cart item with ID and timestamp
 */
export function buildVerandaCartItem(
  params: BuildVerandaCartPayloadParams
): VerandaCartItem {
  const payload = buildVerandaCartPayload(params);
  return buildCartItem(payload);
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Recalculate pricing for an existing cart item
 * Useful if prices have been updated and you need to verify
 * 
 * Note: This creates a NEW pricing snapshot, not mutating the original
 */
export function recalculatePricing(
  item: VerandaCartItem,
  wooCommerceBasePrice?: number
): PricingSnapshot {
  const breakdown = calculatePriceFromSelection(
    item.size,
    item.configuration.selection,
    wooCommerceBasePrice
  );

  return {
    basePrice: breakdown.base.amount,
    optionsTotal: breakdown.optionsTotal,
    total: breakdown.total,
    breakdown,
    calculatedAt: new Date().toISOString(),
    currency: 'EUR',
  };
}

/**
 * Calculate line total for a cart item (price × quantity)
 */
export function calculateLineTotal(item: VerandaCartItem): number {
  return item.pricing.total * item.quantity;
}

/**
 * Get formatted display price for a cart item
 */
export function getDisplayPrice(item: VerandaCartItem): string {
  const { formatMoney } = require('../pricing/pricingHelpers');
  return formatMoney(item.pricing.total);
}

/**
 * Get formatted line total for a cart item
 */
export function getDisplayLineTotal(item: VerandaCartItem): string {
  const { formatMoney } = require('../pricing/pricingHelpers');
  return formatMoney(calculateLineTotal(item));
}
