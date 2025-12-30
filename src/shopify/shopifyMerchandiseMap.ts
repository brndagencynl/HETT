import type { CartItem } from '../../types';

// Single source of truth for Shopify ProductVariant GIDs
// IMPORTANT: Only use gid://shopify/ProductVariant/... values as merchandiseId.

export const MAATWERK_VERANDA_YES_GID = 'gid://shopify/ProductVariant/53043565822279';

export interface MerchandiseResolution {
  /** The key used to lookup the GID (usually cart item slug) */
  mappingKey: string;
  /** Shopify ProductVariant GID */
  merchandiseId: string;
}

const GID_PREFIX = 'gid://shopify/ProductVariant/';

function assertVariantGid(gid: string, mappingKey: string): void {
  if (!gid || typeof gid !== 'string' || !gid.startsWith(GID_PREFIX)) {
    throw new Error(
      `Shopify mapping ongeldig voor key "${mappingKey}". Verwacht ${GID_PREFIX}... maar kreeg: ${String(gid)}`
    );
  }
}

/**
 * Fill these with real Shopify ProductVariant GIDs.
 *
 * Key strategy (recommended):
 * - Use your internal stable `CartItem.slug` as the key.
 * - For maatwerk we always use `maatwerk-veranda`.
 *
 * Examples to add later:
 * - 'led-verlichting'
 * - 'sandwichpaneel'
 * - '506x300' (if your veranda product.id/slug equals the size key)
 */
export const VARIANT_GID_BY_SLUG: Partial<Record<string, string>> = {
  'maatwerk-veranda': MAATWERK_VERANDA_YES_GID,

  // TODO: fill with real Shopify variant GIDs
  // 'led-verlichting': 'gid://shopify/ProductVariant/XXXXXXXXXXXX',
  // 'sandwichpaneel': 'gid://shopify/ProductVariant/XXXXXXXXXXXX',
  // '506x300': 'gid://shopify/ProductVariant/XXXXXXXXXXXX',
};

/**
 * Resolve a cart item to a Shopify ProductVariant GID.
 * Throws a clear error if mapping is missing (blocks checkout).
 */
export function resolveMerchandiseForCartItem(item: CartItem): MerchandiseResolution {
  const isMaatwerk = item.slug === 'maatwerk-veranda' || item.type === 'custom_veranda' || Boolean(item.maatwerkPayload);
  const mappingKey = isMaatwerk ? 'maatwerk-veranda' : (item.slug || '').trim();

  if (!mappingKey) {
    throw new Error(`Shopify mapping ontbreekt voor product "${item.title}" (geen slug)`);
  }

  const gid = VARIANT_GID_BY_SLUG[mappingKey];
  if (!gid) {
    throw new Error(`Shopify mapping ontbreekt voor product "${item.title}" (key: ${mappingKey})`);
  }

  assertVariantGid(gid, mappingKey);
  return { mappingKey, merchandiseId: gid };
}

export function debugListMappingKeys(): string[] {
  return Object.keys(VARIANT_GID_BY_SLUG);
}
