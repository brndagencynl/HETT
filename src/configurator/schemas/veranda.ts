/**
 * Veranda Configuration Schema
 * 
 * This file defines the TypeScript types and UI configuration for the veranda configurator.
 * Pricing data is centralized in ../pricing/verandapricing.ts
 * Asset paths are centralized in ../visual/verandaAssets.ts
 * 
 * STEP ORDER (single source of truth):
 * 1. color - RAL color selection
 * 2. daktype - Roof type
 * 3. goot - Gutter system
 * 4. zijwand_links - Left side wall
 * 5. zijwand_rechts - Right side wall
 * 6. voorzijde - Front side (glazen schuifwand)
 * 7. verlichting - Extras (LED lighting)
 * 
 * IMPORTANT: Each size is a SEPARATE PRODUCT, not a variation.
 * The configurator does NOT allow changing dimensions - only options.
 */

import {
    VERANDA_OPTION_GROUPS,
    ROOF_TYPE_OPTIONS,
    FRONT_SIDE_OPTIONS,
    SIDE_WALL_OPTIONS,
    GUTTER_OPTIONS,
    EXTRAS_OPTIONS,
    COLOR_OPTIONS,
    type VerandaProductSize,
    type VerandaColorId,
    type OptionChoice,
    getOptionPrice,
} from '../pricing/verandapricing';

import {
    DEFAULT_COLOR,
    getThumbnailPath,
    FALLBACK_THUMBNAIL,
} from '../visual/verandaAssets';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type VerandaOptionKey =
    | "color"
    | "daktype"
    | "goot"
    | "zijwand_links"
    | "zijwand_rechts"
    | "voorzijde"
    | "verlichting";

/** Color options */
export type ColorValue = VerandaColorId;

/** Roof type options */
export type DaktypeValue = 'poly_helder' | 'poly_opaal';

/** Front side options */
export type VoorzijdeValue = 'geen' | 'glas_schuifwand' | 'glas_schuifwand_helder' | 'glas_schuifwand_getint';

/** Side wall options (same for left and right) */
export type ZijwandValue = 'geen' | 'poly_spie' | 'sandwich_polyspie' | 'sandwich_vol';

/** Gutter options */
export type GootValue = 'classic' | 'cube' | 'deluxe';

/** Profile color options - DEPRECATED, use color instead */
export type ProfileColorValue = 'Antraciet (RAL7016)' | 'Crèmewit (RAL9001)' | 'Zwart (RAL9005)';

/**
 * Complete veranda configuration
 */
export type VerandaConfig = {
    color: ColorValue;
    daktype: DaktypeValue;
    goot: GootValue;
    zijwand_links: ZijwandValue;
    zijwand_rechts: ZijwandValue;
    voorzijde: VoorzijdeValue;
    verlichting: boolean;
    /** Derived LED info for display/debugging (does not affect base product line price) */
    ledQty?: number;
    ledUnitPrice?: number;
    ledTotalPrice?: number;
    ledWidthCm?: number;
    /** @deprecated Use color instead */
    profileColor?: ProfileColorValue;
    /** @deprecated Use color instead */
    kleur?: ColorValue;
};

/**
 * Extended config with product size context
 * Used when we need to calculate size-dependent pricing
 */
export type VerandaConfigWithSize = VerandaConfig & {
    productSize: VerandaProductSize;
};

// =============================================================================
// DEFAULT VALUES
// =============================================================================

/**
 * Default configuration for new configurator sessions
 * - color defaults to ral7016 (Antraciet) for immediate visualization
 * - Required fields (daktype, goot) are undefined to force user selection
 * - Optional fields default to 'geen' or false
 * 
 * NOTE: No persistence - config resets on refresh
 */
export const DEFAULT_VERANDA_CONFIG: Partial<VerandaConfig> = {
    color: DEFAULT_COLOR,  // Default to Antraciet for visualization
    // daktype: undefined, // Force choice - REQUIRED
    // goot: undefined,    // Force choice - REQUIRED
    zijwand_links: "geen",
    zijwand_rechts: "geen",
    voorzijde: "geen",
    verlichting: false,
};

// =============================================================================
// UI CONFIGURATION
// =============================================================================

/**
 * Helper to convert centralized pricing options to UI format
 * @param choice - Option choice from verandapricing.ts
 * @param defaultSize - Default size for price display (actual price calculated at runtime)
 */
function toUIChoice(choice: OptionChoice, defaultSize: VerandaProductSize = '600x300') {
    const price = getOptionPrice(choice.pricing, defaultSize);
    return {
        value: choice.id,
        label: choice.labelNL,
        description: choice.description || '',
        price,
        // Include pricing type hint for dynamic calculation
        pricingType: choice.pricing.type,
    };
}

/**
 * UI Configuration for the configurator wizard
 * This maps the centralized pricing to the UI component format
 * 
 * STEP ORDER (single source of truth):
 * 1. Color - required, no price
 * 2. Daktype (Roof type) - required
 * 3. Goot (Gutter) - required
 * 4. Zijwand links (Side wall left) - optional
 * 5. Zijwand rechts (Side wall right) - optional
 * 6. Voorzijde (Front side) - optional
 * 7. Verlichting (Extras) - optional
 * 
 * Note: Prices shown are for default size (600x300). 
 * Actual prices are calculated dynamically based on selected product size.
 */
export const VERANDA_OPTIONS_UI = [
    {
        key: "color",
        label: "Kleur profiel",
        step: 1,
        type: "color",
        required: true,
        choices: COLOR_OPTIONS.map(c => ({
            value: c.id,
            label: c.labelNL,
            hex: c.hex,
            description: c.description || '',
            price: 0,
        })),
    },
    {
        key: "daktype",
        label: "Daktype",
        step: 2,
        type: "card",
        required: true,
        choices: ROOF_TYPE_OPTIONS.map(c => ({
            ...toUIChoice(c),
            // Image will be dynamically resolved using getThumbnailPath in the component
            // based on selected color. Default to ral7016 for initial render.
            image: getThumbnailPath('daktype', c.id, DEFAULT_COLOR),
        })),
    },
    {
        key: "goot",
        label: "Goot optie",
        step: 3,
        type: "select",
        required: true,
        choices: GUTTER_OPTIONS.map(c => toUIChoice(c)),
    },
    {
        key: "zijwand_links",
        label: "Zijwand links",
        step: 4,
        type: "select",
        required: false,
        choices: SIDE_WALL_OPTIONS.map(c => toUIChoice(c)),
    },
    {
        key: "zijwand_rechts",
        label: "Zijwand rechts",
        step: 5,
        type: "select",
        required: false,
        choices: SIDE_WALL_OPTIONS.map(c => toUIChoice(c)),
    },
    {
        key: "voorzijde",
        label: "Voorzijde",
        step: 6,
        type: "select",
        required: false,
        choices: FRONT_SIDE_OPTIONS.map(c => toUIChoice(c)),
    },
    {
        key: "verlichting",
        label: "Extra's",
        step: 7,
        type: "toggle",
        required: false,
        choices: EXTRAS_OPTIONS.map(c => ({
            ...toUIChoice(c),
            value: true, // Toggle uses boolean
        })),
    },
] as const;

// =============================================================================
// RE-EXPORTS FROM PRICING MODULE
// =============================================================================

export { 
    VERANDA_OPTION_GROUPS,
    COLOR_OPTIONS,
    type VerandaProductSize,
    type VerandaColorId,
} from '../pricing/verandapricing';

export {
    DEFAULT_COLOR,
} from '../visual/verandaAssets';
