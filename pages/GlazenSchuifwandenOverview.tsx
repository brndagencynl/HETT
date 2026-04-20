/**
 * Glazen Schuifwanden — Overview Page (Shopify-driven)
 * =====================================================
 *
 * Landing page at /glazen-schuifwanden showing all rail variants as
 * product cards.
 *
 * Products are fetched directly from Shopify (tag: "glazen-schuifwand").
 * Only products that exist in Shopify are displayed — no hardcoded fallbacks.
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, ShieldCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DeliveryTime from '../src/components/ui/DeliveryTime';
import ProductCard from '../src/components/products/ProductCard';
import {
  getGlazenSchuifwandenProducts,
  type GlazenSchuifwandProduct,
} from '../src/lib/shopify/glazenSchuifwanden';

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

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-20">
      <PageHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 lg:pt-10">
        <div className="mb-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--text)] mb-1">
            {t('glazenSchuifwanden.title')}
          </h1>
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-[var(--muted)]">
            <DeliveryTime label="2-4 weken" />
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold">
              <ShieldCheck size={14} className="flex-shrink-0" />
              {t('standardVerandaPage.tenYearWarranty')}
            </span>
          </div>
          <p className="text-[var(--muted)] text-sm md:text-base leading-relaxed max-w-3xl mt-3">
            {t('glazenSchuifwanden.intro')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 lg:mt-6">
        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center gap-2 text-[var(--muted)] mb-6">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">{t('common.loading', 'Laden...')}</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <p className="text-[var(--muted)] text-sm">
            {t('glazenSchuifwanden.noProducts', 'Geen glazen schuifwanden gevonden.')}
          </p>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((item) => (
            <ProductCard
              key={item.railConfig.slug}
              product={{ ...item.shopifyProduct, requiresConfiguration: true }}
              href={`/glazen-schuifwanden/${item.railConfig.slug}`}
              deliveryLabel={item.railConfig.leadTime}
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
