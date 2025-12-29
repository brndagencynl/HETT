/**
 * Catalog Module Exports
 * ======================
 * 
 * Centralized exports for the catalog system including:
 * - Matrix catalog (widths, depths, visibility rules, anchor mapping)
 * - Product visibility helpers
 */

// Matrix catalog - sizes, visibility, anchor mapping
export {
  // Dimensions
  MATRIX_WIDTHS,
  MATRIX_DEPTHS,
  type MatrixWidth,
  type MatrixDepth,
  
  // Visibility
  STANDARD_VISIBLE_WIDTHS,
  STANDARD_VISIBLE_DEPTHS,
  type ProductVisibility,
  isStandardVisible,
  getProductVisibility,
  
  // Anchor mapping
  mapToAnchorWidth,
  mapToAnchorDepth,
  mapToAnchorSize,
  getAnchorSizeObject,
  
  // Size key utilities
  toSizeKey,
  parseSizeKey,
  isValidMatrixSize,
  
  // Matrix generation
  getAllMatrixSizes,
  getPublicMatrixSizes,
  getHiddenAnchorSizes,
  
  // Custom fee
  MAATWERK_CUSTOM_FEE,
  
  // Validation
  validateMatrixCatalog,
} from './matrixCatalog';

// Product visibility helpers
export {
  isProductVisible,
  filterVisibleProducts,
  getProductById,
  getVerandaBySizeKey,
  getAnchorProductPrice,
} from './productVisibility';
