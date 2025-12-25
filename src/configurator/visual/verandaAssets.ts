/**
 * Veranda Asset Helper
 * ====================
 * 
 * Centralized asset path resolution for veranda configurator.
 * All thumbnail URLs and overlay URLs should use this helper.
 * 
 * ASSET STRUCTURE:
 * /public/renders/veranda/
 *   ├── {color}/                    (ral7016, ral9005, ral9001)
 *   │   ├── base.png               (base image for color)
 *   │   ├── daktype/{choiceId}.png
 *   │   ├── goot/{choiceId}.png
 *   │   ├── zijwand_links/{choiceId}.png
 *   │   ├── zijwand_rechts/{choiceId}.png
 *   │   └── voorzijde/{choiceId}.png
 *   └── shared/
 *       └── thumbnails/            (shared thumbnails)
 * 
 * OVERLAY STACK ORDER (z-index):
 * 1. base.png (z: 0)
 * 2. daktype overlay (z: 10)
 * 3. goot overlay (z: 20)
 * 4. zijwand_links overlay (z: 30)
 * 5. zijwand_rechts overlay (z: 40)
 * 6. voorzijde overlay (z: 50)
 * Note: verlichting has no visual overlay
 */

// =============================================================================
// TYPES
// =============================================================================

/** Valid color IDs */
export type VerandaColorId = 'ral7016' | 'ral9005' | 'ral9001';

/** Option groups that are color-dependent (have overlay images) */
export type ColorDependentGroup = 'daktype' | 'goot' | 'zijwand_links' | 'zijwand_rechts' | 'voorzijde';

/** All visual option groups (groups that render overlays) - in exact stack order */
export const OVERLAY_GROUPS: readonly ColorDependentGroup[] = [
  'daktype',
  'goot',
  'zijwand_links',
  'zijwand_rechts',
  'voorzijde',
] as const;

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
const NO_OVERLAY_GROUPS: string[] = ['verlichting', 'color'];

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
 * Verlichting and color are option-only without visual overlays
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
export function getBaseImagePath(color: VerandaColorId = DEFAULT_COLOR): string {
  return `${RENDER_BASE_PATH}/${color}/base.png`;
}

/**
 * Get the overlay image path for an option selection
 * 
 * @param groupId - The option group (e.g., 'daktype', 'voorzijde')
 * @param choiceId - The selected choice ID (e.g., 'poly_helder', 'glas_schuifwand')
 * @param color - The selected color
 * @returns Path to overlay image, or null if no overlay should be rendered
 */
export function getOverlayPath(
  groupId: string,
  choiceId: string | boolean | undefined | null,
  color: VerandaColorId = DEFAULT_COLOR
): string | null {
  // No overlay for groups without images (e.g., verlichting)
  if (!hasOverlayImages(groupId)) return null;
  
  // No overlay for 'geen' or undefined selections
  if (!shouldRenderOverlay(choiceId)) return null;
  
  // Convert boolean to null (booleans are for option-only toggles)
  if (typeof choiceId === 'boolean') return null;
  
  // Color-dependent path
  return `${RENDER_BASE_PATH}/${color}/${groupId}/${choiceId}.png`;
}

/**
 * Get thumbnail image path for an option choice
 * Used in the option selector cards/radios
 */
export function getThumbnailPath(
  groupId: string,
  choiceId: string,
  color: VerandaColorId = DEFAULT_COLOR
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
  return `${RENDER_BASE_PATH}/${color}/thumbnails/${groupId}/${choiceId}.png`;
}

/**
 * Get color swatch/preview image for color selector
 */
export function getColorSwatchPath(color: VerandaColorId): string {
  return `${RENDER_BASE_PATH}/${color}/swatch.png`;
}

/**
 * Get color preview image (larger than swatch, for cards)
 */
export function getColorPreviewPath(color: VerandaColorId): string {
  return `${RENDER_BASE_PATH}/${color}/preview.png`;
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
  color?: VerandaColorId;
  daktype?: string;
  goot?: string;
  zijwand_links?: string;
  zijwand_rechts?: string;
  voorzijde?: string;
  verlichting?: boolean;
}

/**
 * Z-index values for each overlay layer
 * Follows the exact order: daktype → goot → zijwand_links → zijwand_rechts → voorzijde
 */
const OVERLAY_Z_INDEX: Record<ColorDependentGroup, number> = {
  daktype: 10,
  goot: 20,
  zijwand_links: 30,
  zijwand_rechts: 40,
  voorzijde: 50,
};

/**
 * Build the complete visualization layer stack
 * Returns layers in correct z-order for rendering
 * 
 * LAYER ORDER:
 * 1. Base image (color-specific)
 * 2. Daktype overlay
 * 3. Goot overlay
 * 4. Zijwand links overlay
 * 5. Zijwand rechts overlay
 * 6. Voorzijde overlay
 * (verlichting has no visual overlay)
 */
export function buildVisualizationLayers(config: VerandaVisualizationConfig): VisualizationLayer[] {
  const color = normalizeColorId(config.color);
  const layers: VisualizationLayer[] = [];
  
  // 1. Base image (always present)
  layers.push({
    id: 'base',
    src: getBaseImagePath(color),
    zIndex: 0,
    alt: 'Veranda basis',
  });
  
  // Add overlays in the exact order defined by OVERLAY_GROUPS
  for (const groupId of OVERLAY_GROUPS) {
    const choiceId = config[groupId];
    const overlayPath = getOverlayPath(groupId, choiceId, color);
    
    if (overlayPath) {
      layers.push({
        id: `${groupId}-${choiceId}`,
        src: overlayPath,
        zIndex: OVERLAY_Z_INDEX[groupId],
        alt: `${groupId}: ${choiceId}`,
      });
    }
  }
  
  // Note: Verlichting is an option-only toggle without visual overlays
  
  return layers.sort((a, b) => a.zIndex - b.zIndex);
}

/**
 * Get overlay stack for the current configuration
 * Alias for buildVisualizationLayers for clarity
 */
export const getOverlayStack = buildVisualizationLayers;

// =============================================================================
// RENDER SNAPSHOT BUILDER
// =============================================================================

/**
 * RenderSnapshot structure for cart storage
 */
export interface RenderSnapshot {
  baseImageUrl: string;
  overlayUrls: string[];
  capturedAt: string;
}

/**
 * Build a render snapshot from veranda configuration
 * Use this when adding to cart to capture the visual state
 * 
 * @param config - Veranda configuration with color and options
 * @returns RenderSnapshot ready for cart storage
 */
export function buildRenderSnapshot(config: VerandaVisualizationConfig): RenderSnapshot {
  const layers = buildVisualizationLayers(config);
  
  // First layer is always base
  const baseLayer = layers.find(l => l.id === 'base');
  const overlayLayers = layers.filter(l => l.id !== 'base');
  
  return {
    baseImageUrl: baseLayer?.src || FALLBACK_IMAGE,
    overlayUrls: overlayLayers.map(l => l.src),
    capturedAt: new Date().toISOString(),
  };
}

// =============================================================================
// PRELOADING
// =============================================================================

/**
 * Get paths to preload for current step
 * Only preloads base image + current and next step overlays
 */
export function getPreloadPaths(
  currentStepIndex: number,
  config: VerandaVisualizationConfig
): string[] {
  const color = normalizeColorId(config.color);
  const paths: string[] = [];
  
  // Always preload base image for selected color
  paths.push(getBaseImagePath(color));
  
  // Get overlay groups to preload (current - 1 to current + 1)
  const startIdx = Math.max(0, currentStepIndex - 2); // Adjust for color step offset
  const endIdx = Math.min(OVERLAY_GROUPS.length, currentStepIndex + 1);
  const groupsToPreload = OVERLAY_GROUPS.slice(startIdx, endIdx);
  
  // Add overlay paths for steps to preload
  for (const groupId of groupsToPreload) {
    const choiceId = config[groupId];
    const overlayPath = getOverlayPath(groupId, choiceId, color);
    if (overlayPath) {
      paths.push(overlayPath);
    }
  }
  
  return paths;
}

/**
 * Preload images for better UX
 */
export function preloadImages(paths: string[]): void {
  paths.forEach(path => {
    const img = new Image();
    img.src = path;
  });
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
