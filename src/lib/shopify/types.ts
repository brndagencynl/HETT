/**
 * Shopify Storefront API Types
 * Minimal types for products, collections, and cart operations
 */

// =============================================================================
// COMMON TYPES
// =============================================================================

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

// =============================================================================
// PRODUCT TYPES
// =============================================================================

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  image?: ShopifyImage | null;
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  featuredImage: ShopifyImage | null;
  images: {
    edges: Array<{
      node: ShopifyImage;
    }>;
  };
  priceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  compareAtPriceRange: {
    minVariantPrice: ShopifyMoney | null;
    maxVariantPrice: ShopifyMoney | null;
  };
  variants: {
    nodes: ShopifyProductVariant[];
  };
  tags: string[];
  productType: string;
  vendor: string;
  availableForSale: boolean;
  // Metafields for custom data
  metafields: Array<{
    key: string;
    value: string;
    namespace: string;
  }> | null;
}

// =============================================================================
// COLLECTION TYPES
// =============================================================================

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
  products: {
    edges: Array<{
      node: ShopifyProduct;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

// =============================================================================
// CART TYPES
// =============================================================================

export interface ShopifyCartLineAttribute {
  key: string;
  value: string;
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  attributes: ShopifyCartLineAttribute[];
  merchandise: {
    __typename: 'ProductVariant';
    id: string;
    title: string;
    product: {
      id: string;
      handle: string;
      title: string;
      featuredImage: ShopifyImage | null;
    };
    price: ShopifyMoney;
    image: ShopifyImage | null;
  };
  cost: {
    totalAmount: ShopifyMoney;
    amountPerQuantity: ShopifyMoney;
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount: ShopifyMoney;
    subtotalAmount: ShopifyMoney;
    totalTaxAmount: ShopifyMoney | null;
  };
  lines: {
    edges: Array<{
      node: ShopifyCartLine;
    }>;
  };
  buyerIdentity: {
    email: string | null;
    countryCode: string | null;
  };
}

// =============================================================================
// INPUT TYPES
// =============================================================================

export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
  attributes?: ShopifyCartLineAttribute[];
}

export interface CartLineUpdateInput {
  id: string;
  quantity: number;
  attributes?: ShopifyCartLineAttribute[];
}

// =============================================================================
// RESPONSE TYPES
// =============================================================================

export interface CartResponse {
  cart: ShopifyCart | null;
}

export interface CartCreateResponse {
  cartCreate: {
    cart: ShopifyCart | null;
    userErrors: Array<{
      field: string[];
      message: string;
    }>;
  };
}

export interface CartLinesAddResponse {
  cartLinesAdd: {
    cart: ShopifyCart | null;
    userErrors: Array<{
      field: string[];
      message: string;
    }>;
  };
}

export interface CartLinesUpdateResponse {
  cartLinesUpdate: {
    cart: ShopifyCart | null;
    userErrors: Array<{
      field: string[];
      message: string;
    }>;
  };
}

export interface CartLinesRemoveResponse {
  cartLinesRemove: {
    cart: ShopifyCart | null;
    userErrors: Array<{
      field: string[];
      message: string;
    }>;
  };
}

export interface CollectionResponse {
  collection: ShopifyCollection | null;
}

export interface ProductResponse {
  product: ShopifyProduct | null;
}

export interface ProductsResponse {
  products: {
    edges: Array<{
      node: ShopifyProduct;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}
