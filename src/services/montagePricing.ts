/**
 * Montage Pricing Service
 * =======================
 * 
 * Montage (assembly) service by HETT Veranda.
 * Fixed price €1.200,- (incl. BTW)
 * 
 * Currently only available for maatwerk veranda configurator.
 * Montage is added as a SEPARATE Shopify cart line when enabled.
 */

// =============================================================================
// CONSTANTS
// =============================================================================

/** Montage product handle in Shopify */
export const MONTAGE_PRODUCT_HANDLE = "montage-vaste-prijs";

/** 
 * Montage product variant ID from Shopify (Storefront GID)
 * NOTE: This must be created in Shopify with:
 * - Title: "Montage (vaste prijs)"
 * - Price: €1200.00
 * - Variant: "Default Title"
 * 
 * If the product doesn't exist yet, this ID should be updated after creation.
 * For now we use a placeholder that will be resolved dynamically.
 */
export const MONTAGE_VARIANT_ID = "gid://shopify/ProductVariant/MONTAGE_PLACEHOLDER";

/** Montage fixed price in EUR */
export const MONTAGE_PRICE_EUR = 1200.00;

/** Montage fixed price in cents */
export const MONTAGE_PRICE_CENTS = 120000;

// =============================================================================
// CONFIGURATION CHECK
// =============================================================================

/**
 * Check if montage is properly configured (variant ID is set)
 * Returns false if placeholder ID is still in use
 */
export function isMontageConfigured(): boolean {
  return MONTAGE_VARIANT_ID !== "gid://shopify/ProductVariant/MONTAGE_PLACEHOLDER";
}

// =============================================================================
// CART LINE BUILDER
// =============================================================================

/**
 * Shopify cart line input for montage
 */
export interface MontageCartLineInput {
  merchandiseId: string;
  quantity: number;
  attributes: Array<{ key: string; value: string }>;
}

/**
 * Build Montage Shopify cart line input
 * 
 * CUSTOMER-FACING ATTRIBUTES:
 * - Montage: Ja
 * - Vaste prijs: € 1.200,00
 * 
 * Internal attributes use "_" prefix to minimize checkout display.
 * 
 * @param configType - Type of configuration ('maatwerk' or 'veranda')
 * @param bundleKeys - Optional bundle keys to link montage line to parent products
 * @returns CartLineInput for Shopify, or null if montage is not configured
 */
export function buildMontageCartLine(
  configType: 'maatwerk' | 'veranda',
  bundleKeys?: string[]
): MontageCartLineInput | null {
  // For now, allow building the line even without configured variant
  // The cart context will handle adding it as a synthetic item
  
  console.log(`[Montage] Building cart line for ${configType}`);
  
  // Format price with comma as decimal separator (Dutch format)
  const priceFormatted = `€ ${MONTAGE_PRICE_EUR.toFixed(2).replace('.', ',')}`;
  
  // CUSTOMER-FACING attributes only
  const attributes: Array<{ key: string; value: string }> = [
    { key: 'Montage', value: 'Ja' },
    { key: 'Vaste prijs', value: priceFormatted },
  ];
  
  // INTERNAL bundle grouping (underscore prefix to minimize checkout display)
  if (bundleKeys && bundleKeys.length > 0) {
    attributes.push({ key: '_bundle_keys', value: bundleKeys.join(',') });
  }
  attributes.push({ key: '_kind', value: 'montage_addon' });
  attributes.push({ key: '_config_type', value: configType });
  
  // Debug log
  console.log('[Checkout Props] montage', attributes);
  
  return {
    merchandiseId: MONTAGE_VARIANT_ID,
    quantity: 1,
    attributes,
  };
}

/**
 * Get montage price info for display
 */
export function getMontageInfo() {
  return {
    price: MONTAGE_PRICE_EUR,
    priceCents: MONTAGE_PRICE_CENTS,
    priceFormatted: `€ ${MONTAGE_PRICE_EUR.toFixed(2).replace('.', ',')}`,
    description: 'Montage door HETT Veranda',
    subtitle: 'Vaste prijs, inclusief BTW',
  };
}

/**
 * Check if a cart item has montage enabled
 */
export function hasMontageEnabled(item: { config?: { data?: Record<string, unknown> }; maatwerkPayload?: { selections?: Array<{ groupId: string; choiceId?: string }> } }): boolean {
  const config = item.config?.data as Record<string, unknown> | undefined;
  
  // Check config.data.montage boolean
  if (config?.montage === true) {
    return true;
  }
  
  // Check maatwerkPayload selections (if stored there)
  const montageSel = item.maatwerkPayload?.selections?.find(s => s.groupId === 'montage');
  if (montageSel && montageSel.choiceId === 'ja') {
    return true;
  }
  
  return false;
}
