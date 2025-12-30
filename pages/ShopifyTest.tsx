import React, { useEffect, useMemo, useState } from "react";
import { beginCheckout, isShopifyConfigured } from "../src/lib/shopify";
import type { CartItem, MaatwerkCartPayload } from "../types";

type Result =
  | { ok: true; shopName?: string; products?: any[] }
  | { ok: false; error: string; details?: any };

export default function ShopifyTest() {
  const [result, setResult] = useState<Result | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

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
      shortDescription: "Test maatwerk item",
      description: "Test maatwerk item",
      imageUrl: "/renders/veranda/ral7016/base.png",
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
            products(first: 5) {
              edges {
                node {
                  id
                  title
                  handle
                }
              }
            }
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

        const products = json.data.products.edges.map((e: any) => e.node);
        setResult({ ok: true, shopName: json.data.shop.name, products });
      } catch (e: any) {
        setResult({ ok: false, error: e?.message ?? "Onbekende error", details: e });
      }
    };

    run();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Shopify Storefront Test</h1>

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

      {!result && <p>Testen…</p>}

      {result?.ok === false && (
        <>
          <p style={{ color: "crimson" }}><b>Fout:</b> {result.error}</p>
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(result.details, null, 2)}</pre>
        </>
      )}

      {result?.ok === true && (
        <>
          <p style={{ color: "green" }}><b>OK.</b> Shop: {result.shopName}</p>
          <h3>Products (first 5)</h3>
          <ul>
            {result.products?.map((p) => (
              <li key={p.id}>
                <b>{p.title}</b> — <code>{p.handle}</code>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}