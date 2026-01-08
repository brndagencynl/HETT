/**
 * Price Step Variants Configuration
 * ==================================
 * 
 * Shopify product variants for configuration surcharges.
 * Uses "prijs-stappen" product with variants for each step value.
 * 
 * Route A: Configuration options (excl. LED) are converted to a total
 * surcharge amount and added as extra cart lines via these step variants.
 */

// =============================================================================
// VARIANT MAPPING
// =============================================================================

/**
 * Shopify variant GIDs for each price step.
 * These are from the "Prijs-stappen" product in Shopify.
 */
export const PRICE_STEP_VARIANTS: Record<number, string> = {
  1: 'gid://shopify/ProductVariant/53090091630919',
  5: 'gid://shopify/ProductVariant/53090091663687',
  10: 'gid://shopify/ProductVariant/53090091696455',
  25: 'gid://shopify/ProductVariant/53090091729223',
  50: 'gid://shopify/ProductVariant/53090091761991',
  100: 'gid://shopify/ProductVariant/53090091794759',
} as const;

/**
 * Available step values in descending order (for greedy decomposition).
 * Values represent EUR amounts.
 */
export const PRICE_STEPS = [100, 50, 25, 10, 5, 1] as const;

/**
 * Step values in cents for internal calculations (avoid floating point errors).
 */
export const PRICE_STEPS_CENTS = [10000, 5000, 2500, 1000, 500, 100] as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type PriceStep = typeof PRICE_STEPS[number];

export interface PriceStepLine {
  /** The step value in EUR (1, 5, 10, 25, 50, or 100) */
  step: PriceStep;
  /** Quantity of this step needed */
  qty: number;
  /** Shopify variant GID for this step */
  variantId: string;
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Check if a step value is valid.
 */
export function isValidPriceStep(step: number): step is PriceStep {
  return PRICE_STEPS.includes(step as PriceStep);
}

/**
 * Get variant ID for a price step.
 * @throws Error if step is not valid
 */
export function getVariantForStep(step: number): string {
  const variantId = PRICE_STEP_VARIANTS[step];
  if (!variantId) {
    throw new Error(`[priceSteps] Invalid step value: ${step}. Valid steps: ${PRICE_STEPS.join(', ')}`);
  }
  return variantId;
}
