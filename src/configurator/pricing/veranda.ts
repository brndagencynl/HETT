/**
 * Veranda Pricing - Wrapper Module
 * 
 * This module wraps the centralized pricing from verandapricing.ts
 * for backwards compatibility with existing components.
 * 
 * For new code, prefer importing directly from verandapricing.ts
 */

import type { VerandaConfig } from "../schemas/veranda";
import { 
    calcVerandaPriceCompat, 
    calculateVerandaPrice,
    type VerandaProductSize,
    type VerandaPricingConfig,
    type PriceCalculationResult,
    BASE_PRICES,
    getBasePrice,
} from "./verandapricing";

// Re-export key types and functions for convenience
export type { VerandaProductSize, VerandaPricingConfig, PriceCalculationResult };
export { BASE_PRICES, getBasePrice, calculateVerandaPrice };

/**
 * Calculate veranda price using the new pricing engine
 * Maintains backwards compatibility with existing signature
 * 
 * @param basePrice - Base price (can come from WooCommerce later)
 * @param cfg - Configuration object from the wizard
 * @param productSize - Optional product size for size-dependent pricing
 */
export function calcVerandaPrice(
    basePrice: number, 
    cfg: VerandaConfig,
    productSize: VerandaProductSize = '600x300'
) {
    return calcVerandaPriceCompat(basePrice, cfg, productSize);
}
