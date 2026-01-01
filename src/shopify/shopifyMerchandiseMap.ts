import type { CartItem } from '../../types';

/**
 * Shopify Merchandise Resolution
 * 
 * Strategy:
 * 1. Use shopifyVariantId from the product (set during Shopify fetch)
 * 2. Fall back to manual mapping ONLY for special cases (maatwerk)
 */

export const MAATWERK_VERANDA_YES_GID = 'gid://shopify/ProductVariant/53043565822279';

export interface MerchandiseResolution {
  /** The key used to lookup the GID (handle or special key) */
  mappingKey: string;
  /** Shopify ProductVariant GID */
  merchandiseId: string;
}

const GID_PREFIX = 'gid://shopify/ProductVariant/';

function assertVariantGid(gid: string, mappingKey: string): void {
  if (!gid || typeof gid !== 'string' || !gid.startsWith(GID_PREFIX)) {
    throw new Error(
      `Shopify variant GID ongeldig voor "${mappingKey}". Verwacht ${GID_PREFIX}... maar kreeg: ${String(gid)}`
    );
  }
}

/**
 * Manual mapping ONLY for special products that don't come from Shopify product queries.
 * Regular products should have shopifyVariantId set from the product fetch.
 */
const MANUAL_VARIANT_MAP: Partial<Record<string, string>> = {
  'maatwerk-veranda': MAATWERK_VERANDA_YES_GID,
};

/**
 * Resolve a cart item to a Shopify ProductVariant GID.
 * 
 * Priority:
 * 1. Maatwerk items -> use manual mapping
 * 2. Products with shopifyVariantId -> use directly
 * 3. Fall back to manual mapping by slug
 * 4. Error if no variant found
 */
export function resolveMerchandiseForCartItem(item: CartItem): MerchandiseResolution {
  const isMaatwerk = item.slug === 'maatwerk-veranda' || item.type === 'custom_veranda' || Boolean(item.maatwerkPayload);
  
  // 1. Maatwerk always uses manual mapping
  if (isMaatwerk) {
    const gid = MANUAL_VARIANT_MAP['maatwerk-veranda'];
    if (!gid) {
      throw new Error('Maatwerk veranda variant GID niet geconfigureerd');
    }
    assertVariantGid(gid, 'maatwerk-veranda');
    return { mappingKey: 'maatwerk-veranda', merchandiseId: gid };
  }
  
  // 2. Use shopifyVariantId from product (set during Shopify fetch)
  if (item.shopifyVariantId) {
    console.log('[resolveMerchandise] Using shopifyVariantId from product:', item.shopifyVariantId);
    assertVariantGid(item.shopifyVariantId, item.id || item.slug || item.title);
    return { 
      mappingKey: item.id || item.slug || 'product', 
      merchandiseId: item.shopifyVariantId 
    };
  }
  
  // 3. Fall back to manual mapping by slug (legacy support)
  const slug = (item.slug || item.id || '').trim();
  if (slug && MANUAL_VARIANT_MAP[slug]) {
    const gid = MANUAL_VARIANT_MAP[slug]!;
    console.log('[resolveMerchandise] Using manual mapping for slug:', slug);
    assertVariantGid(gid, slug);
    return { mappingKey: slug, merchandiseId: gid };
  }
  
  // 4. No variant found - this means product wasn't loaded from Shopify correctly
  console.error('[resolveMerchandise] No variant found for item:', {
    title: item.title,
    id: item.id,
    slug: item.slug,
    shopifyVariantId: item.shopifyVariantId,
  });
  throw new Error(
    `Product "${item.title}" heeft geen Shopify variant ID. ` +
    `Zorg ervoor dat het product correct is geladen vanuit Shopify.`
  );
}

export function debugListMappingKeys(): string[] {
  return Object.keys(MANUAL_VARIANT_MAP);
}
