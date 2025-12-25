/**
 * Veranda Visual Layers
 * 
 * This module handles the visualization layer system for the veranda configurator.
 * All asset paths are resolved through verandaAssets.ts for consistency.
 */

import type { VerandaConfig } from "../schemas/veranda";
import {
    type VerandaColorId,
    type VisualizationLayer,
    buildVisualizationLayers,
    normalizeColorId,
    DEFAULT_COLOR,
} from './verandaAssets';

// Re-export for backwards compatibility
export type { VisualizationLayer as VisualLayer };

/**
 * Get visualization layers for a veranda configuration
 * Returns an array of layers sorted by z-index for rendering
 */
export function getVerandaLayers(cfg: VerandaConfig): VisualizationLayer[] {
    // Resolve kleur from config (supports both new kleur and legacy profileColor)
    const kleur = cfg.kleur || normalizeColorId((cfg as any).profileColor) || DEFAULT_COLOR;
    
    return buildVisualizationLayers({
        kleur,
        daktype: cfg.daktype,
        voorzijde: cfg.voorzijde,
        zijwand_links: cfg.zijwand_links,
        zijwand_rechts: cfg.zijwand_rechts,
        goot: cfg.goot,
        verlichting: cfg.verlichting,
    });
}

// Re-export utilities
export { normalizeColorId, DEFAULT_COLOR } from './verandaAssets';

