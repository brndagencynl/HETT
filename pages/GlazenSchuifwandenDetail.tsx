/**
 * Glazen Schuifwanden — Detail / PDP
 * ====================================
 * Premium retail aesthetic. Minimal icons, subtle borders, clean typography.
 *
 * Pricing: Shopify base + Σ priceDelta × quantity
 * Cart route: A (Storefront Cart API, accessories path)
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Minus, Plus } from 'lucide-react';
import DeliveryTime from '../src/components/ui/DeliveryTime';
import PageHeader from '../components/PageHeader';
import { useCart } from '../context/CartContext';
import {
  getSchuifwandConfigBySlug,
  calcOptionsTotalEur,
  buildConfigSummary,
} from '../src/config/schuifwandConfig';
import {
  getGlazenSchuifwandBySlug,
  type GlazenSchuifwandProduct,
} from '../src/lib/shopify/glazenSchuifwanden';
import { formatEUR, toCents } from '../src/utils/money';
import type { Product } from '../types';

const GlazenSchuifwandenDetail: React.FC = () => {
  const { t } = useTranslation();
  const { rail } = useParams<{ rail: string }>();
  const { addToCart } = useCart();

  const config = getSchuifwandConfigBySlug(rail || '');

  // Shopify
  const [shopifyData, setShopifyData] = useState<GlazenSchuifwandProduct | null>(null);
  const [shopifyLoading, setShopifyLoading] = useState(true);

  useEffect(() => {
    if (!rail) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getGlazenSchuifwandBySlug(rail);
        if (!cancelled) setShopifyData(data);
      } catch (err) {
        console.error('[PDP] Fetch error:', err);
      } finally {
        if (!cancelled) setShopifyLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [rail]);

  // State
  const [selectedInbouwbreedte, setSelectedInbouwbreedte] = useState('');
  const [selectedWerkhoogte, setSelectedWerkhoogte] = useState('');
  const [selectedTypeGlas, setSelectedTypeGlas] = useState('helder');
  const [selectedKleurProfiel, setSelectedKleurProfiel] = useState('antraciet');
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set());
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Gallery
  const shopifyProduct = shopifyData?.shopifyProduct;
  const mainImage = shopifyProduct?.imageUrl || '/assets/images/glass_sliding_walls.webp';
  const [activeImage, setActiveImage] = useState(mainImage);

  useEffect(() => {
    if (shopifyProduct?.imageUrl) setActiveImage(shopifyProduct.imageUrl);
  }, [shopifyProduct?.imageUrl]);

  const allImages = useMemo(() => [...new Set([mainImage])], [mainImage]);

  // Derived selections
  const selectedBreedteOpt = config?.inbouwbreedte.find((o) => o.id === selectedInbouwbreedte);
  const selectedHoogteOpt = config?.werkhoogte.find((o) => o.id === selectedWerkhoogte);
  const selectedGlasOpt = config?.typeGlas.find((o) => o.id === selectedTypeGlas);
  const selectedKleurOpt = config?.kleurProfiel.find((o) => o.id === selectedKleurProfiel);
  const selectedExtrasArr = useMemo(
    () => config?.extras.filter((e) => selectedExtras.has(e.id)) || [],
    [config?.extras, selectedExtras],
  );

  // Pricing
  const basePriceCents = shopifyProduct?.priceCents ?? 0;
  const basePriceEur = basePriceCents / 100;
  const optionsTotalEur = useMemo(
    () =>
      calcOptionsTotalEur({
        inbouwbreedte: selectedBreedteOpt,
        werkhoogte: selectedHoogteOpt,
        typeGlas: selectedGlasOpt,
        kleurProfiel: selectedKleurOpt,
        extras: selectedExtrasArr,
      }),
    [selectedBreedteOpt, selectedHoogteOpt, selectedGlasOpt, selectedKleurOpt, selectedExtrasArr],
  );
  const unitTotal = basePriceEur + optionsTotalEur;
  const grandTotal = unitTotal * quantity;

  const canAddToCart =
    !!selectedInbouwbreedte &&
    !!selectedWerkhoogte &&
    !!selectedTypeGlas &&
    !!selectedKleurProfiel &&
    basePriceCents > 0;

  const toggleExtra = useCallback((id: string) => {
    setSelectedExtras((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const displayTitle = shopifyProduct?.title || `${config?.rail ?? ''}-rail glazen schuifwand`;
  const displayIntro = shopifyProduct?.shortDescription || '';

  // 404
  if (!config) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#111] mb-3">
            {t('glazenSchuifwanden.notFound')}
          </h2>
          <p className="text-sm text-[#555] mb-8 leading-relaxed">
            {t('glazenSchuifwanden.notFoundHint')}
          </p>
          <Link
            to="/glazen-schuifwanden"
            className="ds-btn ds-btn--primary text-sm"
          >
            <ArrowLeft size={15} /> {t('glazenSchuifwanden.backToOverview')}
          </Link>
        </div>
      </div>
    );
  }

  const configReady = config.inbouwbreedte.length > 0 && config.werkhoogte.length > 0;

  // ── Add to cart ─────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!canAddToCart) return;
    if (!shopifyProduct?.shopifyVariantId) {
      if (shopifyLoading) return;
    }
    setAddingToCart(true);

    const summary = buildConfigSummary(config, {
      inbouwbreedte: selectedBreedteOpt,
      werkhoogte: selectedHoogteOpt,
      typeGlas: selectedGlasOpt,
      kleurProfiel: selectedKleurOpt,
      extras: selectedExtrasArr,
    });
    const extrasKey = [...selectedExtras].sort().join('+') || 'none';
    const configKey = `${config.slug}-${selectedInbouwbreedte}-${selectedWerkhoogte}-${selectedTypeGlas}-${selectedKleurProfiel}-${extrasKey}`;

    const product: Product = {
      id: `glazen-schuifwand-${configKey}`,
      handle: shopifyProduct?.handle || `glazen-schuifwand-${config.slug}`,
      title: displayTitle,
      category: 'accessoires',
      priceCents: toCents(unitTotal),
      price: unitTotal,
      shortDescription: summary,
      description: displayIntro,
      imageUrl: mainImage,
      specs: {},
      requiresConfiguration: false,
      shopifyVariantId: shopifyProduct?.shopifyVariantId || undefined,
    };

    const details: { label: string; value: string }[] = [
      { label: t('glazenSchuifwanden.widthLabel'), value: selectedBreedteOpt?.label || '' },
      { label: t('glazenSchuifwanden.heightLabel'), value: selectedHoogteOpt?.label || '' },
      { label: t('glazenSchuifwanden.glassTypeLabel'), value: selectedGlasOpt?.label || '' },
      { label: t('glazenSchuifwanden.colorLabel'), value: selectedKleurOpt?.label || '' },
    ];
    if (selectedExtrasArr.length > 0) {
      details.push({
        label: t('glazenSchuifwanden.extrasLabel', "Extra's"),
        value: selectedExtrasArr.map((e) => e.label).join(', '),
      });
    }

    addToCart(product, quantity, {
      price: unitTotal,
      color: selectedKleurOpt?.label || '',
      size: `${selectedInbouwbreedte} • ${selectedWerkhoogte}`,
      displayConfigSummary: summary,
      details,
    });

    setAddingToCart(false);
  };

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div className="min-h-screen bg-white">
      <PageHeader title={displayTitle} subtitle={t('glazenSchuifwanden.pageSubtitle')} />

      <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">

          {/* ── LEFT: Gallery ──────────────────────────────────────── */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] bg-[#f7f7f5] rounded-md overflow-hidden border border-[#eaeaea]">
              {shopifyLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 size={28} className="animate-spin text-[#d8d8d8]" />
                </div>
              ) : (
                <img
                  src={activeImage || mainImage}
                  alt={displayTitle}
                  className="w-full h-full object-cover"
                />
              )}
              {allImages.length > 1 && (
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                  <button
                    onClick={() => {
                      const idx = allImages.indexOf(activeImage);
                      setActiveImage(allImages[idx === 0 ? allImages.length - 1 : idx - 1]);
                    }}
                    className="pointer-events-auto w-9 h-9 flex items-center justify-center bg-white border border-[#eaeaea] rounded-[4px] text-[#111] hover:border-[#d8d8d8] transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => {
                      const idx = allImages.indexOf(activeImage);
                      setActiveImage(allImages[idx === allImages.length - 1 ? 0 : idx + 1]);
                    }}
                    className="pointer-events-auto w-9 h-9 flex items-center justify-center bg-white border border-[#eaeaea] rounded-[4px] text-[#111] hover:border-[#d8d8d8] transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`aspect-square bg-[#f7f7f5] rounded-[4px] overflow-hidden border transition-colors ${
                      activeImage === img
                        ? 'border-[#111]'
                        : 'border-[#eaeaea] hover:border-[#d8d8d8]'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product info + Configurator ─────────────────── */}
          <div className="lg:col-span-5">
            <div className="sticky top-32">

              {/* Meta line */}
              <div className="flex items-center gap-4 text-[13px] text-[#555] mb-6">
                <span>{config.leadTime}</span>
                <span className="w-px h-3 bg-[#eaeaea]" />
                <span>{t('glazenSchuifwanden.warranty')}</span>
              </div>

              {/* Title */}
              <h1 className="text-[28px] font-semibold tracking-tight text-[#111] leading-[1.15] mb-3">
                {displayTitle}
              </h1>
              {displayIntro && (
                <p className="text-[15px] text-[#555] leading-relaxed mb-8">{displayIntro}</p>
              )}

              {/* USPs — text-only list */}
              <ul className="ds-list mb-10">
                {config.usps.map((bullet, idx) => (
                  <li key={idx} className="text-[14px]">{bullet}</li>
                ))}
              </ul>

              {/* ── Configurator ──────────────────────────────────── */}
              {configReady ? (
                <div className="space-y-8">
                  <div className="h-px bg-[#eaeaea]" />

                  <p className="text-[13px] font-semibold uppercase tracking-[.08em] text-[#555]">
                    {t('glazenSchuifwanden.configTitle')}
                  </p>

                  {/* Inbouwbreedte */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#111] mb-2">
                      {t('glazenSchuifwanden.widthLabel')}
                    </label>
                    <select
                      value={selectedInbouwbreedte}
                      onChange={(e) => setSelectedInbouwbreedte(e.target.value)}
                      className="ds-select"
                    >
                      <option value="">{t('glazenSchuifwanden.selectWidth')}</option>
                      {config.inbouwbreedte.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                          {opt.priceDelta > 0 ? ` (+${formatEUR(opt.priceDelta, 'euros')})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Werkhoogte */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#111] mb-2">
                      {t('glazenSchuifwanden.heightLabel')}
                    </label>
                    <select
                      value={selectedWerkhoogte}
                      onChange={(e) => setSelectedWerkhoogte(e.target.value)}
                      className="ds-select"
                    >
                      <option value="">{t('glazenSchuifwanden.selectHeight')}</option>
                      {config.werkhoogte.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                          {opt.priceDelta > 0 ? ` (+${formatEUR(opt.priceDelta, 'euros')})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Type glas */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#111] mb-2">
                      {t('glazenSchuifwanden.glassTypeLabel')}
                    </label>
                    <div className="flex gap-2">
                      {config.typeGlas.map((glass) => (
                        <button
                          key={glass.id}
                          onClick={() => setSelectedTypeGlas(glass.id)}
                          className={`flex-1 py-2.5 text-[14px] font-medium text-center rounded-md border transition-colors ${
                            selectedTypeGlas === glass.id
                              ? 'border-[#111] bg-[#f7f7f5] text-[#111]'
                              : 'border-[#eaeaea] text-[#555] hover:border-[#d8d8d8]'
                          }`}
                        >
                          {glass.label}
                          {glass.priceDelta > 0 && (
                            <span className="block text-[11px] text-[#999] mt-0.5">
                              + {formatEUR(glass.priceDelta, 'euros')}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Kleur profiel */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#111] mb-2">
                      {t('glazenSchuifwanden.colorLabel')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {config.kleurProfiel.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => setSelectedKleurProfiel(color.id)}
                          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-md border text-[14px] font-medium transition-colors ${
                            selectedKleurProfiel === color.id
                              ? 'border-[#111] bg-[#f7f7f5] text-[#111]'
                              : 'border-[#eaeaea] text-[#555] hover:border-[#d8d8d8]'
                          }`}
                        >
                          {color.swatch && (
                            <span
                              className="w-4 h-4 rounded-full border border-[#d8d8d8] flex-shrink-0"
                              style={{ backgroundColor: color.swatch }}
                            />
                          )}
                          {color.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Extra's */}
                  {config.extras.length > 0 && (
                    <div>
                      <label className="block text-[13px] font-medium text-[#111] mb-2">
                        {t('glazenSchuifwanden.extrasLabel', "Extra's")}
                      </label>
                      <div className="space-y-1.5">
                        {config.extras.map((extra) => {
                          const on = selectedExtras.has(extra.id);
                          return (
                            <button
                              key={extra.id}
                              type="button"
                              onClick={() => toggleExtra(extra.id)}
                              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-md border text-left transition-colors ${
                                on
                                  ? 'border-[#111] bg-[#f7f7f5]'
                                  : 'border-[#eaeaea] hover:border-[#d8d8d8]'
                              }`}
                            >
                              {/* Checkbox */}
                              <span
                                className={`w-[18px] h-[18px] rounded-[3px] flex-shrink-0 flex items-center justify-center border transition-colors ${
                                  on
                                    ? 'bg-[#111] border-[#111]'
                                    : 'border-[#d8d8d8] bg-white'
                                }`}
                              >
                                {on && (
                                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                    <path d="M1 3.5L3.5 6L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </span>

                              {/* Text */}
                              <div className="flex-1 min-w-0">
                                <span className="text-[14px] font-medium text-[#111]">{extra.label}</span>
                                {extra.subtitle && (
                                  <span className="text-[12px] text-[#999] ml-1.5">{extra.subtitle}</span>
                                )}
                              </div>

                              {/* Price */}
                              <span className="text-[13px] font-medium text-[#555] flex-shrink-0 tabular-nums">
                                + {formatEUR(extra.priceDelta, 'euros')}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Price summary ───────────────────────────── */}
                  <div className="h-px bg-[#eaeaea]" />

                  {basePriceCents > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[14px] text-[#555]">
                        <span>{t('glazenSchuifwanden.productTotal', 'Product')}</span>
                        <span className="tabular-nums">{formatEUR(basePriceEur, 'euros')}</span>
                      </div>
                      {optionsTotalEur > 0 && (
                        <div className="flex justify-between text-[14px] text-[#555]">
                          <span>{t('glazenSchuifwanden.optionsTotal', 'Opties')}</span>
                          <span className="tabular-nums">+ {formatEUR(optionsTotalEur, 'euros')}</span>
                        </div>
                      )}
                      <div className="h-px bg-[#eaeaea]" />
                      <div className="flex justify-between items-baseline pt-1">
                        <span className="text-[14px] font-medium text-[#111]">
                          {t('glazenSchuifwanden.totalLabel', 'Totaal')}
                          {quantity > 1 && (
                            <span className="text-[#999] font-normal ml-1">({quantity}×)</span>
                          )}
                        </span>
                        <span className="ds-price text-[#111]">{formatEUR(grandTotal, 'euros')}</span>
                      </div>
                    </div>
                  )}

                  {/* ── Quantity + CTA ──────────────────────────── */}
                  <div className="flex items-center gap-4 pt-2">
                    {/* Qty */}
                    <div className="flex items-center border border-[#eaeaea] rounded-md overflow-hidden">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="w-10 h-10 flex items-center justify-center text-[#555] hover:bg-[#f7f7f5] disabled:opacity-25 transition-colors"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="w-10 h-10 flex items-center justify-center text-[14px] font-semibold text-[#111] tabular-nums border-x border-[#eaeaea]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-10 h-10 flex items-center justify-center text-[#555] hover:bg-[#f7f7f5] transition-colors"
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={handleAddToCart}
                      disabled={!canAddToCart || addingToCart}
                      className={`flex-1 h-12 text-[15px] font-semibold rounded-md transition-colors ${
                        canAddToCart
                          ? 'bg-[#111] text-white hover:bg-black'
                          : 'bg-[#eaeaea] text-[#999] cursor-not-allowed'
                      }`}
                    >
                      {addingToCart ? (
                        <Loader2 size={18} className="animate-spin mx-auto" />
                      ) : canAddToCart ? (
                        t('glazenSchuifwanden.addToCart')
                      ) : (
                        t('glazenSchuifwanden.selectOptions')
                      )}
                    </button>
                  </div>

                  {/* Variant warning */}
                  {!shopifyLoading && !shopifyProduct?.shopifyVariantId && (
                    <p className="text-center text-[12px] text-[#999]">
                      {t('glazenSchuifwanden.noVariantWarning')}
                    </p>
                  )}

                  {/* Delivery note */}
                  <div className="text-center pt-1">
                    <DeliveryTime label={t('glazenSchuifwanden.deliveryNote', { leadTime: config.leadTime })} />
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-px bg-[#eaeaea] mt-2" />
                  <div className="mt-8 border border-[#eaeaea] rounded-md p-5">
                    <p className="text-[14px] font-medium text-[#111] mb-1">
                      {t('glazenSchuifwanden.configComingSoon', 'Configurator binnenkort beschikbaar')}
                    </p>
                    <p className="text-[13px] text-[#555]">
                      {t('glazenSchuifwanden.configComingSoonHint', 'De maten voor deze variant worden nog toegevoegd. Neem contact op voor een offerte.')}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlazenSchuifwandenDetail;
