/**
 * Veranda Configuration Schema
 * 
 * This file defines the TypeScript types and UI configuration for the veranda configurator.
 * Pricing data is centralized in ../pricing/verandapricing.ts
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
    type VerandaProductSize,
    type OptionChoice,
    getOptionPrice,
} from '../pricing/verandapricing';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type VerandaOptionKey =
    | "daktype"
    | "goot"
    | "voorzijde"
    | "zijwand_links"
    | "zijwand_rechts"
    | "verlichting";

/** Roof type options */
export type DaktypeValue = 'poly_helder' | 'poly_opaal';

/** Front side options */
export type VoorzijdeValue = 'geen' | 'glas_schuifwand';

/** Side wall options (same for left and right) */
export type ZijwandValue = 'geen' | 'poly_spie' | 'sandwich_polyspie' | 'sandwich_vol';

/** Gutter options */
export type GootValue = 'classic' | 'cube' | 'deluxe';

/** Profile color options */
export type ProfileColorValue = 'Antraciet (RAL7016)' | 'Crèmewit (RAL9001)' | 'Zwart (RAL9005)';

/**
 * Complete veranda configuration
 */
export type VerandaConfig = {
    daktype: DaktypeValue;
    goot: GootValue;
    voorzijde: VoorzijdeValue;
    zijwand_links: ZijwandValue;
    zijwand_rechts: ZijwandValue;
    verlichting: boolean;
    profileColor: ProfileColorValue;
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
 * Required fields (daktype, goot) are undefined to force user selection
 */
export const DEFAULT_VERANDA_CONFIG: Partial<VerandaConfig> = {
    // daktype: undefined, // Force choice - REQUIRED
    // goot: undefined,    // Force choice - REQUIRED
    voorzijde: "geen",
    zijwand_links: "geen",
    zijwand_rechts: "geen",
    verlichting: false,
    profileColor: 'Antraciet (RAL7016)'
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
 * Note: Prices shown are for default size (600x300). 
 * Actual prices are calculated dynamically based on selected product size.
 */
export const VERANDA_OPTIONS_UI = [
    {
        key: "profileColor",
        label: "Kleur profiel",
        type: "radio",
        choices: [
            { value: 'Antraciet (RAL7016)', label: 'Antraciet (RAL7016)', hex: '#293133', price: 0 },
            { value: 'Crèmewit (RAL9001)', label: 'Crèmewit (RAL9001)', hex: '#FDF4E3', price: 0 },
            { value: 'Zwart (RAL9005)', label: 'Zwart (RAL9005)', hex: '#0E0E10', price: 0 }
        ]
    },
    {
        key: "daktype",
        label: "Daktype",
        step: 1,
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
        key: "voorzijde",
        label: "Voorzijde",
        step: 2,
        type: "select",
        required: false,
        choices: FRONT_SIDE_OPTIONS.map(c => toUIChoice(c)),
    },
    {
        key: "zijwand_links",
        label: "Zijwand links",
        step: 3,
        type: "select",
        required: false,
        choices: SIDE_WALL_OPTIONS.map(c => toUIChoice(c)),
    },
    {
        key: "zijwand_rechts",
        label: "Zijwand rechts",
        step: 3,
        type: "select",
        required: false,
        choices: SIDE_WALL_OPTIONS.map(c => toUIChoice(c)),
    },
    {
        key: "goot",
        label: "Goot optie",
        step: 4,
        type: "select",
        required: true,
        choices: GUTTER_OPTIONS.map(c => toUIChoice(c)),
    },
    {
        key: "verlichting",
        label: "Extra's",
        step: 5,
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
    type VerandaProductSize,
} from '../pricing/verandapricing';
