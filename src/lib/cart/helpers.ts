/**
 * Cart Helpers - Build Cart Items
 * ================================
 * 
 * Helper functions to build WooCommerce-ready cart payloads.
 * Uses verandapricing.ts as single source of truth for all pricing.
 * 
 * IMPORTANT RULES:
 * - daktype is ALWAYS FREE (€0) - never appears in priceLines
 * - goot options are ALWAYS FREE (€0) - never appear in priceLines
 * - priceLines only contains items with price > 0
 * - attributes contains ALL selections for display
 */

import {
  calculateVerandaPrice,
  getBasePrice,
  findOptionChoice,
  VERANDA_OPTION_GROUPS,
  type VerandaProductSize,
  type VerandaPricingConfig,
} from '../../configurator/pricing/verandapricing';

import type {
  CartItemPayload,
  CartItemAttribute,
  CartPriceLine,
  VerandaRawConfig,
} from './types';

// =============================================================================
// UUID GENERATION
// =============================================================================

/**
 * Generate a UUID v4 for cart item IDs
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// =============================================================================
// BUILD VERANDA CART ITEM
// =============================================================================

/**
 * Input parameters for building a veranda cart item
 */
export interface BuildVerandaCartItemParams {
  /** Product title for display */
  title: string;
  
  /** URL slug for linking */
  slug: string;
  
  /** WooCommerce product ID (optional, defaults to slug) */
  productId?: string;
  
  /** SKU if available */
  sku?: string;
  
  /** Veranda size - REQUIRED for price calculation */
  size: VerandaProductSize;
  
  /** Quantity (defaults to 1) */
  quantity?: number;
  
  /** User selections from configurator */
  selections: {
    daktype: string;
    voorzijde?: string;
    zijwand_links?: string;
    zijwand_rechts?: string;
    goot: string;
    verlichting?: boolean;
  };
  
  /** Optional WooCommerce base price override */
  wooCommerceBasePrice?: number;
}

/**
 * Option groups that are ALWAYS FREE and should never be in priceLines
 * These are included in attributes for display but excluded from pricing breakdown
 */
const ALWAYS_FREE_GROUPS = ['daktype', 'goot'] as const;

/**
 * Build a complete cart item payload for a veranda product
 * 
 * This function:
 * 1. Builds full config from productSize + selections
 * 2. Calculates pricing using verandapricing.ts
 * 3. Builds attributes array (ALL selections)
 * 4. Builds priceLines array (ONLY options with price > 0)
 * 5. Enforces that daktype and goot NEVER appear in priceLines
 * 
 * @param params - Build parameters
 * @returns Complete CartItemPayload ready for cart store
 */
export function buildVerandaCartItem(params: BuildVerandaCartItemParams): CartItemPayload {
  const {
    title,
    slug,
    productId = slug,
    sku,
    size,
    quantity = 1,
    selections,
    wooCommerceBasePrice,
  } = params;

  // Validate required fields
  if (!title) throw new Error('buildVerandaCartItem: title is required');
  if (!slug) throw new Error('buildVerandaCartItem: slug is required');
  if (!size) throw new Error('buildVerandaCartItem: size is required');
  if (!selections.daktype) throw new Error('buildVerandaCartItem: selections.daktype is required');
  if (!selections.goot) throw new Error('buildVerandaCartItem: selections.goot is required');

  // Build full pricing config
  const pricingConfig: VerandaPricingConfig = {
    productSize: size,
    daktype: selections.daktype,
    voorzijde: selections.voorzijde,
    zijwand_links: selections.zijwand_links,
    zijwand_rechts: selections.zijwand_rechts,
    goot: selections.goot,
    verlichting: selections.verlichting,
  };

  // Calculate pricing using verandapricing.ts as single source of truth
  const priceResult = calculateVerandaPrice(pricingConfig, wooCommerceBasePrice);

  // Build attributes array - ALL selections for display
  const attributes: CartItemAttribute[] = [];
  const priceLines: CartPriceLine[] = [];

  // Process each option group
  const optionMappings: { groupId: string; value: string | boolean | undefined }[] = [
    { groupId: 'daktype', value: selections.daktype },
    { groupId: 'goot', value: selections.goot },
    { groupId: 'voorzijde', value: selections.voorzijde },
    { groupId: 'zijwand_links', value: selections.zijwand_links },
    { groupId: 'zijwand_rechts', value: selections.zijwand_rechts },
    { groupId: 'verlichting', value: selections.verlichting },
  ];

  for (const { groupId, value } of optionMappings) {
    // Skip undefined values
    if (value === undefined) continue;
    
    // Skip 'geen' and false for attributes (they mean "no selection")
    if (value === 'geen' || value === false) continue;

    const group = VERANDA_OPTION_GROUPS.find(g => g.id === groupId);
    if (!group) continue;

    let choiceId: string;
    let choiceLabel: string;

    if (typeof value === 'boolean' && value) {
      // Boolean toggle - use first choice
      const choice = group.choices[0];
      if (!choice) continue;
      choiceId = choice.id;
      choiceLabel = choice.labelNL;
    } else if (typeof value === 'string') {
      const choice = group.choices.find(c => c.id === value);
      if (!choice) continue;
      choiceId = choice.id;
      choiceLabel = choice.labelNL;
    } else {
      continue;
    }

    // Add to attributes (ALL selections)
    attributes.push({
      key: groupId,
      label: group.labelNL,
      value: choiceLabel,
      valueId: choiceId,
    });

    // Find the price line from pricing result
    // ONLY add to priceLines if:
    // 1. The item has price > 0
    // 2. The group is NOT in ALWAYS_FREE_GROUPS (daktype, goot)
    const priceLine = priceResult.items.find(
      item => item.groupId === groupId && item.choiceId === choiceId
    );

    // ENFORCE: daktype and goot are ALWAYS FREE - never add to priceLines
    const isAlwaysFree = (ALWAYS_FREE_GROUPS as readonly string[]).includes(groupId);
    
    if (priceLine && priceLine.price > 0 && !isAlwaysFree) {
      priceLines.push({
        key: groupId,
        label: group.labelNL,
        value: choiceLabel,
        amount: priceLine.price,
      });
    }
  }

  // Build raw config for storage
  const rawConfig: VerandaRawConfig = {
    daktype: selections.daktype,
    voorzijde: selections.voorzijde,
    zijwand_links: selections.zijwand_links,
    zijwand_rechts: selections.zijwand_rechts,
    goot: selections.goot,
    verlichting: selections.verlichting,
  };

  // Calculate totals
  // Note: optionsTotal from verandapricing.ts already excludes €0 items
  const basePrice = priceResult.basePrice;
  const optionsTotal = priceResult.optionsTotal;
  const totalPrice = priceResult.grandTotal * quantity;

  // Build final payload
  const payload: CartItemPayload = {
    id: generateUUID(),
    category: 'verandas',
    productId,
    slug,
    title,
    quantity,
    verandaSize: size,
    basePrice,
    optionsTotal,
    totalPrice,
    attributes,
    priceLines,
    rawConfig,
    createdAt: new Date().toISOString(),
  };

  // Add optional sku
  if (sku) {
    payload.sku = sku;
  }

  return payload;
}

// =============================================================================
// CART CALCULATIONS
// =============================================================================

/**
 * Calculate cart totals from array of cart items
 */
export function calculateCartTotals(items: CartItemPayload[]): {
  subtotal: number;
  itemCount: number;
} {
  return {
    subtotal: items.reduce((sum, item) => sum + item.totalPrice, 0),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

/**
 * Format price for display (Dutch format)
 */
export function formatPrice(amount: number): string {
  const formatted = amount.toLocaleString('nl-NL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `€ ${formatted},-`;
}

/**
 * Get human-readable size label
 */
export function getSizeLabel(size: VerandaProductSize): string {
  const [width, depth] = size.split('x');
  return `${width} × ${depth} cm`;
}
