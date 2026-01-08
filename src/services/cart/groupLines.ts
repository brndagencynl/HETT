/**
 * Cart Line Grouping Service
 * ==========================
 * 
 * Groups Shopify cart lines by config_id to prevent duplicate display.
 * 
 * Line Types (identified by _kind attribute, with legacy fallbacks):
 * - Main product lines: _kind === 'main_product' OR normal products
 * - Surcharge lines: _kind === 'config_surcharge' OR legacy 'config_surcharge_step'
 * - LED addon lines: _kind === 'led_addon' OR legacy addon === 'led_spots'
 * 
 * Output:
 * - mainLines: Products to show as cards
 * - addons: LED lines to show as addon cards
 * - surchargesByConfigId: Aggregated surcharges grouped by _config_id
 * - ungroupedSurcharges: Surcharge lines without config_id (warning state)
 */

// =============================================================================
// TYPES
// =============================================================================

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title?: string;
    product?: {
      title?: string;
      handle?: string;
    };
  };
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
    amountPerQuantity?: {
      amount: string;
      currencyCode: string;
    };
  };
  attributes: Array<{
    key: string;
    value: string;
  }>;
}

export interface GroupedSurcharge {
  configId: string;
  totalAmountCents: number;
  totalAmountEur: number;
  stepLines: ShopifyCartLine[];
  configSummary: string;
  productTitles: string[];
}

export interface GroupedCartLines {
  /** Main product lines (everything that's not a surcharge or LED addon) */
  mainLines: ShopifyCartLine[];
  /** LED addon lines */
  addons: ShopifyCartLine[];
  /** Surcharges grouped by config_id */
  surchargesByConfigId: Map<string, GroupedSurcharge>;
  /** Surcharge lines that couldn't be grouped (missing config_id) */
  ungroupedSurcharges: ShopifyCartLine[];
  /** Whether there are ungrouped surcharges (show warning) */
  hasUngroupedSurcharges: boolean;
  /** Total of ALL surcharges (grouped + ungrouped) in cents */
  totalSurchargeCents: number;
  /** Total of ALL surcharges in EUR */
  totalSurchargeEur: number;
}

// =============================================================================
// ATTRIBUTE PARSING HELPERS
// =============================================================================

/**
 * Parse attributes array into a key/value map
 */
export function parseAttributes(attributes: Array<{ key: string; value: string }>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const attr of attributes) {
    result[attr.key] = attr.value;
  }
  return result;
}

/**
 * Check if a line is a config surcharge step line
 * Supports both new prefixed (_kind) and legacy (kind) keys
 * Identified by: _kind === 'config_surcharge' OR kind === 'config_surcharge_step'
 */
export function isConfigSurchargeLine(attributes: Record<string, string>): boolean {
  return attributes['_kind'] === 'config_surcharge' ||
         attributes['kind'] === 'config_surcharge_step' || 
         (attributes['Toelichting'] && !attributes['addon'] && !attributes['Aantal spots']);
}

/**
 * Check if a line is an LED addon line
 * Supports both new prefixed (_kind) and legacy (addon) keys
 * Identified by: _kind === 'led_addon' OR addon === 'led_spots' OR has 'Aantal spots'
 */
export function isLedAddonLine(attributes: Record<string, string>): boolean {
  return attributes['_kind'] === 'led_addon' ||
         attributes['kind'] === 'led_addon' ||
         attributes['addon'] === 'led_spots' ||
         'Aantal spots' in attributes;
}

/**
 * Get config_id from attributes
 * Supports both new prefixed (_config_id) and legacy (config_id) keys
 */
export function getConfigId(attributes: Record<string, string>): string | null {
  return attributes['_config_id'] || attributes['config_id'] || null;
}

// =============================================================================
// MAIN GROUPING FUNCTION
// =============================================================================

/**
 * Group Shopify cart lines by type and config_id
 * 
 * @param lines - Shopify cart lines from API response
 * @returns Grouped cart lines structure
 */
export function groupCartLines(lines: ShopifyCartLine[]): GroupedCartLines {
  const mainLines: ShopifyCartLine[] = [];
  const addons: ShopifyCartLine[] = [];
  const surchargesByConfigId = new Map<string, GroupedSurcharge>();
  const ungroupedSurcharges: ShopifyCartLine[] = [];
  
  console.log('[groupCartLines] Processing', lines.length, 'lines');
  
  for (const line of lines) {
    const attrMap = parseAttributes(line.attributes);
    
    // Determine line type
    if (isLedAddonLine(attrMap)) {
      // LED addon line
      console.log('[groupCartLines] LED addon:', line.merchandise.product?.title || 'LED Spots');
      addons.push(line);
    } else if (isConfigSurchargeLine(attrMap)) {
      // Config surcharge step line
      const configId = getConfigId(attrMap);
      const amountCents = Math.round(parseFloat(line.cost.totalAmount.amount) * 100);
      
      console.log('[groupCartLines] Surcharge line:', {
        configId,
        amountCents,
        qty: line.quantity,
      });
      
      if (configId) {
        // Group by config_id
        const existing = surchargesByConfigId.get(configId);
        if (existing) {
          existing.totalAmountCents += amountCents;
          existing.totalAmountEur = existing.totalAmountCents / 100;
          existing.stepLines.push(line);
        } else {
          // Extract product titles and summary from Toelichting
          const toelichting = attrMap['Toelichting'] || '';
          const lines = toelichting.split('\n').filter(l => l.trim());
          const productTitles = lines.filter(l => !l.startsWith('Opties:'));
          const summaryLines = lines.filter(l => l.startsWith('Opties:'));
          
          surchargesByConfigId.set(configId, {
            configId,
            totalAmountCents: amountCents,
            totalAmountEur: amountCents / 100,
            stepLines: [line],
            configSummary: summaryLines.join(', ').replace('Opties: ', ''),
            productTitles,
          });
        }
      } else {
        // No config_id - can't group
        console.warn('[groupCartLines] Surcharge without config_id:', line.id);
        ungroupedSurcharges.push(line);
      }
    } else {
      // Main product line
      console.log('[groupCartLines] Main product:', line.merchandise.product?.title || 'Product');
      mainLines.push(line);
    }
  }
  
  // Calculate totals
  let totalSurchargeCents = 0;
  
  for (const group of surchargesByConfigId.values()) {
    totalSurchargeCents += group.totalAmountCents;
  }
  
  for (const line of ungroupedSurcharges) {
    totalSurchargeCents += Math.round(parseFloat(line.cost.totalAmount.amount) * 100);
  }
  
  const result: GroupedCartLines = {
    mainLines,
    addons,
    surchargesByConfigId,
    ungroupedSurcharges,
    hasUngroupedSurcharges: ungroupedSurcharges.length > 0,
    totalSurchargeCents,
    totalSurchargeEur: totalSurchargeCents / 100,
  };
  
  console.log('[groupCartLines] Result:', {
    mainLines: mainLines.length,
    addons: addons.length,
    groupedSurcharges: surchargesByConfigId.size,
    ungroupedSurcharges: ungroupedSurcharges.length,
    totalSurchargeCents,
  });
  
  return result;
}

// =============================================================================
// LOCAL CART GROUPING (for CartContext items)
// =============================================================================

import type { CartItem } from '../../../types';
import { isShippingLineItem, type ShippingLineItem } from '../shipping';
import type { LedLineItem } from '../addons/led';

export interface LocalGroupedCart {
  /** Main product items */
  products: CartItem[];
  /** Shipping line (if present) */
  shipping: ShippingLineItem | null;
  /** LED line (computed, not stored in cart) */
  led: LedLineItem | null;
  /** Products subtotal in cents (excluding shipping and LED) */
  productsSubtotalCents: number;
  /** LED subtotal in cents */
  ledSubtotalCents: number;
  /** Shipping subtotal in cents */
  shippingSubtotalCents: number;
  /** Grand total in cents */
  grandTotalCents: number;
}

/**
 * Group local cart items by type
 * Note: Surcharges are NOT stored in local cart - they're computed at checkout
 */
export function groupLocalCart(
  cart: CartItem[],
  ledLineItem: LedLineItem | null
): LocalGroupedCart {
  const products: CartItem[] = [];
  let shipping: ShippingLineItem | null = null;
  
  for (const item of cart) {
    if (isShippingLineItem(item)) {
      shipping = item as ShippingLineItem;
    } else {
      products.push(item);
    }
  }
  
  // Calculate subtotals
  const productsSubtotalCents = products.reduce(
    (sum, item) => sum + (item.lineTotalCents || 0),
    0
  );
  const ledSubtotalCents = ledLineItem?.lineTotalCents || 0;
  const shippingSubtotalCents = shipping?.lineTotalCents || 0;
  
  return {
    products,
    shipping,
    led: ledLineItem,
    productsSubtotalCents,
    ledSubtotalCents,
    shippingSubtotalCents,
    grandTotalCents: productsSubtotalCents + ledSubtotalCents + shippingSubtotalCents,
  };
}
