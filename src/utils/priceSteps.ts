/**
 * Price Steps Utilities
 * =====================
 * 
 * Helpers for decomposing surcharge amounts into price step lines.
 * Works in CENTS to avoid floating point errors.
 */

import {
  PRICE_STEPS,
  PRICE_STEPS_CENTS,
  PRICE_STEP_VARIANTS,
  type PriceStep,
  type PriceStepLine,
} from '../config/priceSteps';

// =============================================================================
// DECOMPOSITION
// =============================================================================

/**
 * Decompose an amount (in cents) into price step lines using greedy algorithm.
 * 
 * @param amountCents - Total surcharge amount in cents (must be >= 0)
 * @returns Array of price step lines with step, qty, and variantId
 * 
 * @example
 * buildPriceSteps(26700) // €267.00
 * // Returns: [
 * //   { step: 100, qty: 2, variantId: '...' },
 * //   { step: 50, qty: 1, variantId: '...' },
 * //   { step: 10, qty: 1, variantId: '...' },
 * //   { step: 5, qty: 1, variantId: '...' },
 * //   { step: 1, qty: 2, variantId: '...' }
 * // ]
 */
export function buildPriceSteps(amountCents: number): PriceStepLine[] {
  // Validate input
  if (!Number.isFinite(amountCents) || Number.isNaN(amountCents)) {
    console.error('[buildPriceSteps] Invalid amount (NaN or Infinity):', amountCents);
    return [];
  }

  if (amountCents < 0) {
    console.error('[buildPriceSteps] Negative amount not allowed:', amountCents);
    return [];
  }

  if (amountCents === 0) {
    console.log('[buildPriceSteps] Zero amount, no steps needed');
    return [];
  }

  // Round to nearest cent (in case of floating point artifacts)
  let remaining = Math.round(amountCents);
  const result: PriceStepLine[] = [];

  console.log(`[buildPriceSteps] Decomposing ${remaining} cents (€${(remaining / 100).toFixed(2)})`);

  // Greedy decomposition: largest steps first
  for (let i = 0; i < PRICE_STEPS_CENTS.length; i++) {
    const stepCents = PRICE_STEPS_CENTS[i];
    const stepEur = PRICE_STEPS[i] as PriceStep;

    if (remaining >= stepCents) {
      const qty = Math.floor(remaining / stepCents);
      remaining = remaining % stepCents;

      const variantId = PRICE_STEP_VARIANTS[stepEur];
      if (!variantId) {
        console.error(`[buildPriceSteps] Missing variant for step €${stepEur}`);
        continue;
      }

      result.push({
        step: stepEur,
        qty,
        variantId,
      });

      console.log(`[buildPriceSteps] → €${stepEur} x ${qty} = €${(stepEur * qty).toFixed(2)}`);
    }
  }

  // Sanity check: remaining should be 0 (since smallest step is 1 cent... wait, 1 EUR = 100 cents)
  // With €1 as smallest step, we can't represent amounts < €1
  if (remaining > 0) {
    console.warn(`[buildPriceSteps] Remainder of ${remaining} cents cannot be represented (smallest step is €1)`);
    // Round up: add one €1 step for any remaining cents
    if (remaining > 0) {
      const variantId = PRICE_STEP_VARIANTS[1];
      if (variantId) {
        // Check if we already have a €1 step
        const existingOneStep = result.find(r => r.step === 1);
        if (existingOneStep) {
          existingOneStep.qty += 1;
        } else {
          result.push({ step: 1, qty: 1, variantId });
        }
        console.log(`[buildPriceSteps] → Added €1 step to cover remainder (${remaining} cents rounded up)`);
      }
    }
  }

  console.log(`[buildPriceSteps] Result: ${result.length} step lines`);
  return result;
}

/**
 * Calculate the total EUR value of price step lines.
 * Useful for verification.
 */
export function sumPriceSteps(lines: PriceStepLine[]): number {
  return lines.reduce((sum, line) => sum + line.step * line.qty, 0);
}

/**
 * Calculate the total cents value of price step lines.
 */
export function sumPriceStepsCents(lines: PriceStepLine[]): number {
  return lines.reduce((sum, line) => sum + line.step * 100 * line.qty, 0);
}

/**
 * Format price steps for human-readable display.
 * @example formatPriceStepsDisplay([{step: 100, qty: 2}, {step: 10, qty: 1}])
 * // Returns: "€100 x 2, €10 x 1"
 */
export function formatPriceStepsDisplay(lines: PriceStepLine[]): string {
  if (lines.length === 0) return '';
  return lines.map(l => `€${l.step} x ${l.qty}`).join(', ');
}
