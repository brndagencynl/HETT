import { GET_PRODUCT_BY_HANDLE } from '../../lib/shopify/queries';
import { shopifyFetch } from '../../lib/shopify/client';
import type { ShopifyProduct, ShopifyProductVariant } from '../../lib/shopify/types';
import { MATRIX_DEPTHS, MATRIX_WIDTHS, type MatrixDepth, type MatrixWidth } from '../../catalog/matrixCatalog';

export const MAATWERK_WIDTH_BUCKETS = [...MATRIX_WIDTHS] as const;
export const MAATWERK_DEPTH_BUCKETS = [...MATRIX_DEPTHS] as const;

export type MaatwerkWidthBucket = MatrixWidth;
export type MaatwerkDepthBucket = MatrixDepth;

export type MaatwerkKey = `${MaatwerkWidthBucket}x${MaatwerkDepthBucket}`;

// Matches existing custom configurator pricing fee
export const MAATWERK_CUSTOM_FEE = 750;

// Keep this as a simple constant object as requested.
// Prices here are only used for optional display/fallback logic.
// Shopify checkout pricing is driven by the resolved variant.
const FALLBACK_PRICING = {
  minimumPrice: 1100,
  baseFlat: 400,
  widthRate: 1.5,
  depthRate: 2.0,
  areaRate: 0.0003,
} as const;

function getFallbackBasePrice(widthCm: number, depthCm: number): number {
  const area = widthCm * depthCm;
  const calculated =
    FALLBACK_PRICING.baseFlat +
    widthCm * FALLBACK_PRICING.widthRate +
    depthCm * FALLBACK_PRICING.depthRate +
    area * FALLBACK_PRICING.areaRate;

  return Math.max(FALLBACK_PRICING.minimumPrice, Math.round(calculated));
}

export const maatwerkPriceMatrix: Record<MaatwerkKey, number> = Object.fromEntries(
  MAATWERK_WIDTH_BUCKETS.flatMap((w) =>
    MAATWERK_DEPTH_BUCKETS.map((d) => {
      const key = `${w}x${d}` as MaatwerkKey;
      return [key, getFallbackBasePrice(w, d)];
    })
  )
) as Record<MaatwerkKey, number>;

export function mapToBucket(value: number, buckets: readonly number[]): number {
  if (!Number.isFinite(value)) {
    return buckets[0] ?? value;
  }
  if (buckets.length === 0) {
    return value;
  }

  const min = buckets[0];
  const max = buckets[buckets.length - 1];

  if (value <= min) return min;
  if (value >= max) return max;

  for (const b of buckets) {
    if (b >= value) return b;
  }

  return max;
}

export function getMaatwerkKey(widthCm: number, depthCm: number): MaatwerkKey {
  const bucketW = mapToBucket(widthCm, MAATWERK_WIDTH_BUCKETS) as MaatwerkWidthBucket;
  const bucketD = mapToBucket(depthCm, MAATWERK_DEPTH_BUCKETS) as MaatwerkDepthBucket;
  return `${bucketW}x${bucketD}`;
}

export function getMaatwerkTotalPrice(key: MaatwerkKey): number {
  const matrixPrice = maatwerkPriceMatrix[key] ?? 0;
  // Fee is not included in base matrix price
  return matrixPrice + MAATWERK_CUSTOM_FEE;
}

type ProductByHandleResponse = { product: ShopifyProduct | null };

let maatwerkVariantsPromise: Promise<ShopifyProductVariant[]> | null = null;

async function getCachedMaatwerkVariants(): Promise<ShopifyProductVariant[]> {
  if (maatwerkVariantsPromise) return maatwerkVariantsPromise;

  maatwerkVariantsPromise = (async () => {
    const data = await shopifyFetch<ProductByHandleResponse>(GET_PRODUCT_BY_HANDLE, {
      handle: 'maatwerk-veranda',
    });

    const variants = data.product?.variants?.nodes ?? [];

    console.log('[maatwerk] Loaded variants for maatwerk-veranda', {
      variantCount: variants.length,
    });

    return variants;
  })();

  return maatwerkVariantsPromise;
}

function normalizeOptionName(name: string): string {
  return name.trim().toLowerCase();
}

function findOptionValue(variant: ShopifyProductVariant, kind: 'width' | 'depth'): string | null {
  const candidates = variant.selectedOptions || [];

  const matchByName = candidates.find((o) => {
    const n = normalizeOptionName(o.name);
    if (kind === 'width') return n.includes('breed') || n.includes('width');
    return n.includes('diep') || n.includes('depth');
  });

  return matchByName?.value ?? null;
}

export async function resolveMaatwerkVariantId(
  bucketW: number,
  bucketD: number
): Promise<string | null> {
  const variants = await getCachedMaatwerkVariants();

  const wStr = String(bucketW);
  const dStr = String(bucketD);

  // 1) Prefer name-based matching (Breedte/Diepte or Width/Depth)
  const byName = variants.find((v) => {
    const vw = findOptionValue(v, 'width');
    const vd = findOptionValue(v, 'depth');
    return vw === wStr && vd === dStr;
  });

  if (byName) {
    console.log('[maatwerk] Resolved variant by option names', {
      bucketW,
      bucketD,
      variantId: byName.id,
    });
    return byName.id;
  }

  // 2) Fallback: match by values present anywhere in selectedOptions
  const byValue = variants.find((v) => {
    const values = (v.selectedOptions || []).map((o) => o.value);
    return values.includes(wStr) && values.includes(dStr);
  });

  if (byValue) {
    console.log('[maatwerk] Resolved variant by option values', {
      bucketW,
      bucketD,
      variantId: byValue.id,
    });
    return byValue.id;
  }

  console.error('[maatwerk] Variant not found for buckets', { bucketW, bucketD });
  return null;
}
