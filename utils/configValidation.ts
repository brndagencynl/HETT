import { ProductConfig, VerandaConfig, SandwichConfig } from '../types';

export type ValidationResult = {
    ok: boolean;
    errors: string[];
    /** Debug info about what was checked */
    debug?: {
        configReceived: any;
        missingFields: string[];
    };
};

/**
 * Validates a product configuration before adding to cart.
 * 
 * For verandas (standard flow):
 * - Required: color, daktype, goot
 * - Optional with defaults: zijwand_links, zijwand_rechts, voorzijde, verlichting
 * 
 * @param category - Product category ('verandas' | 'sandwichpanelen')
 * @param config - ProductConfig object with category and data
 * @param debug - Enable debug logging (default: true in development)
 */
export const validateConfig = (
    category: string, 
    config: ProductConfig | undefined,
    debug: boolean = process.env.NODE_ENV !== 'production'
): ValidationResult => {
    const errors: string[] = [];
    const missingFields: string[] = [];

    // Debug: Log the full config received
    if (debug) {
        console.log('[validateConfig] Input:', {
            category,
            configExists: !!config,
            configCategory: config?.category,
            configData: config?.data,
        });
    }

    if (!config || !config.data) {
        if (debug) {
            console.warn('[validateConfig] Blocked: No config or config.data', { config });
        }
        return { 
            ok: false, 
            errors: ['Geen configuratie gevonden.'],
            debug: { configReceived: config, missingFields: ['config', 'config.data'] }
        };
    }

    // Ensure category matches
    if (config.category !== category) {
        if (debug) {
            console.warn('[validateConfig] Blocked: Category mismatch', {
                expected: category,
                received: config.category,
            });
        }
        return { 
            ok: false, 
            errors: [`Configuratie categorie mismatch (${config.category} vs ${category})`],
            debug: { configReceived: config, missingFields: ['category'] }
        };
    }

    if (category === 'verandas') {
        const data = config.data as VerandaConfig & { widthCm?: number; depthCm?: number };

        // Rule: Color required (has default in wizard, but verify)
        if (!data.color) {
            errors.push('Kies een kleur.');
            missingFields.push('color');
        }

        // Rule: Daktype required
        if (!data.daktype) {
            errors.push('Kies een daktype.');
            missingFields.push('daktype');
        }

        // Rule: Goot required
        if (!data.goot) {
            errors.push('Kies een goot (Deluxe, Cube of Classic).');
            missingFields.push('goot');
        } else if (!['deluxe', 'cube', 'classic'].includes(data.goot)) {
            errors.push('Ongeldige goot optie.');
        }

        // Rule: Check allowed values (basic check)
        if (data.daktype && !['poly_helder', 'poly_opaal', 'glas'].includes(data.daktype)) {
            errors.push('Ongeldig daktype.');
        }

        // Note: zijwand_links, zijwand_rechts, voorzijde, verlichting have defaults ('geen'/false)
        // so they don't need explicit validation - the wizard sets them.

        if (debug && errors.length > 0) {
            console.warn('[validateConfig] Veranda validation failed:', {
                errors,
                missingFields,
                dataReceived: data,
            });
        }
    } else if (category === 'sandwichpanelen') {
        const data = config.data as SandwichConfig;

        // New rules: length + color are required
        const hasLength = typeof (data as any).lengthMm === 'number' || typeof (data as any).length === 'number';
        const hasColor = typeof (data as any).color === 'string' || typeof (data as any).kleur === 'string';

        if (!hasLength) {
            errors.push('Kies een lengte.');
            missingFields.push('length');
        }
        if (!hasColor) {
            errors.push('Kies een kleur.');
            missingFields.push('color');
        }

        if (debug && errors.length > 0) {
            console.warn('[validateConfig] Sandwich validation failed:', {
                errors,
                missingFields,
                dataReceived: data,
            });
        }
    }

    if (debug && errors.length === 0) {
        console.log('[validateConfig] Validation passed ✓', { category });
    }

    return {
        ok: errors.length === 0,
        errors,
        debug: { configReceived: config, missingFields }
    };
};
