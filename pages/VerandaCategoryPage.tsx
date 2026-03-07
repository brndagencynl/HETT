/**
 * Veranda Category Page
 * =====================
 * 
 * Instead of showing a product grid, this page presents a configurator entry
 * for the "Standaard Veranda" product with a wizard-based flow.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck } from 'lucide-react';
import DeliveryTime from '../src/components/ui/DeliveryTime';
import PageHeader from '../components/PageHeader';
import VerandaConfiguratorWizard, { VerandaConfiguratorWizardRef, VerandaPriceBreakdown } from '../components/VerandaConfiguratorWizard';
import { VerandaConfig, DEFAULT_COLOR } from '../src/configurator/schemas/veranda';
import { useCart } from '../context/CartContext';
import { ProductConfig } from '../types';
import {
  getStandaardVerandaProduct,
  getAvailableDepthsForWidth,
  getVariantForSize,
  StandaardVerandaProduct,
  StandaardVerandaVariant,
} from '../src/services/standaardVerandaProduct';
import { setOfferDraft } from '../src/services/offers/offerStorage';
import { createStandardOfferDraft } from '../src/services/offers/createStandardOfferDraft';
import { buildVisualizationLayers, FALLBACK_IMAGE, type VerandaColorId } from '../src/configurator/visual/verandaAssets';
import { useTranslation } from 'react-i18next';

const VerandaCategoryPage: React.FC = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const configuratorRef = useRef<VerandaConfiguratorWizardRef>(null);

  // Product data state
  const [product, setProduct] = useState<StandaardVerandaProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Size selection state (Step 1)
  const [selectedWidth, setSelectedWidth] = useState<number | null>(null);
  const [selectedDepth, setSelectedDepth] = useState<number | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<StandaardVerandaVariant | null>(null);

  // UI state
  const [cartError, setCartError] = useState<string | null>(null);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const productData = await getStandaardVerandaProduct();
        if (!productData) {
          setError(t('standardVerandaPage.productNotFound'));
        } else {
          setProduct(productData);
        }
      } catch (err) {
        console.error('Failed to fetch standaard veranda product:', err);
        setError(t('standardVerandaPage.loadError'));
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, []);

  // Update selected variant when width/depth changes
  useEffect(() => {
    if (product && selectedWidth && selectedDepth) {
      const variant = getVariantForSize(product, selectedWidth, selectedDepth);
      setSelectedVariant(variant);
    } else {
      setSelectedVariant(null);
    }
  }, [product, selectedWidth, selectedDepth]);

  // Get available depths for current width
  const availableDepths = product && selectedWidth
    ? getAvailableDepthsForWidth(product, selectedWidth)
    : [];

  // Reset depth when width changes (if current depth is not available)
  useEffect(() => {
    if (selectedDepth && availableDepths.length > 0 && !availableDepths.includes(selectedDepth)) {
      setSelectedDepth(null);
    }
  }, [selectedWidth, availableDepths, selectedDepth]);

  // Handle width change — reset depth if no longer available
  const handleWidthChange = (width: number) => {
    setSelectedWidth(width);
  };

  // Handle depth change
  const handleDepthChange = (depth: number) => {
    setSelectedDepth(depth);
  };

  // Handle configurator submit (add to cart OR offerte flow)
  const handleConfiguratorSubmit = (
    config: VerandaConfig,
    mode: 'order' | 'quote',
    price: number,
    details: { label: string; value: string }[],
    priceBreakdown: VerandaPriceBreakdown
  ) => {
    if (!selectedVariant || !product) return;

    // ─── Quote / Offerte flow (Montage = Ja) ───
    if (mode === 'quote') {
      // Build visualization layers from config for the preview
      const color = (config.color || DEFAULT_COLOR) as VerandaColorId;
      const layers = buildVisualizationLayers({
        color,
        daktype: config.daktype,
        goot: config.goot,
        zijwand_links: config.zijwand_links,
        zijwand_rechts: config.zijwand_rechts,
        voorzijde: config.voorzijde,
        verlichting: config.verlichting,
      });

      const draft = createStandardOfferDraft({
        config,
        productTitle: `${product.title} ${selectedWidth} x ${selectedDepth} cm`,
        productHandle: product.handle,
        widthCm: selectedWidth!,
        depthCm: selectedDepth!,
        details,
        priceBreakdown,
        previewLayers: layers.map((l) => l.src),
        previewImageUrl: product.imageUrl || FALLBACK_IMAGE,
      });

      setOfferDraft(draft);
      navigate('/offerte');
      return;
    }

    // ─── Normal add-to-cart flow (Montage = Nee) ───

    // Build product object for cart (must satisfy Product type)
    const cartProduct = {
      id: product.id,
      handle: product.handle,
      title: `${product.title} ${selectedWidth} x ${selectedDepth} cm`,
      category: 'verandas' as const,
      priceCents: selectedVariant.priceCents,
      price: selectedVariant.priceEur,
      imageUrl: product.imageUrl,
      shopifyVariantId: selectedVariant.id,
      // Required fields for Product type
      shortDescription: `Standaard veranda ${selectedWidth} x ${selectedDepth} cm`,
      description: product.description || '',
      specs: {},
      requiresConfiguration: true,
    };

    // Build ProductConfig structure expected by CartContext
    const productConfig: ProductConfig = {
      category: 'verandas',
      data: {
        ...config,
        // Include size info in config data for reference
        widthCm: selectedWidth!,
        depthCm: selectedDepth!,
      } as VerandaConfig & { widthCm: number; depthCm: number },
    };

    // Clear any previous error
    setCartError(null);

    // Add to cart with properly structured payload
    const result = addToCart(cartProduct, 1, {
      price: price,
      config: productConfig,
      configuration: config, // legacy field
      details: details,
      priceBreakdown: priceBreakdown,
      isConfigured: true,
      widthCm: selectedWidth!,
      depthCm: selectedDepth!,
      variantId: selectedVariant.id,
    });

    // Handle validation errors with inline message instead of alert
    if (!result.success && result.errors) {
      console.error('[VerandaCategoryPage] Add to cart failed:', result.errors);
      setCartError(result.errors.join('. '));
      // Auto-clear error after 5 seconds
      setTimeout(() => setCartError(null), 5000);
      return;
    }

    console.log('[VerandaCategoryPage] Added to cart:', {
      product: cartProduct.title,
      variantId: selectedVariant.id,
      config,
      price,
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-hett-bg">
        <PageHeader
          title={t('standardVerandaPage.pageTitle')}
          subtitle={t('standardVerandaPage.pageSubtitle')}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-hett-secondary" />
            <span className="ml-3 text-hett-muted font-medium">{t('standardVerandaPage.loadingProduct')}</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-hett-bg">
        <PageHeader
          title={t('standardVerandaPage.pageTitle')}
          subtitle={t('standardVerandaPage.pageSubtitle')}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <p className="text-red-600 font-medium mb-4">{error || t('standardVerandaPage.genericError')}</p>
            <Link to="/" className="text-hett-secondary hover:underline">
              {t('common.backToHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-20">

      {/* ── Page Header ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 lg:pt-10">
        <div className="mb-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--text)] mb-1">
            {t('standardVerandaPage.title')}
          </h1>
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-[var(--muted)]">
            <DeliveryTime label="1-2 weken" />
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold">
              <ShieldCheck size={14} className="flex-shrink-0" />
              {t('standardVerandaPage.tenYearWarranty')}
            </span>
            <Link to="/maatwerk-configurator" className="text-[13px] font-semibold text-[var(--text)] underline underline-offset-2 sm:ml-auto">
              {t('standardVerandaPage.customVerandas')} →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Unified Step-Based Configurator ─────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 lg:mt-6">
        <VerandaConfiguratorWizard
          ref={configuratorRef}
          productTitle={
            selectedVariant
              ? `${product.title} ${selectedWidth} x ${selectedDepth} cm`
              : product.title
          }
          basePrice={selectedVariant?.priceEur ?? (product.variants.length > 0 ? Math.min(...product.variants.map(v => v.priceEur)) : 0)}
          widthCm={selectedWidth ?? 606}
          onSubmit={handleConfiguratorSubmit}
          mode="new"
          layout="inline"
          showDimensionStep
          availableWidths={product.availableWidths}
          selectedWidth={selectedWidth}
          selectedDepth={selectedDepth}
          availableDepths={availableDepths}
          onWidthChange={handleWidthChange}
          onDepthChange={handleDepthChange}
          widthLabel={t('standardVerandaPage.chooseWidth')}
          depthLabel={t('standardVerandaPage.chooseDepth')}
          selectWidthFirstLabel={t('standardVerandaPage.selectWidthFirst')}
        />
      </div>

      {/* Inline Cart Validation Error Toast */}
      {cartError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 text-lg">!</span>
            </div>
            <div className="flex-1">
              <p className="text-red-800 font-medium text-sm">{t('standardVerandaPage.configIncomplete')}</p>
              <p className="text-red-600 text-sm mt-1">{cartError}</p>
            </div>
            <button 
              onClick={() => setCartError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerandaCategoryPage;
