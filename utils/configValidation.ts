import { ProductConfig, VerandaConfig, SandwichConfig } from '../types';

export type ValidationResult = {
    ok: boolean;
    errors: string[];
};

export const validateConfig = (category: string, config: ProductConfig | undefined): ValidationResult => {
    const errors: string[] = [];

    if (!config || !config.data) {
        return { ok: false, errors: ['Geen configuratie gevonden.'] };
    }

    // Ensure category matches
    if (config.category !== category) {
        return { ok: false, errors: [`Configuratie categorie mismatch (${config.category} vs ${category})`] };
    }

    if (category === 'verandas') {
        const data = config.data as VerandaConfig;

        // Rule: Daktype required
        if (!data.daktype) {
            errors.push('Kies een daktype.');
        }

        // Rule: Goot required
        if (!data.goot) {
            errors.push('Kies een goot (Deluxe, Cube of Classic).');
        } else if (!['deluxe', 'cube', 'classic'].includes(data.goot)) {
            errors.push('Ongeldige goot optie.');
        }

        // Rule: Check allowed values (basic check)
        if (data.daktype && !['poly_helder', 'poly_opaal', 'glas'].includes(data.daktype)) {
            errors.push('Ongeldig daktype.');
        }

        // Implicit defaults for others are allowed ('geen'), so explicit presence check isn't strictly needed if typed correctly
        // But if data comes from partial state, we might want to check.
        // For now, relying on typed inputs.
    } else if (category === 'sandwichpanelen') {
        const data = config.data as SandwichConfig;

        // New rules: length + color are required
        const hasLength = typeof (data as any).lengthMm === 'number' || typeof (data as any).length === 'number';
        const hasColor = typeof (data as any).color === 'string' || typeof (data as any).kleur === 'string';

        if (!hasLength) {
            errors.push('Kies een lengte.');
        }
        if (!hasColor) {
            errors.push('Kies een kleur.');
        }
    }

    return {
        ok: errors.length === 0,
        errors
    };
};
