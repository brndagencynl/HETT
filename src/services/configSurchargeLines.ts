/**
 * Configuration Surcharge Cart Lines Builder
 * ==========================================
 * 
 * Builds Shopify cart lines for configuration option surcharges.
 * Uses "prijs-stappen" product variants to represent surcharge amounts.
 * 
 * Route A: Configuration options (excl. LED) → Price steps → Cart lines
 */

import type { CartLineInput, ShopifyCartLineAttribute } from '../lib/shopify/types';
import type { CartItem } from '../../types';
import { buildPriceSteps, formatPriceStepsDisplay, sumPriceSteps } from '../utils/priceSteps';
import { getOptionsSurchargeCents, type SurchargeResult } from '../configurator/pricing/getOptionsSurchargeCents';

// =============================================================================
// TYPES
// =============================================================================

export interface ConfigSurchargeLineResult {
  /** Cart lines to add to Shopify */
  lines: CartLineInput[];
  /** Total surcharge amount in EUR */
  totalEur: number;
  /** Total surcharge amount in cents */
  totalCents: number;
  /** Human-readable summary */
  summary: string;
  /** Items that contributed to the surcharge */
  sourceItems: Array<{
    title: string;
    configType: string;
    amountCents: number;
    summary: string;
  }>;
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

/**
 * Build Shopify cart lines for configuration surcharges.
 * 
 * This function:
 * 1. Calculates options surcharge for each cart item (excl. LED)
 * 2. Sums up the total surcharge amount
 * 3. Decomposes into price step variants
 * 4. Returns CartLineInput[] ready for Shopify API
 * 
 * @param cartItems - All cart items to process
 * @param productTitle - Title to show in checkout (e.g., "Veranda 600x300")
 * @param productHandle - Handle for reference
 * @returns Cart lines and metadata
 */
export function buildConfigSurchargeLines(
  cartItems: CartItem[],
  productTitle: string = 'Configuratie',
  productHandle: string = 'config'
): ConfigSurchargeLineResult {
  const sourceItems: ConfigSurchargeLineResult['sourceItems'] = [];
  let totalCents = 0;

  console.log('[ConfigSurchargeLines] ========== Starting surcharge calculation ==========');
  console.log(`[ConfigSurchargeLines] Processing ${cartItems.length} cart items`);

  // Process each cart item
  for (const item of cartItems) {
    const result = getOptionsSurchargeCents(item);
    
    if (!result.success) {
      console.warn(`[ConfigSurchargeLines] Failed to calculate surcharge for: ${item.title}`, result.error);
      continue;
    }

    if (result.amountCents > 0) {
      // Account for item quantity
      const itemTotalCents = result.amountCents * (item.quantity || 1);
      
      sourceItems.push({
        title: item.title || 'Onbekend product',
        configType: result.configType,
        amountCents: itemTotalCents,
        summary: result.summary,
      });

      totalCents += itemTotalCents;
      
      console.log(`[ConfigSurchargeLines] → ${item.title}: ${result.amountCents} × ${item.quantity || 1} = ${itemTotalCents} cents (${result.configType})`);
    }
  }

  console.log(`[ConfigSurchargeLines] Total surcharge: ${totalCents} cents = €${(totalCents / 100).toFixed(2)}`);

  // If no surcharge, return empty
  if (totalCents === 0) {
    console.log('[ConfigSurchargeLines] No surcharge to add');
    return {
      lines: [],
      totalEur: 0,
      totalCents: 0,
      summary: '',
      sourceItems: [],
    };
  }

  // Decompose into price steps
  const priceSteps = buildPriceSteps(totalCents);
  
  if (priceSteps.length === 0) {
    console.error('[ConfigSurchargeLines] Failed to decompose amount into price steps');
    return {
      lines: [],
      totalEur: totalCents / 100,
      totalCents,
      summary: `Fout: kon ${(totalCents / 100).toFixed(2)} EUR niet omzetten`,
      sourceItems,
    };
  }

  // Verify the decomposition
  const verifyTotal = sumPriceSteps(priceSteps);
  const verifyTotalCents = verifyTotal * 100;
  
  // Allow for rounding (smallest step is €1, so up to 99 cents difference is OK)
  if (Math.abs(verifyTotalCents - totalCents) > 99) {
    console.error(`[ConfigSurchargeLines] Decomposition mismatch: expected ${totalCents} cents, got ${verifyTotalCents} cents`);
  }

  // Build summary for display
  const stepsSummary = formatPriceStepsDisplay(priceSteps);
  const configSummary = sourceItems.map(s => `${s.title}: ${s.summary}`).join('; ');
  const truncatedSummary = configSummary.length > 400 
    ? configSummary.slice(0, 400) + '...' 
    : configSummary;

  console.log(`[ConfigSurchargeLines] Price steps: ${stepsSummary}`);
  console.log(`[ConfigSurchargeLines] Summary: ${truncatedSummary}`);

  // Build cart lines
  const lines: CartLineInput[] = priceSteps.map(step => {
    const attributes: ShopifyCartLineAttribute[] = [
      { key: 'kind', value: 'config_surcharge_step' },
      { key: 'step', value: String(step.step) },
      { key: 'config_type', value: sourceItems.map(s => s.configType).join(',') },
      { key: 'config_title', value: productTitle },
      { key: 'config_handle', value: productHandle },
      { key: 'config_summary', value: truncatedSummary },
    ];

    return {
      merchandiseId: step.variantId,
      quantity: step.qty,
      attributes,
    };
  });

  console.log(`[ConfigSurchargeLines] Created ${lines.length} cart lines`);

  return {
    lines,
    totalEur: verifyTotal,
    totalCents: verifyTotalCents,
    summary: truncatedSummary,
    sourceItems,
  };
}

// =============================================================================
// SINGLE ITEM HELPER
// =============================================================================

/**
 * Build surcharge lines for a single cart item.
 * Convenience function when processing items individually.
 */
export function buildSingleItemSurchargeLines(
  item: CartItem
): ConfigSurchargeLineResult {
  return buildConfigSurchargeLines(
    [item],
    item.title || 'Configuratie',
    item.handle || item.slug || item.id || 'config'
  );
}

// =============================================================================
// DETECTION HELPERS
// =============================================================================

/**
 * Check if a cart line is a config surcharge step line.
 * Uses the 'kind' attribute.
 */
export function isConfigSurchargeStepLine(attributes: ShopifyCartLineAttribute[]): boolean {
  return attributes.some(attr => 
    attr.key === 'kind' && attr.value === 'config_surcharge_step'
  );
}

/**
 * Get surcharge step info from line attributes.
 */
export function getConfigSurchargeStepInfo(attributes: ShopifyCartLineAttribute[]): {
  step: number;
  configType: string;
  configTitle: string;
  configSummary: string;
} | null {
  if (!isConfigSurchargeStepLine(attributes)) {
    return null;
  }

  const getValue = (key: string): string => {
    const attr = attributes.find(a => a.key === key);
    return attr?.value || '';
  };

  return {
    step: parseInt(getValue('step'), 10) || 0,
    configType: getValue('config_type'),
    configTitle: getValue('config_title'),
    configSummary: getValue('config_summary'),
  };
}
