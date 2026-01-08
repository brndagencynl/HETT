/**
 * Configuration Surcharge Cart Lines Builder
 * ==========================================
 * 
 * Builds Shopify cart lines for configuration option surcharges.
 * Uses "prijs-stappen" product variants to represent surcharge amounts.
 * 
 * Route A: Configuration options (excl. LED) → Price steps → Cart lines
 * 
 * CUSTOMER-FACING ATTRIBUTES:
 * - Toelichting: "Glazen schuifwand getint (+€1.150), Polycarbonaat spie (+€215), ..."
 * 
 * NO technical keys visible to customer:
 * - kind, config_id, step, config_type, config_handle, config_title, config_summary
 * 
 * Internal bundle grouping uses "_" prefixed keys.
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

  // Generate a unique config_id for this checkout session (internal use only)
  const configId = generateConfigId();
  console.log(`[ConfigSurchargeLines] Generated config_id: ${configId}`);

  // Build CUSTOMER-FACING toelichting from all source items
  // Format: "Optienaam (+€X,XX), Optienaam2 (+€Y,YY), ..."
  // Deduplicate option labels and sum prices for same options
  const optionPrices = new Map<string, number>();
  for (const src of sourceItems) {
    // Parse the summary which contains "Label (€XX.XX), Label2 (€YY.YY)"
    if (src.summary) {
      const optionMatches = src.summary.matchAll(/([^,()]+)\s*\(€([\d.,]+)\)/g);
      for (const match of optionMatches) {
        const label = match[1].trim();
        const price = parseFloat(match[2].replace(',', '.'));
        if (label && !isNaN(price) && price > 0) {
          // Sum prices for same option across items
          optionPrices.set(label, (optionPrices.get(label) || 0) + price);
        }
      }
    }
  }
  
  // Build clean toelichting string
  const toelichtingParts: string[] = [];
  for (const [label, price] of optionPrices) {
    // Format price with Dutch comma separator
    const priceFormatted = price.toFixed(2).replace('.', ',');
    toelichtingParts.push(`${label} (+€${priceFormatted})`);
  }
  
  // Fallback if no options parsed
  const toelichtingValue = toelichtingParts.length > 0 
    ? toelichtingParts.join(', ')
    : 'Configuratie opties';

  // Build cart lines with CUSTOMER-FACING attributes only
  const lines: CartLineInput[] = priceSteps.map(step => {
    // CUSTOMER-FACING: Only "Toelichting" visible to customer
    const attributes: ShopifyCartLineAttribute[] = [
      { key: 'Toelichting', value: toelichtingValue },
    ];
    
    // INTERNAL bundle grouping (underscore prefix to minimize checkout display)
    if (bundleKeys && bundleKeys.length > 0) {
      attributes.push({ key: '_bundle_keys', value: bundleKeys.join(',') });
    }
    attributes.push({ key: '_kind', value: 'config_surcharge' });
    attributes.push({ key: '_config_id', value: configId });

    return {
      merchandiseId: step.variantId,
      quantity: step.qty,
      attributes,
    };
  });

  // Debug log for testing
  console.log('[Checkout Props] surcharge', lines.length > 0 ? lines[0].attributes : []);
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
 * Identified by: _kind === 'config_surcharge' (underscore prefix)
 * Also supports legacy 'kind' === 'config_surcharge_step' for backwards compatibility
 */
export function isConfigSurchargeStepLine(attributes: ShopifyCartLineAttribute[]): boolean {
  return attributes.some(attr => 
    (attr.key === '_kind' && attr.value === 'config_surcharge') ||
    (attr.key === 'kind' && attr.value === 'config_surcharge_step')
  );
}

/**
 * Get surcharge step info from line attributes.
 * Supports both prefixed (_config_id) and legacy (config_id) keys.
 */
export function getConfigSurchargeStepInfo(attributes: ShopifyCartLineAttribute[]): {
  configId: string | null;
  toelichting: string;
} | null {
  if (!isConfigSurchargeStepLine(attributes)) {
    return null;
  }

  // Support both new prefixed and legacy keys
  const configIdAttr = attributes.find(a => a.key === '_config_id' || a.key === 'config_id');
  const toelichtingAttr = attributes.find(a => a.key === 'Toelichting');
  
  return {
    configId: configIdAttr?.value || null,
    toelichting: toelichtingAttr?.value || '',
  };
}
