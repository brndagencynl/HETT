/**
 * Cart Bundle Grouping Utility
 * ============================
 * 
 * Groups related cart lines into "bundles" for display purposes.
 * A bundle consists of:
 * - 1 Main product line (the configurable product)
 * - 0-1 LED spots line (if verlichting enabled)
 * - 0-N Config surcharge step lines (price step variants for options)
 * 
 * This utility is used by CartDrawer and Cart page to render
 * bundled items as a single visual unit.
 * 
 * IMPORTANT: This works on the LOCAL cart (CartItem[]), not Shopify lines.
 * The bundle_key is used during checkout to link Shopify lines together.
 * For local cart display, we use item indices and config relationships.
 */

import type { CartItem } from '../../types';
import { formatEUR } from './money';

// =============================================================================
// TYPES
// =============================================================================

export interface CartBundle {
  /** Unique key for this bundle (for React keys) */
  key: string;
  /** The main product item */
  mainItem: CartItem;
  /** Index of main item in cart array */
  mainItemIndex: number;
  /** LED line item if applicable */
  ledItem?: {
    title: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
  };
  /** Options surcharge total from pricing breakdown */
  optionsSurchargeCents: number;
  /** Options surcharge breakdown for display */
  optionsSurchargeDetails?: Array<{
    label: string;
    valueCents: number;
  }>;
  /** Total bundle price (main + LED + options) - FOR DISPLAY ONLY */
  bundleTotalCents: number;
  /** Base product price (Shopify variant price, no options) */
  basePriceCents: number;
}

export interface GroupedCartResult {
  /** Grouped bundles for display */
  bundles: CartBundle[];
  /** Standalone items (accessories, etc.) */
  standaloneItems: Array<{ item: CartItem; index: number }>;
  /** LED line item (aggregated across all bundles) */
  ledLineItem?: {
    title: string;
    quantity: number;
    lineTotalCents: number;
  };
  /** Total of all bundles and standalone items */
  subtotalCents: number;
}

// =============================================================================
// LED PRICING CONSTANTS (import from ledPricing if needed)
// =============================================================================

const LED_UNIT_PRICE_CENTS = 2495; // €24.95 per spot

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a cart item is a configurable veranda (standard or maatwerk)
 */
function isConfigurableVeranda(item: CartItem): boolean {
  // Standard veranda
  if (item.config?.category === 'verandas') return true;
  // Maatwerk veranda
  if (item.type === 'custom_veranda' || item.maatwerkPayload) return true;
  return false;
}

/**
 * Check if item has LED (verlichting) enabled
 */
function hasLedEnabled(item: CartItem): boolean {
  // Standard veranda
  const config = item.config?.data as Record<string, unknown> | undefined;
  if (config?.verlichting === true) return true;
  
  // Maatwerk veranda
  const maatwerkLed = item.maatwerkPayload?.selections?.some(
    (s) => s.groupId === 'verlichting' && s.choiceId !== 'geen'
  );
  if (maatwerkLed) return true;
  
  return false;
}

/**
 * Extract LED spot count from cart item (based on width)
 */
function getLedSpotCount(item: CartItem): number {
  // Try to get from pricing breakdown first
  if (item.pricing?.breakdown) {
    const ledItem = item.pricing.breakdown.find(
      (pi) => pi.label?.toLowerCase().includes('led')
    );
    if (ledItem?.amount) {
      // Try to extract quantity from label like "LED (10×)" or similar
      const qtyMatch = ledItem.label.match(/\((\d+)/);
      if (qtyMatch) return parseInt(qtyMatch[1], 10);
    }
  }
  
  // Fallback: extract width and calculate
  const widthCm = extractWidthFromItem(item);
  if (widthCm) {
    return getLedSpotCountForWidth(widthCm);
  }
  
  return 0;
}

/**
 * Extract width from cart item
 */
function extractWidthFromItem(item: CartItem): number | null {
  // Maatwerk payload
  if (item.maatwerkPayload?.size?.width) {
    return item.maatwerkPayload.size.width;
  }
  
  // Config data
  const config = item.config?.data as Record<string, unknown> | undefined;
  if (config?.widthCm && typeof config.widthCm === 'number') {
    return config.widthCm;
  }
  if (config?.ledWidthCm && typeof config.ledWidthCm === 'number') {
    return config.ledWidthCm;
  }
  
  // Try to parse from handle
  const handle = item.handle || item.slug || item.id || '';
  const widthMatch = handle.match(/(\d{3,4})(?:-?x|-)/i);
  if (widthMatch) {
    return parseInt(widthMatch[1], 10);
  }
  
  return null;
}

/**
 * Get LED spot count for a given width (cm)
 * Based on the exact mapping from ledPricing.ts
 */
function getLedSpotCountForWidth(widthCm: number): number {
  const mapping: Record<number, number> = {
    306: 4, 406: 6, 506: 8, 606: 10, 706: 12,
    806: 14, 906: 16, 1006: 18, 1106: 20, 1206: 22,
  };
  
  // Find closest width
  const widths = Object.keys(mapping).map(Number).sort((a, b) => a - b);
  for (const w of widths) {
    if (widthCm <= w) return mapping[w];
  }
  return mapping[1206] || 22; // Max
}

/**
 * Get options surcharge from item's pricing breakdown
 * Returns total options surcharge in cents (excluding LED and base price)
 */
function getOptionsSurchargeCents(item: CartItem): { totalCents: number; details: Array<{ label: string; valueCents: number }> } {
  const details: Array<{ label: string; valueCents: number }> = [];
  let totalCents = 0;
  
  if (item.pricing?.breakdown) {
    for (const pi of item.pricing.breakdown) {
      // Skip base price, LED, and subtotal items
      const label = pi.label?.toLowerCase() || '';
      if (label.includes('basis') || label.includes('base')) continue;
      if (label.includes('led')) continue;
      if (label.includes('totaal') || label.includes('subtotaal')) continue;
      
      // This is an option surcharge
      const valueCents = Math.round((pi.amount || 0) * 100); // amount is in EUR
      if (valueCents > 0) {
        details.push({
          label: pi.label || 'Optie',
          valueCents,
        });
        totalCents += valueCents;
      }
    }
  }
  
  // Also check priceBreakdown (cast as any to handle unknown type)
  const priceBreakdown = item.priceBreakdown as { options?: Array<{ label: string; price: number }> } | undefined;
  if (priceBreakdown?.options) {
    for (const opt of priceBreakdown.options) {
      const valueCents = Math.round((opt.price || 0) * 100);
      if (valueCents > 0 && !details.some(d => d.label === opt.label)) {
        details.push({
          label: opt.label,
          valueCents,
        });
        totalCents += valueCents;
      }
    }
  }
  
  return { totalCents, details };
}

/**
 * Get base product price (Shopify variant price, without options)
 * This is what Shopify will charge for the main product line.
 */
function getBasePriceCents(item: CartItem): number {
  // If we have priceCents from product data, use that
  if (item.priceCents) return item.priceCents;
  
  // Try to extract from pricing breakdown
  if (item.pricing?.basePrice) {
    return Math.round(item.pricing.basePrice * 100);
  }
  
  // Try to find base in breakdown
  if (item.pricing?.breakdown) {
    const baseItem = item.pricing.breakdown.find(
      (pi) => pi.label?.toLowerCase().includes('basis') || pi.label?.toLowerCase().includes('base')
    );
    if (baseItem?.amount) return Math.round(baseItem.amount * 100);
  }
  
  // Fallback to price field
  if (item.price) return Math.round(item.price * 100);
  
  return 0;
}

// =============================================================================
// MAIN GROUPING FUNCTION
// =============================================================================

/**
 * Group cart items into bundles for display.
 * 
 * @param cartItems - Local cart items
 * @param ledLineItem - Optional LED line item from CartContext
 * @returns Grouped result with bundles and standalone items
 */
export function groupCartIntoBundles(
  cartItems: CartItem[],
  ledLineItem?: { title: string; quantity: number; lineTotalCents: number }
): GroupedCartResult {
  const bundles: CartBundle[] = [];
  const standaloneItems: Array<{ item: CartItem; index: number }> = [];
  
  let subtotalCents = 0;
  let totalLedQty = 0;
  let totalLedCents = 0;
  
  for (let i = 0; i < cartItems.length; i++) {
    const item = cartItems[i];
    
    // Skip shipping line items
    if (item.type === 'shipping') continue;
    
    // Check if this is a configurable veranda
    if (isConfigurableVeranda(item)) {
      // Get base price (Shopify variant price)
      const basePriceCents = getBasePriceCents(item);
      
      // Get options surcharge
      const { totalCents: optionsSurchargeCents, details: optionsDetails } = getOptionsSurchargeCents(item);
      
      // Calculate LED contribution if enabled
      let ledItem: CartBundle['ledItem'] | undefined;
      if (hasLedEnabled(item)) {
        const spotCount = getLedSpotCount(item);
        if (spotCount > 0) {
          const ledLineCents = spotCount * LED_UNIT_PRICE_CENTS * item.quantity;
          ledItem = {
            title: `LED Spots (${spotCount} stuks)`,
            quantity: spotCount,
            unitPriceCents: LED_UNIT_PRICE_CENTS,
            lineTotalCents: ledLineCents,
          };
          totalLedQty += spotCount * item.quantity;
          totalLedCents += ledLineCents;
        }
      }
      
      // Calculate bundle total
      // Main line = base price * quantity (no options included)
      // Options = surcharge * quantity
      // LED = already calculated
      const mainLineCents = basePriceCents * item.quantity;
      const optionsLineCents = optionsSurchargeCents * item.quantity;
      const ledLineCents = ledItem?.lineTotalCents || 0;
      const bundleTotalCents = mainLineCents + optionsLineCents + ledLineCents;
      
      bundles.push({
        key: `bundle-${item.id || i}-${item.configHash || ''}`,
        mainItem: item,
        mainItemIndex: i,
        ledItem,
        optionsSurchargeCents: optionsLineCents,
        optionsSurchargeDetails: optionsDetails,
        bundleTotalCents,
        basePriceCents,
      });
      
      subtotalCents += bundleTotalCents;
    } else {
      // Standalone item (accessory, etc.)
      standaloneItems.push({ item, index: i });
      subtotalCents += item.lineTotalCents || 0;
    }
  }
  
  return {
    bundles,
    standaloneItems,
    ledLineItem: ledLineItem || (totalLedCents > 0 ? {
      title: 'LED Spots',
      quantity: totalLedQty,
      lineTotalCents: totalLedCents,
    } : undefined),
    subtotalCents,
  };
}

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

/**
 * Format bundle price breakdown for display
 */
export function formatBundlePriceBreakdown(bundle: CartBundle): string[] {
  const lines: string[] = [];
  
  // Base price
  lines.push(`Basisprijs: ${formatEUR(bundle.basePriceCents, 'cents')}`);
  
  // Options
  if (bundle.optionsSurchargeDetails && bundle.optionsSurchargeDetails.length > 0) {
    for (const opt of bundle.optionsSurchargeDetails) {
      lines.push(`${opt.label}: +${formatEUR(opt.valueCents, 'cents')}`);
    }
  }
  
  // LED
  if (bundle.ledItem) {
    lines.push(`LED (${bundle.ledItem.quantity}×): +${formatEUR(bundle.ledItem.lineTotalCents, 'cents')}`);
  }
  
  return lines;
}

/**
 * Get bundle unit price (per item, for quantity display)
 */
export function getBundleUnitPriceCents(bundle: CartBundle): number {
  const qty = bundle.mainItem.quantity || 1;
  return Math.round(bundle.bundleTotalCents / qty);
}
