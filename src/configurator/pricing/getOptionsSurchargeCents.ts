/**
 * Options Surcharge Calculation
 * ==============================
 * 
 * Calculates the total surcharge amount from configurator options.
 * Returns value in CENTS to avoid floating point errors.
 * 
 * IMPORTANT: LED is EXCLUDED from this calculation.
 * LED is handled separately in beginCheckout.ts via the LED addon service.
 */

import type { CartItem } from '../../../types';
import { toCents } from '../../utils/money';

// Veranda pricing
import {
  calculateVerandaPrice,
  type VerandaPricingConfig,
  type VerandaProductSize,
} from '../../configurator/pricing/verandapricing';

// Sandwichpanelen pricing
import {
  calculateSandwichpanelenPricing,
} from '../../pricing/sandwichpanelen';

// =============================================================================
// TYPES
// =============================================================================

export type ConfigType = 'veranda' | 'maatwerk' | 'sandwich' | 'unknown';

export interface SurchargeResult {
  /** Surcharge amount in cents */
  amountCents: number;
  /** Config type that was detected */
  configType: ConfigType;
  /** Human-readable summary of what's included */
  summary: string;
  /** Whether the calculation was successful */
  success: boolean;
  /** Error message if not successful */
  error?: string;
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

/**
 * Calculate the options surcharge for a cart item.
 * 
 * This excludes:
 * - Base price (comes from Shopify variant)
 * - LED (handled separately)
 * - Shipping (handled separately)
 * 
 * @param item - The cart item
 * @returns Surcharge result with amount in cents
 */
export function getOptionsSurchargeCents(item: CartItem): SurchargeResult {
  // Detect config type
  const configType = detectConfigType(item);
  
  console.log(`[getOptionsSurchargeCents] Processing item: ${item.title || item.id}`);
  console.log(`[getOptionsSurchargeCents] Detected type: ${configType}`);

  try {
    switch (configType) {
      case 'veranda':
        return calculateVerandaSurcharge(item);
      case 'maatwerk':
        return calculateMaatwerkSurcharge(item);
      case 'sandwich':
        return calculateSandwichSurcharge(item);
      default:
        return {
          amountCents: 0,
          configType: 'unknown',
          summary: '',
          success: true,
        };
    }
  } catch (error) {
    console.error(`[getOptionsSurchargeCents] Error calculating surcharge:`, error);
    return {
      amountCents: 0,
      configType,
      summary: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =============================================================================
// TYPE DETECTION
// =============================================================================

/**
 * Detect the configuration type from a cart item.
 */
function detectConfigType(item: CartItem): ConfigType {
  // Check for maatwerk first (more specific)
  if (item.type === 'custom_veranda') {
    return 'maatwerk';
  }
  
  if (item.maatwerkPayload) {
    return 'maatwerk';
  }
  
  if (item.config?.category === 'maatwerk_veranda') {
    return 'maatwerk';
  }

  // Check for sandwichpanelen
  if (item.type === 'sandwichpanelen') {
    return 'sandwich';
  }
  
  if (item.category === 'sandwichpanelen') {
    return 'sandwich';
  }

  // Check for regular veranda
  if (item.config?.category === 'verandas') {
    return 'veranda';
  }
  
  if (item.category === 'verandas') {
    return 'veranda';
  }

  // Check if it has veranda-like config data
  if (item.config?.data && typeof item.config.data === 'object') {
    const data = item.config.data as Record<string, unknown>;
    if ('daktype' in data || 'voorzijde' in data || 'zijwand_links' in data) {
      return 'veranda';
    }
  }

  return 'unknown';
}

// =============================================================================
// VERANDA SURCHARGE
// =============================================================================

/**
 * Calculate options surcharge for a regular veranda item.
 * Excludes LED (verlichting).
 */
function calculateVerandaSurcharge(item: CartItem): SurchargeResult {
  const configData = item.config?.data as Record<string, unknown> | undefined;
  
  if (!configData) {
    console.log('[getOptionsSurchargeCents] Veranda item has no config data');
    return {
      amountCents: 0,
      configType: 'veranda',
      summary: 'Geen configuratie opties',
      success: true,
    };
  }

  // Try to determine product size from selectedSize or handle
  let productSize: VerandaProductSize = '600x300'; // default
  
  if (item.selectedSize) {
    // selectedSize might be "600x300" directly
    const match = item.selectedSize.match(/(\d+)x(\d+)/);
    if (match) {
      productSize = `${match[1]}x${match[2]}` as VerandaProductSize;
    }
  } else if (item.handle || item.slug) {
    // Try to extract from handle like "veranda-600x300"
    const handle = item.handle || item.slug || '';
    const match = handle.match(/(\d+)x(\d+)/);
    if (match) {
      productSize = `${match[1]}x${match[2]}` as VerandaProductSize;
    }
  }

  console.log(`[getOptionsSurchargeCents] Veranda productSize: ${productSize}`);

  // Build pricing config (exclude verlichting - LED is separate!)
  const pricingConfig: VerandaPricingConfig = {
    productSize,
    daktype: configData.daktype as string | undefined,
    voorzijde: configData.voorzijde as string | undefined,
    zijwand_links: configData.zijwand_links as string | undefined,
    zijwand_rechts: configData.zijwand_rechts as string | undefined,
    goot: configData.goot as string | undefined,
    // NOTE: verlichting is EXCLUDED - LED is handled separately
    verlichting: false,
  };

  // Calculate price (we only need optionsTotal, not basePrice)
  const result = calculateVerandaPrice(pricingConfig, 0);
  
  const optionsCents = toCents(result.optionsTotal);
  const summaryParts = result.items.map(i => `${i.choiceLabel} (€${i.price.toFixed(2)})`);

  console.log(`[getOptionsSurchargeCents] Veranda optionsTotal: ${result.optionsTotal} EUR = ${optionsCents} cents`);
  console.log(`[getOptionsSurchargeCents] Veranda items:`, result.items);

  return {
    amountCents: optionsCents,
    configType: 'veranda',
    summary: summaryParts.join(', ') || 'Standaard opties',
    success: true,
  };
}

// =============================================================================
// MAATWERK SURCHARGE
// =============================================================================

/**
 * Calculate options surcharge for a maatwerk veranda item.
 * Excludes LED (verlichting).
 */
function calculateMaatwerkSurcharge(item: CartItem): SurchargeResult {
  const payload = item.maatwerkPayload;
  
  if (!payload) {
    console.log('[getOptionsSurchargeCents] Maatwerk item has no maatwerkPayload');
    return {
      amountCents: 0,
      configType: 'maatwerk',
      summary: 'Geen maatwerk configuratie',
      success: true,
    };
  }

  // MaatwerkCartPayload stores options in `selections` array, not as direct properties
  // Calculate from selections, excluding LED (verlichting)
  const selectionsExcludingLed = payload.selections.filter(
    s => s.groupId !== 'verlichting'
  );

  // Sum up the prices from selections
  const optionsTotalEur = selectionsExcludingLed.reduce((sum, s) => sum + s.price, 0);
  const optionsCents = toCents(optionsTotalEur);

  const summaryParts = selectionsExcludingLed
    .filter(s => s.price > 0)
    .map(s => `${s.choiceLabel} (€${s.price.toFixed(2)})`);

  console.log(`[getOptionsSurchargeCents] Maatwerk optionsTotal: ${optionsTotalEur} EUR = ${optionsCents} cents`);
  console.log(`[getOptionsSurchargeCents] Maatwerk selections (excl. LED):`, selectionsExcludingLed.filter(s => s.price > 0));

  return {
    amountCents: optionsCents,
    configType: 'maatwerk',
    summary: summaryParts.join(', ') || 'Maatwerk standaard opties',
    success: true,
  };
}

// =============================================================================
// SANDWICHPANELEN SURCHARGE
// =============================================================================

/**
 * Calculate options surcharge for a sandwichpanelen item.
 * Currently only U-profiles add surcharge.
 */
function calculateSandwichSurcharge(item: CartItem): SurchargeResult {
  const sandwichConfig = (item.config?.data as Record<string, unknown>) || {};
  
  // Base price is needed for the calculation but we only extract extrasTotal
  const basePrice = item.price || 0;
  
  const pricing = calculateSandwichpanelenPricing({
    basePrice,
    config: sandwichConfig as any,
  });

  const extrasCents = toCents(pricing.extrasTotal);
  const summaryParts = pricing.breakdown.map(b => `${b.label} (€${b.amount.toFixed(2)})`);

  console.log(`[getOptionsSurchargeCents] Sandwich extrasTotal: ${pricing.extrasTotal} EUR = ${extrasCents} cents`);

  return {
    amountCents: extrasCents,
    configType: 'sandwich',
    summary: summaryParts.join(', ') || 'Geen extra opties',
    success: true,
  };
}

// =============================================================================
// BATCH PROCESSING
// =============================================================================

/**
 * Calculate total options surcharge for all items in a cart.
 * Useful for quick totaling without full decomposition.
 */
export function getTotalOptionsSurchargeCents(items: CartItem[]): number {
  let total = 0;
  
  for (const item of items) {
    const result = getOptionsSurchargeCents(item);
    if (result.success) {
      // Multiply by quantity
      total += result.amountCents * (item.quantity || 1);
    }
  }
  
  return total;
}
