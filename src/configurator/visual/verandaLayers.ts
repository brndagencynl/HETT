import type { VerandaConfig } from "../schemas/veranda";

// --- Types & Helpers ---
export type ColorKey = 'antraciet' | 'cremewit' | 'gitzwart';
export type GootType = 'deluxe' | 'cube' | 'classic';

export const getColorKey = (color: any): ColorKey => {
    // Handle both string format (from state mainly) and potential object format
    const ral = (typeof color === 'string' ? color : color?.ral || '').toUpperCase();
    if (ral.includes('7016')) return 'antraciet';
    if (ral.includes('9001')) return 'cremewit';
    if (ral.includes('9005')) return 'gitzwart';
    return 'antraciet'; // Fallback
};

// Asset Mappings (Source of Truth)
export const GOOT_OVERLAYS: Record<GootType, Partial<Record<ColorKey, string>>> = {
    deluxe: {
        antraciet: '/assets/overkappingen/overlays/goot/deluxe/antraciet.png',
        cremewit: '/assets/overkappingen/overlays/goot/deluxe/cremewit.png',
        gitzwart: '/assets/overkappingen/overlays/goot/deluxe/gitzwart.png',
    },
    cube: {
        antraciet: '/assets/overkappingen/overlays/goot/cube/antraciet.png',
        cremewit: '/assets/overkappingen/overlays/goot/cube/cremewit.png',
        gitzwart: '/assets/overkappingen/overlays/goot/cube/gitzwart.png',
    },
    classic: {
        antraciet: '/assets/overkappingen/overlays/goot/classic/antraciet.png',
        cremewit: '/assets/overkappingen/overlays/goot/classic/cremewit.png',
        gitzwart: '/assets/overkappingen/overlays/goot/classic/gitzwart.png',
    },
};

// Placeholder for other overlays (can be expanded)
const DAK_OVERLAYS: Record<string, string> = {
    // placeholders
    // 'poly_opaal': '/assets/overkappingen/overlays/dak-opaal.png',
};

export type VisualLayer = {
    id: string;
    type: 'goot' | 'dak' | 'wand';
    src: string;
    zIndex: number;
};

// Resolver Function
export const resolveGootOverlay = (goot: GootType, colorKey: ColorKey, daktype?: string): string | undefined => {
    // Future expansion: Check if daktype specific overlay exists
    // const specificKey = `${colorKey}__${daktype}` as any;
    // if (GOOT_OVERLAYS[goot]?.[specificKey]) return GOOT_OVERLAYS[goot][specificKey];

    // Fallback to color only
    return GOOT_OVERLAYS[goot]?.[colorKey] || GOOT_OVERLAYS[goot]?.['antraciet'];
};

export function getVerandaLayers(cfg: VerandaConfig): VisualLayer[] {
    const layers: VisualLayer[] = [];

    // 1. DAK (Z: 10)
    // if (cfg.daktype && DAK_OVERLAYS[cfg.daktype]) {
    //     layers.push({ id: 'dak', type: 'dak', src: DAK_OVERLAYS[cfg.daktype], zIndex: 10 });
    // }

    // 2. GOOT (Z: 20)
    if (cfg.goot) {
        const colorKey = getColorKey(cfg.profileColor);
        const src = resolveGootOverlay(cfg.goot, colorKey, cfg.daktype);

        if (src) {
            layers.push({
                id: `goot-${cfg.goot}-${colorKey}`,
                type: 'goot',
                src,
                zIndex: 20
            });
        }
    }

    // 3. ZIJWANDEN (Z: 30)
    // ...

    return layers.sort((a, b) => a.zIndex - b.zIndex);
}

