import React, { useEffect, useState } from "react";

type Result =
  | { ok: true; shopName?: string; products?: any[] }
  | { ok: false; error: string; details?: any };

export default function ShopifyTest() {
  const [result, setResult] = useState<Result | null>(null);

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