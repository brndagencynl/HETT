/**
 * Veranda Dimension Utilities
 * Parse width and depth from product handles/titles
 */

/**
 * Parse veranda dimensions from handle or title string
 * Supports formats like:
 * - handle: aluminium-veranda-706-x-400-cm
 * - title: Aluminium Veranda 706 x 400 cm
 * 
 * @param handleOrTitle - The product handle or title to parse
 * @returns Object with optional width and depth values
 */
export function parseVerandaDimensions(handleOrTitle: string): { width?: number; depth?: number } {
  if (!handleOrTitle) return {};

  // Handle format: aluminium-veranda-706-x-400-cm
  let match = handleOrTitle.match(/(\d{3,4})-x-(\d{3,4})/i);
  if (match) {
    return { width: Number(match[1]), depth: Number(match[2]) };
  }

  // Title format: Aluminium Veranda 706 x 400 cm or 706 × 400
  match = handleOrTitle.match(/(\d{3,4})\s*[x×]\s*(\d{3,4})/i);
  if (match) {
    return { width: Number(match[1]), depth: Number(match[2]) };
  }

  return {};
}

/**
 * Safely convert any value to a number
 * Returns 0 for invalid/non-finite values
 */
export function toNumberSafe(value: unknown): number {
  const num = typeof value === 'string' ? Number(value) : Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

/**
 * Available width options for veranda filters (in cm)
 */
export const VERANDA_WIDTH_OPTIONS = [506, 606, 706] as const;

/**
 * Available depth options for veranda filters (in cm)
 */
export const VERANDA_DEPTH_OPTIONS = [250, 300, 350, 400] as const;

export type VerandaWidth = typeof VERANDA_WIDTH_OPTIONS[number];
export type VerandaDepth = typeof VERANDA_DEPTH_OPTIONS[number];
