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

/** Option groups that are color-dependent */
export type ColorDependentGroup = 'daktype' | 'voorzijde' | 'zijwand_links' | 'zijwand_rechts' | 'goot';

/** Option groups that use shared assets */
export type SharedGroup = 'verlichting';

/** All visual option groups */
export type VisualOptionGroup = ColorDependentGroup | SharedGroup;

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

/** Groups that use shared assets (not color-dependent) */
const SHARED_ASSET_GROUPS: SharedGroup[] = ['verlichting'];

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
 * Check if a group uses shared assets (not color-dependent)
 */
export function isSharedAssetGroup(groupId: string): boolean {
  return SHARED_ASSET_GROUPS.includes(groupId as SharedGroup);
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
  // No overlay for 'geen' or undefined selections
  if (!shouldRenderOverlay(choiceId)) return null;
  
  // Convert boolean (verlichting) to choice ID
  const resolvedChoiceId = typeof choiceId === 'boolean' 
    ? (choiceId ? 'led_verlichting' : null)
    : choiceId;
  
  if (!resolvedChoiceId) return null;
  
  // Use shared path for non-color-dependent groups (extras/verlichting)
  if (isSharedAssetGroup(groupId)) {
    return `${RENDER_BASE_PATH}/shared/extras/${resolvedChoiceId}.png`;
  }
  
  // Color-dependent path
  return `${RENDER_BASE_PATH}/${kleur}/${groupId}/${resolvedChoiceId}.png`;
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
  
  // Shared asset groups
  if (isSharedAssetGroup(groupId)) {
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
  
  // 7. Verlichting overlay (z: 60) - uses shared assets
  const verlichtingOverlay = getOverlayPath('verlichting', config.verlichting, kleur);
  if (verlichtingOverlay) {
    layers.push({
      id: 'verlichting-led',
      src: verlichtingOverlay,
      zIndex: 60,
      alt: 'LED Verlichting',
    });
  }
  
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
