/**
 * Veranda Asset Helper
 * ====================
 * 
 * Centralized asset path resolution for veranda configurator.
 * All thumbnail URLs and overlay URLs should use this helper.
 * 
 * ASSET STRUCTURE:
 * /public/renders/veranda/
 *   ├── {kleur}/                    (ral7016, ral9005, ral9001)
 *   │   ├── base.png               (base image for color)
 *   │   ├── daktype/{choiceId}.png
 *   │   ├── voorzijde/{choiceId}.png
 *   │   ├── zijwand_links/{choiceId}.png
 *   │   ├── zijwand_rechts/{choiceId}.png
 *   │   └── goot/{choiceId}.png
 *   └── shared/
 *       └── extras/{choiceId}.png  (verlichting - not color dependent)
 */

// =============================================================================
// TYPES
// =============================================================================

/** Valid color IDs */
export type VerandaColorId = 'ral7016' | 'ral9005' | 'ral9001';

/** Option groups that are color-dependent (have overlay images) */
export type ColorDependentGroup = 'daktype' | 'voorzijde' | 'zijwand_links' | 'zijwand_rechts' | 'goot';

/** All visual option groups (groups that render overlays) */
export type VisualOptionGroup = ColorDependentGroup;

/** Asset type for different use cases */
export type AssetType = 'base' | 'overlay' | 'thumbnail';

// =============================================================================
// CONSTANTS
// =============================================================================

/** Base path for all veranda renders */
const RENDER_BASE_PATH = '/renders/veranda';

/** Default color when none is selected */
export const DEFAULT_COLOR: VerandaColorId = 'ral7016';

/** Fallback/placeholder image */
export const FALLBACK_IMAGE = '/renders/veranda/fallback.png';

/** Choice IDs that should not have overlays */
const NO_OVERLAY_CHOICES = ['geen', 'none', 'false', ''];

/** Groups that do NOT render overlays (option-only, no images) */
const NO_OVERLAY_GROUPS: string[] = ['verlichting'];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a choice should have an overlay
 * 'geen' and similar values should not render overlays
 */
export function shouldRenderOverlay(choiceId: string | boolean | undefined | null): boolean {
  if (choiceId === undefined || choiceId === null) return false;
  if (typeof choiceId === 'boolean') return choiceId === true;
  return !NO_OVERLAY_CHOICES.includes(choiceId.toLowerCase());
}

/**
 * Check if a group has overlay images
 * Verlichting is an option-only toggle without visual overlays
 */
export function hasOverlayImages(groupId: string): boolean {
  return !NO_OVERLAY_GROUPS.includes(groupId);
}

/**
 * Normalize color value to valid color ID
 * Handles various input formats for backwards compatibility
 */
export function normalizeColorId(color: string | undefined | null): VerandaColorId {
  if (!color) return DEFAULT_COLOR;
  
  const lower = color.toLowerCase();
  
  // Direct ID match
  if (lower === 'ral7016' || lower === 'ral9005' || lower === 'ral9001') {
    return lower as VerandaColorId;
  }
  
  // Legacy format matching (from profileColor)
  if (lower.includes('7016') || lower.includes('antraciet')) return 'ral7016';
  if (lower.includes('9005') || lower.includes('zwart') || lower.includes('gitzwart')) return 'ral9005';
  if (lower.includes('9001') || lower.includes('creme') || lower.includes('crèmewit') || lower.includes('cremewit')) return 'ral9001';
  
  return DEFAULT_COLOR;
}

// =============================================================================
// ASSET PATH GENERATORS
// =============================================================================

/**
 * Get the base image path for a color
 */
export function getBaseImagePath(kleur: VerandaColorId = DEFAULT_COLOR): string {
  return `${RENDER_BASE_PATH}/${kleur}/base.png`;
}

/**
 * Get the overlay image path for an option selection
 * 
 * @param groupId - The option group (e.g., 'daktype', 'voorzijde')
 * @param choiceId - The selected choice ID (e.g., 'poly_helder', 'glas_schuifwand')
 * @param kleur - The selected color
 * @returns Path to overlay image, or null if no overlay should be rendered
 */
export function getOverlayPath(
  groupId: string,
  choiceId: string | boolean | undefined | null,
  kleur: VerandaColorId = DEFAULT_COLOR
): string | null {
  // No overlay for groups without images (e.g., verlichting)
  if (!hasOverlayImages(groupId)) return null;
  
  // No overlay for 'geen' or undefined selections
  if (!shouldRenderOverlay(choiceId)) return null;
  
  // Convert boolean to null (booleans are for option-only toggles)
  if (typeof choiceId === 'boolean') return null;
  
  // Color-dependent path
  return `${RENDER_BASE_PATH}/${kleur}/${groupId}/${choiceId}.png`;
}

/**
 * Get thumbnail image path for an option choice
 * Used in the option selector cards/radios
 */
export function getThumbnailPath(
  groupId: string,
  choiceId: string,
  kleur: VerandaColorId = DEFAULT_COLOR
): string {
  // 'geen' option uses a generic "none" thumbnail
  if (NO_OVERLAY_CHOICES.includes(choiceId.toLowerCase())) {
    return `${RENDER_BASE_PATH}/shared/thumbnails/geen.png`;
  }
  
  // Groups without overlay images (verlichting) - use shared thumbnails
  if (!hasOverlayImages(groupId)) {
    return `${RENDER_BASE_PATH}/shared/thumbnails/${groupId}/${choiceId}.png`;
  }
  
  // Color-dependent thumbnail
  return `${RENDER_BASE_PATH}/${kleur}/thumbnails/${groupId}/${choiceId}.png`;
}

/**
 * Get color swatch/preview image for color selector
 */
export function getColorSwatchPath(kleur: VerandaColorId): string {
  return `${RENDER_BASE_PATH}/${kleur}/swatch.png`;
}

/**
 * Get color preview image (larger than swatch, for cards)
 */
export function getColorPreviewPath(kleur: VerandaColorId): string {
  return `${RENDER_BASE_PATH}/${kleur}/preview.png`;
}

// =============================================================================
// VISUALIZATION STACK BUILDER
// =============================================================================

export interface VisualizationLayer {
  id: string;
  src: string;
  zIndex: number;
  alt: string;
}

export interface VerandaVisualizationConfig {
  kleur?: VerandaColorId;
  daktype?: string;
  voorzijde?: string;
  zijwand_links?: string;
  zijwand_rechts?: string;
  goot?: string;
  verlichting?: boolean;
}

/**
 * Build the complete visualization layer stack
 * Returns layers in correct z-order for rendering
 */
export function buildVisualizationLayers(config: VerandaVisualizationConfig): VisualizationLayer[] {
  const kleur = normalizeColorId(config.kleur);
  const layers: VisualizationLayer[] = [];
  
  // 1. Base image (always present)
  layers.push({
    id: 'base',
    src: getBaseImagePath(kleur),
    zIndex: 0,
    alt: 'Veranda basis',
  });
  
  // 2. Daktype overlay (z: 10)
  const daktypeOverlay = getOverlayPath('daktype', config.daktype, kleur);
  if (daktypeOverlay) {
    layers.push({
      id: `daktype-${config.daktype}`,
      src: daktypeOverlay,
      zIndex: 10,
      alt: `Daktype: ${config.daktype}`,
    });
  }
  
  // 3. Goot overlay (z: 20)
  const gootOverlay = getOverlayPath('goot', config.goot, kleur);
  if (gootOverlay) {
    layers.push({
      id: `goot-${config.goot}`,
      src: gootOverlay,
      zIndex: 20,
      alt: `Goot: ${config.goot}`,
    });
  }
  
  // 4. Voorzijde overlay (z: 30)
  const voorzijdeOverlay = getOverlayPath('voorzijde', config.voorzijde, kleur);
  if (voorzijdeOverlay) {
    layers.push({
      id: `voorzijde-${config.voorzijde}`,
      src: voorzijdeOverlay,
      zIndex: 30,
      alt: `Voorzijde: ${config.voorzijde}`,
    });
  }
  
  // 5. Zijwand links overlay (z: 40)
  const zijwandLinksOverlay = getOverlayPath('zijwand_links', config.zijwand_links, kleur);
  if (zijwandLinksOverlay) {
    layers.push({
      id: `zijwand_links-${config.zijwand_links}`,
      src: zijwandLinksOverlay,
      zIndex: 40,
      alt: `Zijwand links: ${config.zijwand_links}`,
    });
  }
  
  // 6. Zijwand rechts overlay (z: 50)
  const zijwandRechtsOverlay = getOverlayPath('zijwand_rechts', config.zijwand_rechts, kleur);
  if (zijwandRechtsOverlay) {
    layers.push({
      id: `zijwand_rechts-${config.zijwand_rechts}`,
      src: zijwandRechtsOverlay,
      zIndex: 50,
      alt: `Zijwand rechts: ${config.zijwand_rechts}`,
    });
  }
  
  // Note: Verlichting is an option-only toggle without visual overlays
  
  return layers.sort((a, b) => a.zIndex - b.zIndex);
}

// =============================================================================
// COLOR OPTIONS DATA
// =============================================================================

export interface ColorOption {
  id: VerandaColorId;
  label: string;
  labelNL: string;
  hex: string;
  description?: string;
}

export const COLOR_OPTIONS: ColorOption[] = [
  {
    id: 'ral7016',
    label: 'Anthracite (RAL 7016)',
    labelNL: 'Antraciet (RAL 7016)',
    hex: '#293133',
    description: 'Populaire donkergrijze kleur, past bij moderne architectuur.',
  },
  {
    id: 'ral9005',
    label: 'Black (RAL 9005)',
    labelNL: 'Zwart (RAL 9005)',
    hex: '#0E0E10',
    description: 'Strakke zwarte afwerking voor een premium uitstraling.',
  },
  {
    id: 'ral9001',
    label: 'Cream white (RAL 9001)',
    labelNL: 'Crème (RAL 9001)',
    hex: '#FDF4E3',
    description: 'Warme crèmewitte kleur, ideaal bij lichte gevels.',
  },
];

/**
 * Get color option by ID
 */
export function getColorOption(id: VerandaColorId): ColorOption | undefined {
  return COLOR_OPTIONS.find(c => c.id === id);
}
