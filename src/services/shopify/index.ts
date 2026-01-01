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
