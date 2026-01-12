
export type CategorySlug = 'verandas' | 'accessoires';

/**
 * Product visibility type
 * - 'public': Shown in listings, search, sitemaps (default)
 * - 'hidden_anchor': Never shown to customers, only for pricing lookup in custom configurator
 */
export type ProductVisibility = 'public' | 'hidden_anchor';

export interface Product {
  id: string;
  /**
   * Shopify product handle (URL slug)
   * e.g., "veranda-706-x-400"
   */
  handle?: string;
  title: string;
  category: CategorySlug;
  /** Canonical money value (always cents, integer). */
  priceCents: number;
  price: number;
  /** Canonical ex-VAT money value (always cents, integer). */
  priceExVatCents?: number;
  priceExVat?: number;
  shortDescription: string;
  description: string;
  imageUrl: string;
  specs: {
    [key: string]: string | string[];
  };
  isNew?: boolean;
  isBestseller?: boolean;
  badges?: string[];
  rating?: number;
  reviewCount?: number;
  stockStatus?: string;
  // variantCount removed as per request
  options?: {
    colors: string[];
    sizes: string[];
    roofTypes?: string[];
  };
  requiresConfiguration: boolean; // Now mandatory/explicit
  /**
   * Product visibility - controls whether product appears in listings
   * Default: 'public' (shown to customers)
   */
  visibility?: ProductVisibility;
  /**
   * Size key for veranda products (e.g., "506x300")
   * Used for price lookup in custom configurator
   */
  sizeKey?: string;
  /**
   * Shopify variant ID (GID) for add-to-cart operations
   * e.g., "gid://shopify/ProductVariant/123456789"
   */
  shopifyVariantId?: string;
  /**
   * Whether the variant is available for sale
   */
  availableForSale?: boolean;
  /**
   * Extra description from Shopify metafield (custom.extra_description)
   * May contain HTML if rich text field
   */
  extraDescription?: string;
  /**
   * Raw specifications text from Shopify metafield (custom.specifications)
   * Format: one spec per line, "Label: Value"
   */
  specificationsRaw?: string;

  /**
   * Unique Selling Points from Shopify metafield (custom.usps)
   * Definition: list.single_line_text_field
   */
  usps?: string[];
}

// Product Configuration Types
export type ProductCategory = 'verandas' | 'sandwichpanelen' | 'accessoires';

export type VerandaConfig = {
  color?: 'ral7016' | 'ral9005' | 'ral9001';
  daktype?: 'poly_helder' | 'poly_opaal' | 'glas';
  goot?: 'deluxe' | 'cube' | 'classic'; // Required
  zijwand_links?: 'geen' | 'poly_spie' | 'sandwich_poly_spie' | 'sandwich_volledig' | 'sandwich_polyspie' | 'sandwich_vol';
  zijwand_rechts?: 'geen' | 'poly_spie' | 'sandwich_poly_spie' | 'sandwich_volledig' | 'sandwich_polyspie' | 'sandwich_vol';
  voorzijde?: 'geen' | 'glazen_schuifwand' | 'glas_schuifwand' | 'glas_schuifwand_helder' | 'glas_schuifwand_getint';
  verlichting?: boolean;
  extra_verlichting?: boolean;
  // Common visual options
  /** @deprecated Use color instead */
  kleur?: 'ral7016' | 'ral9005' | 'ral9001';
  /** @deprecated Use color instead */
  profileColor?: string;
  widthCm?: number;
  depthCm?: number;
};

export type SandwichConfig = {
  /** New sandwichpanelen configurator fields */
  workingWidthMm?: number;
  lengthMm?: 2500 | 3000 | 3500 | 4000 | 4500 | 5000;
  color?: 'ral7016' | 'ral9001' | 'ral9005';
  extras?: {
    uProfiles?: {
      enabled: boolean;
      meters: number;
    };
  };

  /** Legacy fields (kept for backward compatibility) */
  dikte?: string;
  kleur?: string;
  afwerking?: string;
  extra_u_profielen_m?: number;
  length?: number;
};

export type ProductConfig =
  | { category: 'verandas'; data: VerandaConfig }
  | { category: 'sandwichpanelen'; data: SandwichConfig }
  | { category: 'accessoires'; data?: Record<string, never> }
  | { category: 'maatwerk_veranda'; data: MaatwerkVerandaConfig };

// Maatwerk Veranda Config (for cart items)
export interface MaatwerkVerandaConfig {
  type: 'maatwerk_veranda';
  size: { width: number; depth: number };
  /** Convenience duplicates for consumers expecting width/depth fields */
  widthCm?: number;
  depthCm?: number;
  /** Resolved bucketed width used for Shopify variant mapping */
  bucketWidthCm?: number;
  /** Resolved bucketed depth used for Shopify variant mapping */
  bucketDepthCm?: number;
  color: string;
  daktype: string;
  goot: string;
  zijwand_links: string;
  zijwand_rechts: string;
  voorzijde: string;
  verlichting: boolean;
}

// Maatwerk cart item payload (used for adding to cart)
export interface MaatwerkCartPayload {
  type: 'maatwerk_veranda';
  title: string;
  quantity: number;
  /** Base price = shopifyVariantPrice + maatwerkSurcharge */
  basePrice: number;
  /** Base price from Shopify variant (before surcharge) */
  shopifyVariantPrice?: number;
  /** Maatwerk surcharge (e.g. €750) */
  maatwerkSurcharge?: number;
  optionsTotal: number;
  totalPrice: number;
  size: { width: number; depth: number };
  /** Resolved bucketed width used for Shopify variant mapping */
  bucketWidthCm?: number;
  /** Resolved bucketed depth used for Shopify variant mapping */
  bucketDepthCm?: number;
  /** Anchor size key used for pricing reference (may differ from size) */
  anchorSizeKey?: string;
  /** Resolved Shopify variant ID (GID) for bucketed size */
  shopifyVariantId?: string;
  selections: Array<{
    groupId: string;
    groupLabel: string;
    choiceId: string;
    choiceLabel: string;
    price: number;
  }>;
  renderPreview?: string;
  priceBreakdown: {
    basePrice: number;
    shopifyVariantPrice?: number;
    maatwerkSurcharge?: number;
    selections: Array<{
      groupId: string;
      groupLabel: string;
      choiceId: string;
      choiceLabel: string;
      price: number;
    }>;
    optionsTotal: number;
    grandTotal: number;
    anchor?: {
      anchorSizeKey: string;
      anchorPrice: number;
      customFee: number;
    };
  };
}

export interface CartItem extends Product {
  id: string; // Unique line ID
  sku?: string;
  slug: string; // Ensure slug is available (usually derived from ID)

  // Standard props
  quantity: number;
  /** Canonical unit price (always cents, integer). */
  unitPriceCents?: number;
  /** Canonical line total (always cents, integer). */
  lineTotalCents?: number;
  totalPrice: number;

  /** Line item type (used for edit detection and payload contracts) */
  type?: 'custom_veranda' | 'sandwichpanelen' | 'product' | 'shipping';

  /** Optional structured pricing block (used for sandwichpanelen and other configurable items) */
  pricing?: {
    basePrice: number;
    extrasTotal: number;
    total: number;
    breakdown: Array<{ label: string; amount: number }>;
  };

  // Config props
  config?: ProductConfig;
  configHash?: string;
  displayConfigSummary?: string;

  /** Optional pricing breakdown for config details popup */
  priceBreakdown?: unknown;

  /** Render snapshot for visual preview (configurable products) */
  render?: {
    baseImageUrl: string;
    overlayUrls: string[];
    capturedAt?: string;
  };

  // Maatwerk veranda specific props
  maatwerkPayload?: MaatwerkCartPayload;

  // Legacy/Compatibility props (to be deprecated or mapped)
  selectedSize?: string;
  selectedColor?: string;
  selectedRoof?: string;
  details?: { label: string; value: string }[];
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  readingTime: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description: string;
  location?: string;
  usedProductIds?: string[];
  images?: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  category: string;
  imageUrl: string;
  readTime: string;
}

export interface NavItem {
  label: string;
  path: string;
}

export interface PanelConfig {
  type: 'dak' | 'wand';
  thickness: number;
  color: string;
  finish: string;
  length: number;
}