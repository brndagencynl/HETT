/**
 * Shopify Services
 * 
 * Re-export all Shopify-related utilities
 */

export {
  getFirstAvailableVariant,
  getVariantPrice,
  getVariantCompareAtPrice,
  isVariantOnSale,
  getVariantGid,
  validateVariantForCart,
  type ShopifyVariant,
  type ProductWithVariants,
} from './variants';

export {
  getLatestProjects,
  getProjectsPage,
  getProjectByHandle,
  getProjectPlaceholder,
  clearProjectsCache,
  type ShopifyProject,
  type ProjectImage,
  type ProjectsPageResult,
} from './projects';
