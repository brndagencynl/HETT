/**
 * Pricing Helpers
 * ================
 * 
 * Helper functions that wrap verandapricing.ts for UI and cart integration.
 * NO pricing logic duplicated here - all calculations delegate to verandapricing.ts.
 */

import {
  calculateVerandaPrice,
  getBasePrice,
  findOptionChoice,
  getOptionPrice,
  VERANDA_OPTION_GROUPS,
  type VerandaProductSize,
  type VerandaPricingConfig,
  type PriceLineItem,
  type PriceCalculationResult,
} from '../configurator/pricing/verandapricing';

import { formatEUR, toCents } from '../utils/money';

// =============================================================================
// TYPES
// =============================================================================

/** Currency code */
export type CurrencyCode = 'EUR';

/** Money amount with currency */
export interface MoneyAmount {
  amount: number;
  currency: CurrencyCode;
}

/** Price breakdown row for display */
export interface PriceBreakdownRow {
  groupId: string;
  groupLabel: string;
  choiceId: string;
  choiceLabel: string;
  price: number;
}

/** Normalized price breakdown structure */
export interface PriceBreakdown {
  base: MoneyAmount;
  rows: PriceBreakdownRow[];
  optionsTotal: number;
  total: number;
}

/** Readable selection item for display */
export interface ReadableSelection {
  groupId: string;
  groupLabel: string;
  choiceId: string;
  choiceLabel: string;
  price: number;
  formattedPrice: string;
}

/** Selection without productSize (for cart payload) */
export type VerandaSelection = Omit<VerandaPricingConfig, 'productSize'>;

// =============================================================================
// FORMATTING HELPERS
// =============================================================================

/**
 * Format money amount in Dutch style
 * Uses € symbol, always 2 decimals, thousand separator is dot
 * 
 * @example formatMoney(1650) → "€ 1.650,00"
 * @example formatMoney(0) → "€ 0,00"
 */
export function formatMoney(amount: number): string {
  // In this module, amounts are expressed in EUR.
  return formatEUR(toCents(amount), 'cents');
}

/**
 * Format money for display with "+" prefix for positive amounts
 * 
 * @example formatMoneyDelta(125) → "+ € 125,00"
 * @example formatMoneyDelta(0) → "€ 0,00"
 */
export function formatMoneyDelta(amount: number): string {
  if (amount > 0) {
    return `+ ${formatMoney(amount)}`;
  }
  return formatMoney(amount);
}

// =============================================================================
// PRICE CALCULATION HELPERS
// =============================================================================

/**
 * Calculate complete price breakdown for a veranda configuration
 * 
 * Wraps calculateVerandaPrice from verandapricing.ts and returns
 * a normalized structure suitable for UI display and cart storage.
 * 
 * @param config - Full configuration including productSize
 * @param wooCommerceBasePrice - Optional override for base price (from WooCommerce)
 */
export function calculateVerandaPriceBreakdown(
  config: VerandaPricingConfig,
  wooCommerceBasePrice?: number
): PriceBreakdown {
  // Validate required field
  if (!config.productSize) {
    throw new Error('productSize is required for price calculation');
  }

  // Delegate to verandapricing.ts
  const result: PriceCalculationResult = calculateVerandaPrice(config, wooCommerceBasePrice);

  // Transform to normalized structure
  return {
    base: {
      amount: result.basePrice,
      currency: 'EUR',
    },
    rows: result.items.map(item => ({
      groupId: item.groupId,
      groupLabel: item.groupLabel,
      choiceId: item.choiceId,
      choiceLabel: item.choiceLabel,
      price: item.price,
    })),
    optionsTotal: result.optionsTotal,
    total: result.grandTotal,
  };
}

/**
 * Calculate price breakdown from selection (without productSize in selection)
 * 
 * Convenience function when productSize is known separately
 * 
 * @param productSize - The veranda product size
 * @param selection - Configuration selection (without productSize)
 * @param wooCommerceBasePrice - Optional override for base price
 */
export function calculatePriceFromSelection(
  productSize: VerandaProductSize,
  selection: VerandaSelection,
  wooCommerceBasePrice?: number
): PriceBreakdown {
  const config: VerandaPricingConfig = {
    productSize,
    ...selection,
  };
  return calculateVerandaPriceBreakdown(config, wooCommerceBasePrice);
}

// =============================================================================
// SELECTION SUMMARY HELPERS
// =============================================================================

/**
 * Get readable summary of all selected options with labels and prices
 * 
 * Returns ALL selections (including those with price 0) for complete display.
 * Used for UI summary panels and cart item details.
 * 
 * @param config - Full configuration including productSize
 */
export function getReadableSelectionSummary(
  config: VerandaPricingConfig
): ReadableSelection[] {
  if (!config.productSize) {
    throw new Error('productSize is required for selection summary');
  }

  const selections: ReadableSelection[] = [];
  const { productSize } = config;

  // Define option mappings (matches verandapricing.ts order)
  const optionMappings: { groupId: string; value: string | boolean | undefined }[] = [
    { groupId: 'daktype', value: config.daktype },
    { groupId: 'voorzijde', value: config.voorzijde },
    { groupId: 'zijwand_links', value: config.zijwand_links },
    { groupId: 'zijwand_rechts', value: config.zijwand_rechts },
    { groupId: 'goot', value: config.goot },
    { groupId: 'verlichting', value: config.verlichting },
  ];

  for (const { groupId, value } of optionMappings) {
    const group = VERANDA_OPTION_GROUPS.find(g => g.id === groupId);
    if (!group) continue;

    // Skip undefined values but include 'geen' and false for completeness
    if (value === undefined) continue;

    let choiceId: string;
    let choiceLabel: string;
    let price: number;

    if (typeof value === 'boolean') {
      // Boolean toggle (verlichting)
      if (value && group.choices.length > 0) {
        const choice = group.choices[0];
        choiceId = choice.id;
        choiceLabel = choice.labelNL;
        price = getOptionPrice(choice.pricing, productSize);
      } else {
        choiceId = 'geen';
        choiceLabel = 'Nee';
        price = 0;
      }
    } else {
      // String selection
      choiceId = value;
      const choice = group.choices.find(c => c.id === value);
      if (choice) {
        choiceLabel = choice.labelNL;
        price = getOptionPrice(choice.pricing, productSize);
      } else {
        choiceLabel = value;
        price = 0;
      }
    }

    selections.push({
      groupId,
      groupLabel: group.labelNL,
      choiceId,
      choiceLabel,
      price,
      formattedPrice: price > 0 ? formatMoneyDelta(price) : formatMoney(0),
    });
  }

  return selections;
}

/**
 * Get readable summary from selection (without productSize in selection)
 * 
 * @param productSize - The veranda product size
 * @param selection - Configuration selection (without productSize)
 */
export function getReadableSummaryFromSelection(
  productSize: VerandaProductSize,
  selection: VerandaSelection
): ReadableSelection[] {
  const config: VerandaPricingConfig = {
    productSize,
    ...selection,
  };
  return getReadableSelectionSummary(config);
}

/**
 * Create a compact text summary of the configuration
 * Useful for cart item titles and notifications
 * 
 * @example "Polycarbonaat opaal, Glazen schuifwanden, LED Verlichting"
 */
export function getCompactSummaryText(
  config: VerandaPricingConfig
): string {
  const summary = getReadableSelectionSummary(config);
  
  // Filter out "none" selections and format
  const meaningful = summary.filter(s => 
    s.choiceId !== 'geen' && 
    s.choiceLabel !== 'Nee' &&
    s.price >= 0 // Include price 0 items like gutter
  );

  return meaningful.map(s => s.choiceLabel).join(', ');
}

// =============================================================================
// RE-EXPORTS FOR CONVENIENCE
// =============================================================================

export {
  getBasePrice,
  type VerandaProductSize,
  type VerandaPricingConfig,
} from '../configurator/pricing/verandapricing';
