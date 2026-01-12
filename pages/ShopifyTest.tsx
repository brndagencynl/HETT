import { formatEUR, toCents } from '../src/utils/money';
import React, { useEffect, useMemo, useState } from "react";
import { beginCheckout, isShopifyConfigured, shopifyFetch } from "../src/lib/shopify";
import { GET_PRODUCTS, PRODUCT_FRAGMENT } from "../src/lib/shopify/queries";
import type { CartItem, MaatwerkCartPayload } from "../types";

// =============================================================================
// TYPES FOR RAW SHOPIFY PRODUCTS
// =============================================================================

interface ShopifyRawVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
}

interface ShopifyRawProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  featuredImage: { url: string; altText: string | null } | null;
  variants: { nodes: ShopifyRawVariant[] };
}

interface ProductsQueryResponse {
  products: {
    edges: Array<{ node: ShopifyRawProduct }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

// =============================================================================
// PRODUCT TYPE CATEGORIES
// =============================================================================

type ProductTypeCategory = 'veranda' | 'veranda-maatwerk' | 'accessoire' | 'sandwichpaneel' | 'onbekend';

function categorizeProductType(productType: string): ProductTypeCategory {
  const pt = productType.toLowerCase().trim();
  if (pt === 'veranda-maatwerk' || pt === 'veranda maatwerk') return 'veranda-maatwerk';
  if (pt === 'veranda' || pt === 'verandas') return 'veranda';
  if (pt === 'accessoire' || pt === 'accessoires') return 'accessoire';
  if (pt === 'sandwichpaneel' || pt === 'sandwichpanelen') return 'sandwichpaneel';
  return 'onbekend';
}

// =============================================================================
// RESULT TYPES
// =============================================================================

type Result =
  | { ok: true; shopName?: string; products?: ShopifyRawProduct[] }
  | { ok: false; error: string; details?: any };

export default function ShopifyTest() {
  const [result, setResult] = useState<Result | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [allProducts, setAllProducts] = useState<ShopifyRawProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  const fakeMaatwerkItem: CartItem = useMemo(() => {
    const payload: MaatwerkCartPayload = {
      type: "maatwerk_veranda",
      title: "Maatwerk veranda (TEST)",
      quantity: 1,
      basePrice: 0,
      optionsTotal: 750,
      totalPrice: 750,
      size: { width: 600, depth: 300 },
      selections: [
        {
          groupId: "maatwerk_toeslag",
          groupLabel: "Maatwerk toeslag",
          choiceId: "ja",
          choiceLabel: "Ja",
          price: 750,
        },
      ],
      renderPreview: undefined,
      priceBreakdown: {
        basePrice: 0,
        selections: [
          {
            groupId: "maatwerk_toeslag",
            groupLabel: "Maatwerk toeslag",
            choiceId: "ja",
            choiceLabel: "Ja",
            price: 750,
          },
        ],
        optionsTotal: 750,
        grandTotal: 750,
      },
    };

    return {
      type: "custom_veranda",
      id: "maatwerk-test",
      slug: "maatwerk-veranda",
      title: payload.title,
      category: "verandas",
      price: payload.totalPrice,
      priceCents: toCents(payload.totalPrice),
      shortDescription: "Test maatwerk item",
      description: "Test maatwerk item",
      imageUrl: "/renders/veranda/ral7016/base.webp",
      specs: {},
      requiresConfiguration: false,
      quantity: 1,
      totalPrice: payload.totalPrice,
      config: {
        category: "maatwerk_veranda",
        data: {
          type: "maatwerk_veranda",
          size: payload.size,
          widthCm: payload.size.width,
          depthCm: payload.size.depth,
          color: "ral7016",
          daktype: "",
          goot: "",
          zijwand_links: "geen",
          zijwand_rechts: "geen",
          voorzijde: "geen",
          verlichting: false,
        },
      },
      displayConfigSummary: "600×300cm • maatwerk test",
      maatwerkPayload: payload,
      details: [{ label: "Afmeting", value: "600×300cm" }],
    };
  }, []);

  // =============================================================================
  // FETCH ALL PRODUCTS VIA STOREFRONT API
  // =============================================================================

  useEffect(() => {
    const fetchAllProducts = async () => {
      if (!isShopifyConfigured()) {
        setProductError("Shopify niet geconfigureerd (env vars ontbreken)");
        setLoadingProducts(false);
        return;
      }

      try {
        const products: ShopifyRawProduct[] = [];
        let hasNextPage = true;
        let cursor: string | null = null;

        // Paginated fetch to get ALL products
        while (hasNextPage) {
          const data = await shopifyFetch<ProductsQueryResponse>(GET_PRODUCTS, {
            first: 50,
            after: cursor,
            query: null,
          });

          products.push(...data.products.edges.map(e => e.node));
          hasNextPage = data.products.pageInfo.hasNextPage;
          cursor = data.products.pageInfo.endCursor;
        }

        setAllProducts(products);
        setLoadingProducts(false);
      } catch (err: any) {
        setProductError(err?.message || "Fout bij ophalen producten");
        setLoadingProducts(false);
      }
    };

    fetchAllProducts();
  }, []);

  // =============================================================================
  // GROUP PRODUCTS BY PRODUCT TYPE
  // =============================================================================

  const productsByType = useMemo(() => {
    const grouped: Record<ProductTypeCategory, ShopifyRawProduct[]> = {
      'veranda': [],
      'veranda-maatwerk': [],
      'accessoire': [],
      'sandwichpaneel': [],
      'onbekend': [],
    };

    allProducts.forEach(product => {
      const category = categorizeProductType(product.productType);
      grouped[category].push(product);
    });

    return grouped;
  }, [allProducts]);

  const handleTestMaatwerkCheckout = async () => {
    setCheckoutError(null);

    if (!isShopifyConfigured()) {
      setCheckoutError("Shopify env vars ontbreken (VITE_SHOPIFY_DOMAIN / VITE_SHOPIFY_STOREFRONT_TOKEN / VITE_SHOPIFY_API_VERSION).");
      return;
    }

    setIsCheckingOut(true);
    try {
      const checkout = await beginCheckout({ cartItems: [fakeMaatwerkItem] });
      if (!checkout.success || !checkout.checkoutUrl) {
        setCheckoutError(checkout.error || "Checkout URL ontbreekt");
        setIsCheckingOut(false);
        return;
      }
      window.location.href = checkout.checkoutUrl;
    } catch (e: any) {
      setCheckoutError(e?.message ?? "Onbekende error");
      setIsCheckingOut(false);
    }
  };

  // Basic connection test (shop name + first 5 products)
  useEffect(() => {
    const run = async () => {
      try {
        const domain = import.meta.env.VITE_SHOPIFY_DOMAIN;
        const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;
        const version = import.meta.env.VITE_SHOPIFY_API_VERSION;

        if (!domain || !token || !version) {
          setResult({ ok: false, error: "Env vars ontbreken (VITE_SHOPIFY_...)." });
          return;
        }

        const endpoint = `https://${domain}/api/${version}/graphql.json`;

        const query = `
          query TestStorefront {
            shop { name }
          }
        `;

        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": token,
          },
          body: JSON.stringify({ query }),
        });

        const json = await res.json();

        if (!res.ok) {
          setResult({ ok: false, error: `HTTP ${res.status}`, details: json });
          return;
        }

        if (json.errors?.length) {
          setResult({ ok: false, error: "GraphQL errors", details: json.errors });
          return;
        }

        setResult({ ok: true, shopName: json.data.shop.name });
      } catch (e: any) {
        setResult({ ok: false, error: e?.message ?? "Onbekende error", details: e });
      }
    };

    run();
  }, []);

  // =============================================================================
  // RENDER PRODUCT SECTION
  // =============================================================================

  const renderProductSection = (title: string, products: ShopifyRawProduct[]) => {
    if (products.length === 0) return null;
    
    return (
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ margin: "0 0 12px", borderBottom: "2px solid #e5e7eb", paddingBottom: 8 }}>
          {title} ({products.length})
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>Titel</th>
              <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>productType</th>
              <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>Eerste variant prijs</th>
              <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>Handle</th>
              <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>Variant GID</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
              const firstVariant = product.variants.nodes[0];
                  const price = firstVariant 
                    ? `${formatEUR(toCents(firstVariant.price.amount), 'cents')} ${firstVariant.price.currencyCode}`
                    : "—";
              const variantId = firstVariant?.id || "—";

              return (
                <tr key={product.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 500 }}>{product.title}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>
                      {product.productType || "(leeg)"}
                    </code>
                  </td>
                  <td style={{ padding: "8px 12px" }}>{price}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <code style={{ fontSize: 12 }}>{product.handle}</code>
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <code style={{ fontSize: 10, wordBreak: "break-all" }}>{variantId}</code>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <h1>Shopify Storefront Test</h1>

      {/* Connection Status */}
      <div style={{ margin: "16px 0", padding: 12, border: "1px solid #e5e7eb", borderRadius: 8, background: "#f9fafb" }}>
        <h2 style={{ margin: "0 0 8px" }}>Verbinding status</h2>
        {!result && <p>Testen…</p>}
        {result?.ok === false && (
          <>
            <p style={{ color: "crimson", margin: 0 }}><b>Fout:</b> {result.error}</p>
            {result.details && (
              <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{JSON.stringify(result.details, null, 2)}</pre>
            )}
          </>
        )}
        {result?.ok === true && (
          <p style={{ color: "green", margin: 0 }}><b>✓ Verbonden</b> — Shop: {result.shopName}</p>
        )}
      </div>

      {/* Checkout Test */}
      <div style={{ margin: "16px 0", padding: 12, border: "1px solid #e5e7eb", borderRadius: 8 }}>
        <h2 style={{ margin: "0 0 8px" }}>Checkout test</h2>
        <p style={{ margin: "0 0 12px", color: "#6b7280" }}>
          Test maatwerk checkout met vaste variant GID (MAATWERK_VERANDA_YES_GID).
        </p>
        <button
          onClick={handleTestMaatwerkCheckout}
          disabled={isCheckingOut}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #111827",
            background: isCheckingOut ? "#9ca3af" : "#111827",
            color: "white",
            cursor: isCheckingOut ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          {isCheckingOut ? "Doorsturen…" : "Test maatwerk item toevoegen"}
        </button>
        {checkoutError && (
          <p style={{ marginTop: 10, color: "crimson" }}>
            <b>Checkout fout:</b> {checkoutError}
          </p>
        )}
      </div>

      {/* All Products from Shopify */}
      <div style={{ margin: "24px 0", padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
        <h2 style={{ margin: "0 0 16px" }}>Alle Shopify producten ({allProducts.length})</h2>
        
        {loadingProducts && <p>Producten laden via Storefront API…</p>}
        
        {productError && (
          <p style={{ color: "crimson" }}><b>Fout:</b> {productError}</p>
        )}

        {!loadingProducts && !productError && (
          <>
            {/* Summary */}
            <div style={{ marginBottom: 24, padding: 12, background: "#f0fdf4", borderRadius: 8, border: "1px solid #86efac" }}>
              <h3 style={{ margin: "0 0 8px" }}>Overzicht per productType</h3>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li><b>veranda:</b> {productsByType.veranda.length} producten</li>
                <li><b>veranda-maatwerk:</b> {productsByType['veranda-maatwerk'].length} producten</li>
                <li><b>accessoire:</b> {productsByType.accessoire.length} producten</li>
                <li><b>sandwichpaneel:</b> {productsByType.sandwichpaneel.length} producten</li>
                <li><b>onbekend:</b> {productsByType.onbekend.length} producten</li>
              </ul>
            </div>

            {/* Products grouped by type */}
            {renderProductSection("Veranda's (standaard)", productsByType.veranda)}
            {renderProductSection("Veranda Maatwerk", productsByType['veranda-maatwerk'])}
            {renderProductSection("Accessoires", productsByType.accessoire)}
            {renderProductSection("Sandwichpanelen", productsByType.sandwichpaneel)}
            {renderProductSection("Onbekend productType", productsByType.onbekend)}
          </>
        )}
      </div>
    </div>
  );
}