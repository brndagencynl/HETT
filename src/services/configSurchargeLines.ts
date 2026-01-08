/**
 * Configuration Surcharge Cart Lines Builder
 * ==========================================
 * 
 * Builds Shopify cart lines for configuration option surcharges.
 * Uses "prijs-stappen" product variants to represent surcharge amounts.
 * 
 * Route A: Configuration options (excl. LED) → Price steps → Cart lines
 * 
 * All surcharge lines include:
 * - config_id: Unique ID to group related lines
 * - kind: 'config_surcharge_step' (for identification)
 * - Toelichting: Human-readable summary for Shopify checkout
 */

import type { CartLineInput, ShopifyCartLineAttribute } from '../lib/shopify/types';
import type { CartItem } from '../../types';
import { buildPriceSteps, formatPriceStepsDisplay, sumPriceSteps } from '../utils/priceSteps';
import { getOptionsSurchargeCents, type SurchargeResult } from '../configurator/pricing/getOptionsSurchargeCents';

// Simple unique ID generator (no external dependency)
function generateConfigId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `cfg_${timestamp}_${random}`;
}

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
  /** Unique identifier for grouping these lines */
  configId: string;
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
 * @param bundleKeys - Optional bundle keys to link surcharge lines to parent products
 * @returns Cart lines and metadata
 */
export function buildConfigSurchargeLines(
  cartItems: CartItem[],
  productTitle: string = 'Configuratie',
  productHandle: string = 'config',
  bundleKeys?: string[]
): ConfigSurchargeLineResult {
  const sourceItems: ConfigSurchargeLineResult['sourceItems'] = [];
  let totalCents = 0;

  console.log('[ConfigSurchargeLines] ========== Starting surcharge calculation ==========');
  console.log(`[ConfigSurchargeLines] Processing ${cartItems.length} cart items`);
  console.log(`[ConfigSurchargeLines] Bundle keys: ${bundleKeys?.join(',') || 'none'}`);

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
      configId: '',
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
      configId: '',
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

  // Generate a unique config_id for this checkout session
  // This allows grouping all surcharge lines together in the cart UI
  const configId = generateConfigId();
  console.log(`[ConfigSurchargeLines] Generated config_id: ${configId}`);

  // Build cart lines with grouping attributes
  const lines: CartLineInput[] = priceSteps.map(step => {
    // Build human-readable toelichting
    const toelichtingLines: string[] = [];
    
    // Add product title(s)
    const uniqueTitles = [...new Set(sourceItems.map(s => s.title))];
    for (const title of uniqueTitles) {
      toelichtingLines.push(title);
    }
    
    // Add options summary with prices
    const optionsSummary = sourceItems
      .filter(s => s.summary && s.summary.length > 0)
      .map(s => s.summary)
      .join(', ');
    
    if (optionsSummary) {
      toelichtingLines.push(`Opties: ${optionsSummary}`);
    }
    
    // Attributes for grouping and display
    const attributes: ShopifyCartLineAttribute[] = [
      // Grouping identifier (same for all lines in this config)
      { key: 'config_id', value: configId },
      // Line type identifier
      { key: 'kind', value: 'config_surcharge_step' },
      // Human-readable for Shopify checkout
      { key: 'Toelichting', value: toelichtingLines.join('\n') },
    ];
    
    // Add bundle keys if provided (links surcharge to parent product bundles)
    if (bundleKeys && bundleKeys.length > 0) {
      attributes.push({ key: 'bundle_keys', value: bundleKeys.join(',') });
    }

    return {
      merchandiseId: step.variantId,
      quantity: step.qty,
      attributes,
    };
  });

  console.log(`[ConfigSurchargeLines] Created ${lines.length} cart lines with config_id: ${configId}`);

  return {
    lines,
    totalEur: verifyTotal,
    totalCents: verifyTotalCents,
    summary: truncatedSummary,
    sourceItems,
    configId, // Include the generated config_id for reference
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
 * Identified by: kind === 'config_surcharge_step'
 */
export function isConfigSurchargeStepLine(attributes: ShopifyCartLineAttribute[]): boolean {
  return attributes.some(attr => attr.key === 'kind' && attr.value === 'config_surcharge_step');
}

/**
 * Get surcharge step info from line attributes.
 */
export function getConfigSurchargeStepInfo(attributes: ShopifyCartLineAttribute[]): {
  configId: string | null;
  toelichting: string;
} | null {
  if (!isConfigSurchargeStepLine(attributes)) {
    return null;
  }

  const configIdAttr = attributes.find(a => a.key === 'config_id');
  const toelichtingAttr = attributes.find(a => a.key === 'Toelichting');
  
  return {
    configId: configIdAttr?.value || null,
    toelichting: toelichtingAttr?.value || '',
  };
}
