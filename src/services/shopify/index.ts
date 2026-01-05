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
  getLatestProjectCards,
  getProjectsPage,
  getProjectByHandle,
  getProjectPlaceholder,
  clearProjectsCache,
  projectToCard,
  type ShopifyProject,
  type ProjectImage,
  type ProjectsPageResult,
  type ProjectCard,
} from './projects';

export {
  getShopifyAccountUrl,
  getShopifyLoginUrl,
  getShopifyRegisterUrl,
  getShopifyOrdersUrl,
} from './account';

export {
  toNumber,
  getFirstAvailableVariant as getFirstAvailablePriceVariant,
  getVariantPrice as getPriceFromVariant,
  getProductBasePrice,
  hasValidShopifyPrice,
  type ShopifyVariant as ShopifyPriceVariant,
} from './pricing';
