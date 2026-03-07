/**
 * Glazen Schuifwanden — Overview Page (Shopify-integrated)
 * =========================================================
 *
 * Landing page at /glazen-schuifwanden showing all rail variants as
 * product cards.
 *
 * Product images & titles come from Shopify (tag: "glazen-schuifwand").
 * USPs, lead times and "from" prices come from the hardcoded config.
 *
 * Falls back to the hardcoded rail config data (without images) when
 * Shopify products haven't loaded yet or aren't available.
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ProductCard from '../src/components/products/ProductCard';
import { RAIL_CONFIGS, getFromPriceCents } from '../src/config/glazenSchuifwanden';
import {
  getGlazenSchuifwandenProducts,
  type GlazenSchuifwandProduct,
} from '../src/lib/shopify/glazenSchuifwanden';
import type { Product } from '../types';

const GlazenSchuifwandenOverview: React.FC = () => {
  const { t } = useTranslation();

  const [products, setProducts] = useState<GlazenSchuifwandProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fetched = await getGlazenSchuifwandenProducts();
        if (!cancelled) setProducts(fetched);
      } catch (err) {
        console.error('[GlazenSchuifwandenOverview] Fetch error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Build display list: merge Shopify data where available, fall back to hardcoded config
  const displayItems = RAIL_CONFIGS.map((cfg) => {
    const matched = products.find((p) => p.railConfig.rail === cfg.rail);
    const fromPriceCents = getFromPriceCents(cfg.rail) || cfg.fallbackPriceCents;

    const product: Product = {
      id: cfg.slug,
      title: matched?.shopifyProduct.title || `${cfg.rail}-rail glazen schuifwand`,
      category: 'verandas',
      priceCents: fromPriceCents,
      price: fromPriceCents / 100,
      shortDescription: matched?.shopifyProduct.shortDescription || '',
      description: '',
      imageUrl: matched?.shopifyProduct.imageUrl || '/assets/images/glass_sliding_walls.webp',
      specs: {},
      requiresConfiguration: true,
    };

    return { product, cfg };
  });

  return (
    <div className="min-h-screen bg-hett-bg pb-20">
      <PageHeader
        title={t('glazenSchuifwanden.pageTitle')}
        subtitle={t('glazenSchuifwanden.pageSubtitle')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-hett-dark mb-4">
            {t('glazenSchuifwanden.title')}
          </h1>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-3xl">
            {t('glazenSchuifwanden.intro')}
          </p>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center gap-2 text-gray-500 mb-6">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">{t('common.loading', 'Laden...')}</span>
          </div>
        )}

        {/* Product Grid — same breakpoints as Category.tsx product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map(({ product, cfg }) => (
            <ProductCard
              key={cfg.slug}
              product={product}
              href={`/glazen-schuifwanden/${cfg.slug}`}
              deliveryLabel={cfg.leadTime}
              ctaLabel={t('glazenSchuifwanden.configure')}
              showFromSuffix
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlazenSchuifwandenOverview;
