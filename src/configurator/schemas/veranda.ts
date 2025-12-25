/**
 * Veranda Configuration Schema
 * 
 * This file defines the TypeScript types and UI configuration for the veranda configurator.
 * Pricing data is centralized in ../pricing/verandapricing.ts
 * Asset paths are centralized in ../visual/verandaAssets.ts
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
} from '../visual/verandaAssets';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type VerandaOptionKey =
    | "kleur"
    | "daktype"
    | "goot"
    | "voorzijde"
    | "zijwand_links"
    | "zijwand_rechts"
    | "verlichting";

/** Color options */
export type KleurValue = VerandaColorId;

/** Roof type options */
export type DaktypeValue = 'poly_helder' | 'poly_opaal';

/** Front side options */
export type VoorzijdeValue = 'geen' | 'glas_schuifwand';

/** Side wall options (same for left and right) */
export type ZijwandValue = 'geen' | 'poly_spie' | 'sandwich_polyspie' | 'sandwich_vol';

/** Gutter options */
export type GootValue = 'classic' | 'cube' | 'deluxe';

/** Profile color options - DEPRECATED, use kleur instead */
export type ProfileColorValue = 'Antraciet (RAL7016)' | 'Crèmewit (RAL9001)' | 'Zwart (RAL9005)';

/**
 * Complete veranda configuration
 */
export type VerandaConfig = {
    kleur: KleurValue;
    daktype: DaktypeValue;
    goot: GootValue;
    voorzijde: VoorzijdeValue;
    zijwand_links: ZijwandValue;
    zijwand_rechts: ZijwandValue;
    verlichting: boolean;
    /** @deprecated Use kleur instead */
    profileColor?: ProfileColorValue;
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
 * - kleur defaults to ral7016 (Antraciet) for immediate visualization
 * - Required fields (daktype, goot) are undefined to force user selection
 * - Optional fields default to 'geen' or false
 * 
 * NOTE: No persistence - config resets on refresh
 */
export const DEFAULT_VERANDA_CONFIG: Partial<VerandaConfig> = {
    kleur: DEFAULT_COLOR,  // Default to Antraciet for visualization
    // daktype: undefined, // Force choice - REQUIRED
    // goot: undefined,    // Force choice - REQUIRED
    voorzijde: "geen",
    zijwand_links: "geen",
    zijwand_rechts: "geen",
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
 * STEP ORDER:
 * 1. Kleur (Color) - required, no price
 * 2. Daktype (Roof type) - required
 * 3. Goot (Gutter) - required
 * 4. Voorzijde (Front side) - optional
 * 5. Zijwand links (Side wall left) - optional
 * 6. Zijwand rechts (Side wall right) - optional
 * 7. Verlichting (Extras) - optional
 * 
 * Note: Prices shown are for default size (600x300). 
 * Actual prices are calculated dynamically based on selected product size.
 */
export const VERANDA_OPTIONS_UI = [
    {
        key: "kleur",
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
            image: c.id === 'poly_helder' 
                ? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400"
                : "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=400",
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
        key: "voorzijde",
        label: "Voorzijde",
        step: 4,
        type: "select",
        required: false,
        choices: FRONT_SIDE_OPTIONS.map(c => toUIChoice(c)),
    },
    {
        key: "zijwand_links",
        label: "Zijwand links",
        step: 5,
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
        key: "verlichting",
        label: "Extra's",
        step: 6,
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
