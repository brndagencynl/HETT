/**
 * Veranda Matrix Catalog
 * =======================
 * 
 * Single source of truth for the veranda product matrix.
 * 
 * STRATEGY:
 * - Full matrix: 10 widths × 6 depths = 60 SKUs
 * - Standard visible: 3 widths × 4 depths = 12 products shown to customers
 * - Hidden anchors: 48 products used only for pricing/mapping in custom configurator
 * 
 * VISIBILITY RULES:
 * - 'public': Shown in listings, search, sitemaps
 * - 'hidden_anchor': Never shown to customers, only for pricing lookup
 */

// =============================================================================
// MATRIX DIMENSIONS
// =============================================================================

/**
 * All available widths in the matrix (in cm)
 * Represents the actual veranda widths, not sizes in mm
 */
export const MATRIX_WIDTHS = [306, 406, 506, 606, 706, 806, 906, 1006, 1106, 1206] as const;

/**
 * All available depths in the matrix (in cm)
 */
export const MATRIX_DEPTHS = [250, 300, 350, 400, 450, 500] as const;

export type MatrixWidth = typeof MATRIX_WIDTHS[number];
export type MatrixDepth = typeof MATRIX_DEPTHS[number];

// =============================================================================
// VISIBILITY RULES
// =============================================================================

/**
 * Standard visible widths (shown to customers)
 */
export const STANDARD_VISIBLE_WIDTHS: MatrixWidth[] = [506, 606, 706];

/**
 * Standard visible depths (shown to customers)
 */
export const STANDARD_VISIBLE_DEPTHS: MatrixDepth[] = [250, 300, 350, 400];

/**
 * Product visibility type
 */
export type ProductVisibility = 'public' | 'hidden_anchor';

/**
 * Check if a width×depth combination is standard visible (shown to customers)
 * Only 12 combinations are public: widths [506,606,706] × depths [250,300,350,400]
 */
export function isStandardVisible(width: number, depth: number): boolean {
  return (
    STANDARD_VISIBLE_WIDTHS.includes(width as MatrixWidth) &&
    STANDARD_VISIBLE_DEPTHS.includes(depth as MatrixDepth)
  );
}

/**
 * Get visibility for a width×depth combination
 */
export function getProductVisibility(width: number, depth: number): ProductVisibility {
  return isStandardVisible(width, depth) ? 'public' : 'hidden_anchor';
}

// =============================================================================
// ANCHOR MAPPING (for custom configurator)
// =============================================================================

/**
 * Map an input width (in cm) to the nearest anchor width (ceiling)
 * If above max, clamps to max width
 * 
 * @param inputWidthCm - User's requested width in cm
 * @returns The smallest MATRIX_WIDTH that is >= inputWidthCm
 * 
 * @example
 * mapToAnchorWidth(300) => 306  // rounds up to nearest
 * mapToAnchorWidth(500) => 506  // rounds up
 * mapToAnchorWidth(506) => 506  // exact match
 * mapToAnchorWidth(1300) => 1206 // clamped to max
 */
export function mapToAnchorWidth(inputWidthCm: number): MatrixWidth {
  // Find the smallest width that is >= input
  for (const width of MATRIX_WIDTHS) {
    if (width >= inputWidthCm) {
      return width;
    }
  }
  // If above all, clamp to max
  return MATRIX_WIDTHS[MATRIX_WIDTHS.length - 1];
}

/**
 * Map an input depth (in cm) to the nearest anchor depth (ceiling)
 * If above max, clamps to max depth
 * 
 * @param inputDepthCm - User's requested depth in cm
 * @returns The smallest MATRIX_DEPTH that is >= inputDepthCm
 * 
 * @example
 * mapToAnchorDepth(260) => 300  // rounds up to nearest
 * mapToAnchorDepth(350) => 350  // exact match
 * mapToAnchorDepth(600) => 500  // clamped to max
 */
export function mapToAnchorDepth(inputDepthCm: number): MatrixDepth {
  // Find the smallest depth that is >= input
  for (const depth of MATRIX_DEPTHS) {
    if (depth >= inputDepthCm) {
      return depth;
    }
  }
  // If above all, clamp to max
  return MATRIX_DEPTHS[MATRIX_DEPTHS.length - 1];
}

/**
 * Map custom dimensions to an anchor size key
 * Returns format: "WIDTHxDEPTH" (e.g., "606x350")
 * 
 * @param widthCm - User's requested width in cm
 * @param depthCm - User's requested depth in cm
 * @returns Size key string for the anchor product
 */
export function mapToAnchorSize(widthCm: number, depthCm: number): string {
  const anchorWidth = mapToAnchorWidth(widthCm);
  const anchorDepth = mapToAnchorDepth(depthCm);
  return `${anchorWidth}x${anchorDepth}`;
}

/**
 * Get the anchor size as an object
 */
export function getAnchorSizeObject(widthCm: number, depthCm: number): { width: MatrixWidth; depth: MatrixDepth } {
  return {
    width: mapToAnchorWidth(widthCm),
    depth: mapToAnchorDepth(depthCm),
  };
}

// =============================================================================
// SIZE KEY UTILITIES
// =============================================================================

/**
 * Generate a size key from width and depth
 */
export function toSizeKey(width: number, depth: number): string {
  return `${width}x${depth}`;
}

/**
 * Parse a size key back to width and depth
 */
export function parseSizeKey(sizeKey: string): { width: number; depth: number } | null {
  const match = sizeKey.match(/^(\d+)x(\d+)$/);
  if (!match) return null;
  return {
    width: parseInt(match[1], 10),
    depth: parseInt(match[2], 10),
  };
}

/**
 * Check if a size key is valid (exists in matrix)
 */
export function isValidMatrixSize(sizeKey: string): boolean {
  const parsed = parseSizeKey(sizeKey);
  if (!parsed) return false;
  return (
    MATRIX_WIDTHS.includes(parsed.width as MatrixWidth) &&
    MATRIX_DEPTHS.includes(parsed.depth as MatrixDepth)
  );
}

// =============================================================================
// MATRIX GENERATION HELPERS
// =============================================================================

/**
 * Generate all matrix size combinations
 */
export function getAllMatrixSizes(): Array<{ width: MatrixWidth; depth: MatrixDepth; visibility: ProductVisibility }> {
  const sizes: Array<{ width: MatrixWidth; depth: MatrixDepth; visibility: ProductVisibility }> = [];
  
  for (const width of MATRIX_WIDTHS) {
    for (const depth of MATRIX_DEPTHS) {
      sizes.push({
        width,
        depth,
        visibility: getProductVisibility(width, depth),
      });
    }
  }
  
  return sizes;
}

/**
 * Get only public (visible) matrix sizes
 */
export function getPublicMatrixSizes(): Array<{ width: MatrixWidth; depth: MatrixDepth }> {
  return getAllMatrixSizes()
    .filter(s => s.visibility === 'public')
    .map(({ width, depth }) => ({ width, depth }));
}

/**
 * Get only hidden anchor matrix sizes
 */
export function getHiddenAnchorSizes(): Array<{ width: MatrixWidth; depth: MatrixDepth }> {
  return getAllMatrixSizes()
    .filter(s => s.visibility === 'hidden_anchor')
    .map(({ width, depth }) => ({ width, depth }));
}

// =============================================================================
// CUSTOM FEE
// =============================================================================

/**
 * Custom/maatwerk fee added to anchor product price
 * This covers the additional work for non-standard dimensions
 */
export const MAATWERK_CUSTOM_FEE = 750;

// =============================================================================
// DEV MODE VALIDATION
// =============================================================================

/**
 * Validate matrix configuration (run in dev mode)
 */
export function validateMatrixCatalog(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check widths are sorted ascending
  for (let i = 1; i < MATRIX_WIDTHS.length; i++) {
    if (MATRIX_WIDTHS[i] <= MATRIX_WIDTHS[i - 1]) {
      errors.push(`MATRIX_WIDTHS not sorted: ${MATRIX_WIDTHS[i - 1]} >= ${MATRIX_WIDTHS[i]}`);
    }
  }
  
  // Check depths are sorted ascending
  for (let i = 1; i < MATRIX_DEPTHS.length; i++) {
    if (MATRIX_DEPTHS[i] <= MATRIX_DEPTHS[i - 1]) {
      errors.push(`MATRIX_DEPTHS not sorted: ${MATRIX_DEPTHS[i - 1]} >= ${MATRIX_DEPTHS[i]}`);
    }
  }
  
  // Check visible widths are subset of matrix widths
  for (const w of STANDARD_VISIBLE_WIDTHS) {
    if (!MATRIX_WIDTHS.includes(w)) {
      errors.push(`STANDARD_VISIBLE_WIDTHS contains invalid width: ${w}`);
    }
  }
  
  // Check visible depths are subset of matrix depths
  for (const d of STANDARD_VISIBLE_DEPTHS) {
    if (!MATRIX_DEPTHS.includes(d)) {
      errors.push(`STANDARD_VISIBLE_DEPTHS contains invalid depth: ${d}`);
    }
  }
  
  // Verify expected counts
  const allSizes = getAllMatrixSizes();
  const publicSizes = allSizes.filter(s => s.visibility === 'public');
  const hiddenSizes = allSizes.filter(s => s.visibility === 'hidden_anchor');
  
  if (allSizes.length !== 60) {
    errors.push(`Expected 60 total sizes, got ${allSizes.length}`);
  }
  
  if (publicSizes.length !== 12) {
    errors.push(`Expected 12 public sizes, got ${publicSizes.length}`);
  }
  
  if (hiddenSizes.length !== 48) {
    errors.push(`Expected 48 hidden anchor sizes, got ${hiddenSizes.length}`);
  }
  
  // Log in dev mode
  if (import.meta.env.DEV) {
    if (errors.length > 0) {
      console.error('[MatrixCatalog] Validation errors:', errors);
    } else {
      console.log('[MatrixCatalog] ✓ Validation passed');
      console.log(`  Total sizes: ${allSizes.length}`);
      console.log(`  Public: ${publicSizes.length}`);
      console.log(`  Hidden anchors: ${hiddenSizes.length}`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

// Run validation in dev mode on module load
if (import.meta.env.DEV) {
  validateMatrixCatalog();
}
