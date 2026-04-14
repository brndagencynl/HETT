/**
 * Glazen Schuifwanden — Detail / PDP
 * ====================================
 * Slimglass-inspired layout: hero image, then configurator with image-card
 * options for glass type, color, and extras.
 *
 * Pricing: Shopify base + Σ priceDelta × quantity
 * Cart route: A (Storefront Cart API, accessories path)
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Loader2, Minus, Plus,
  Truck, ShieldCheck, Settings, Package, Check, Info, X,
} from 'lucide-react';
import DeliveryTime from '../src/components/ui/DeliveryTime';
import PageHeader from '../components/PageHeader';
import { useCart } from '../context/CartContext';
import {
  getSchuifwandConfigBySlug,
  calcOptionsTotalEur,
  buildConfigSummary,
  type ExtraOption,
  type RailType,
} from '../src/config/schuifwandConfig';
import {
  getGlazenSchuifwandBySlug,
  type GlazenSchuifwandProduct,
} from '../src/lib/shopify/glazenSchuifwanden';
import { getSchuifwandExtras } from '../src/lib/shopify/schuifwandExtras';
import { formatEUR, toCents } from '../src/utils/money';
import type { Product } from '../types';

/* ── Palette (our brand) ────────────────────────────────────────────────── */
const C = {
  primary:   'var(--primary, #111111)',
  accent:    'var(--secondary, #2A8FCE)',
  text:      'var(--text, #1a1a1a)',
  muted:     'var(--muted, #6b7280)',
  border:    '#e2e5e9',
  bg:        'var(--bg, #f8f8f6)',
  card:      '#ffffff',
  selected:  'var(--secondary, #2A8FCE)',
} as const;

/* ── Tabs ───────────────────────────────────────────────────────────────── */
type TabId = 'specs' | 'description';

/* ── Image card fallback (colored placeholder when no image yet) ───────── */
const ImagePlaceholder: React.FC<{ label: string; swatch?: string }> = ({ label, swatch }) => (
  <div
    className="w-full h-full flex items-center justify-center"
    style={{ backgroundColor: swatch || '#f0f0ee' }}
  >
    <span className="text-xs font-medium text-white/80 drop-shadow-sm text-center px-2">
      {label}
    </span>
  </div>
);

const GlazenSchuifwandenDetail: React.FC = () => {
  const { t } = useTranslation();
  const { rail } = useParams<{ rail: string }>();
  const { addToCart } = useCart();

  const config = getSchuifwandConfigBySlug(rail || '');

  // Shopify product
  const [shopifyData, setShopifyData] = useState<GlazenSchuifwandProduct | null>(null);
  const [shopifyLoading, setShopifyLoading] = useState(true);

  // Shopify extras (from Accessoires collection)
  const [shopifyExtras, setShopifyExtras] = useState<ExtraOption[]>([]);

  useEffect(() => {
    if (!rail || !config) return;
    let cancelled = false;
    (async () => {
      try {
        const [data, extras] = await Promise.all([
          getGlazenSchuifwandBySlug(rail),
          getSchuifwandExtras(config.rail as RailType),
        ]);
        if (!cancelled) {
          setShopifyData(data);
          setShopifyExtras(extras);
        }
      } catch (err) {
        console.error('[PDP] Fetch error:', err);
      } finally {
        if (!cancelled) setShopifyLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [rail, config]);

  // State
  const [selectedInbouwbreedte, setSelectedInbouwbreedte] = useState('');
  const [selectedWerkhoogte, setSelectedWerkhoogte] = useState('');
  const [selectedTypeGlas, setSelectedTypeGlas] = useState('helder');
  const [selectedKleurProfiel, setSelectedKleurProfiel] = useState('antraciet');
  const [selectedExtras, setSelectedExtras] = useState<Map<string, number>>(new Map());
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('specs');
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);

  // Gallery — image switches reactively with glass type
  const shopifyProduct = shopifyData?.shopifyProduct;
  const productImages = useMemo(() => shopifyProduct?.images ?? [], [shopifyProduct]);
  const IMAGE_INDEX_BY_GLASS: Record<string, number> = { helder: 0, getint: 1 };
  const fallbackImage = '/assets/images/glass_sliding_walls.webp';

  const mainImage = productImages[0] || shopifyProduct?.imageUrl || fallbackImage;

  // Derive the glass-specific image (reactive to both data load + glass type change)
  const glassImage = useMemo(() => {
    if (!productImages.length) return mainImage;
    const idx = IMAGE_INDEX_BY_GLASS[selectedTypeGlas] ?? 0;
    return productImages[idx] || productImages[0] || mainImage;
  }, [productImages, selectedTypeGlas, mainImage]);

  // activeImage = glassImage by default, but can be overridden by gallery nav
  const [imageOverride, setImageOverride] = useState<string | null>(null);

  // Reset override when glass type changes (so it snaps to the right image)
  useEffect(() => { setImageOverride(null); }, [selectedTypeGlas]);

  const activeImage = imageOverride ?? glassImage;
  const setActiveImage = useCallback((url: string) => setImageOverride(url), []);

  const allImages = useMemo(() => [...new Set(productImages.length ? productImages : [mainImage])], [productImages, mainImage]);

  // Derived selections
  const selectedBreedteOpt = config?.inbouwbreedte.find((o) => o.id === selectedInbouwbreedte);
  const selectedHoogteOpt = config?.werkhoogte.find((o) => o.id === selectedWerkhoogte);
  const selectedGlasOpt = config?.typeGlas.find((o) => o.id === selectedTypeGlas);
  const selectedKleurOpt = config?.kleurProfiel.find((o) => o.id === selectedKleurProfiel);
  const selectedExtrasArr = useMemo(
    () => shopifyExtras.filter((e) => selectedExtras.has(e.id)),
    [shopifyExtras, selectedExtras],
  );

  // Extras that support quantity selection
  const QUANTIFIABLE_EXTRAS = useMemo(() => new Set(['tochtstrip', 'deurgreep-handvat', 'meenemers']), []);

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
        extraQuantities: selectedExtras,
      }),
    [selectedBreedteOpt, selectedHoogteOpt, selectedGlasOpt, selectedKleurOpt, selectedExtrasArr, selectedExtras],
  );
  const unitTotal = basePriceEur + optionsTotalEur;
  const grandTotal = unitTotal * quantity;

  const hasBreedte = config ? config.inbouwbreedte.length > 0 : false;
  const hasHoogte = config ? config.werkhoogte.length > 0 : false;

  const canAddToCart =
    (!hasBreedte || !!selectedInbouwbreedte) &&
    (!hasHoogte || !!selectedWerkhoogte) &&
    !!selectedTypeGlas &&
    !!selectedKleurProfiel &&
    basePriceCents > 0;

  const toggleExtra = useCallback((id: string) => {
    setSelectedExtras((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.set(id, 1);
      }
      return next;
    });
  }, []);

  const setExtraQty = useCallback((id: string, qty: number) => {
    setSelectedExtras((prev) => {
      const next = new Map(prev);
      if (qty <= 0) {
        next.delete(id);
      } else {
        next.set(id, qty);
      }
      return next;
    });
  }, []);

  const displayTitle = shopifyProduct?.title || `${config?.rail ?? ''}-rail glazen schuifwand`;
  const displayIntro = shopifyProduct?.shortDescription || '';

  // 404
  if (!config) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text)] mb-3">
            {t('glazenSchuifwanden.notFound')}
          </h2>
          <p className="text-sm text-[var(--muted)] mb-8 leading-relaxed">
            {t('glazenSchuifwanden.notFoundHint')}
          </p>
          <Link
            to="/glazen-schuifwanden"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-[var(--primary)] hover:opacity-90 transition-opacity"
          >
            <ArrowLeft size={15} /> {t('glazenSchuifwanden.backToOverview')}
          </Link>
        </div>
      </div>
    );
  }

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
      extraQuantities: selectedExtras,
    });
    const extrasKey = [...selectedExtras.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([id, qty]) => `${id}:${qty}`).join('+') || 'none';
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
        value: selectedExtrasArr.map((e) => {
          const qty = selectedExtras.get(e.id) ?? 1;
          return qty > 1 ? `${e.label} (${qty}×)` : e.label;
        }).join(', '),
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
    <div className="min-h-screen bg-[var(--bg)]">
      <PageHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10 pb-12">
        {/* ── Two-column layout: image left (sticky), all content right ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* ── LEFT: Sticky Gallery ─────────────────────────────────── */}
          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-28">
              {/* Main image */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white">
                {shopifyLoading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 size={28} className="animate-spin text-gray-300" />
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
                      className="pointer-events-auto w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-shadow text-[var(--text)]"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => {
                        const idx = allImages.indexOf(activeImage);
                        setActiveImage(allImages[idx === allImages.length - 1 ? 0 : idx + 1]);
                      }}
                      className="pointer-events-auto w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-shadow text-[var(--text)]"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(img)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImage === img
                          ? 'border-[var(--secondary)] shadow-sm'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}

              {/* USP badges (desktop, below image) */}
              <div className="hidden lg:flex flex-wrap gap-3 mt-6">
                {[
                  { icon: <Truck size={15} />, text: 'Gratis bezorging' },
                  { icon: <ShieldCheck size={15} />, text: '5 jaar garantie' },
                  { icon: <Settings size={15} />, text: 'Zelf eenvoudig monteren' },
                  { icon: <Package size={15} />, text: 'Gehard veiligheidsglas' },
                ].map((u) => (
                  <span
                    key={u.text}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium bg-white border border-gray-200 text-[var(--text)]"
                  >
                    <span className="text-[var(--secondary)]">{u.icon}</span>
                    {u.text}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Title + Price + Configurator + CTA ────────────── */}
          <div className="lg:col-span-5">
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] leading-tight mb-2">
              {displayTitle}
            </h1>

            {displayIntro && (
              <p className="text-[15px] text-[var(--muted)] leading-relaxed mb-4">{displayIntro}</p>
            )}

            {/* Price */}
            {basePriceCents > 0 && (
              <div className="flex items-baseline gap-2 mb-5">
                <span className="text-3xl font-bold text-[var(--primary)] tabular-nums">
                  {formatEUR(grandTotal, 'euros')}
                </span>
                <span className="text-sm text-[var(--muted)]">incl. BTW</span>
              </div>
            )}

            {/* USP badges (mobile) */}
            <div className="flex lg:hidden flex-wrap gap-2 mb-5">
              {[
                { icon: <Truck size={13} />, text: 'Gratis bezorging' },
                { icon: <ShieldCheck size={13} />, text: '5 jaar garantie' },
                { icon: <Settings size={13} />, text: 'Eenvoudig monteren' },
              ].map((u) => (
                <span
                  key={u.text}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-white border border-gray-200 text-[var(--text)]"
                >
                  <span className="text-[var(--secondary)]">{u.icon}</span>
                  {u.text}
                </span>
              ))}
            </div>

            {/* USPs — bullet list */}
            <ul className="space-y-2 mb-6">
              {config.usps.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-[var(--text)]">
                  <Check size={16} className="mt-0.5 flex-shrink-0 text-[var(--secondary)]" />
                  {bullet}
                </li>
              ))}
            </ul>

            {/* Delivery */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 mb-8">
              <Check size={16} className="text-green-600 flex-shrink-0" />
              <span className="text-sm font-medium text-green-800">
                Gratis bezorging | Binnen {config.leadTime} geleverd
              </span>
            </div>

            {/* ── Configurator (in right column) ───────────────────── */}
              <div className="space-y-8">
                <h2 className="text-lg font-bold text-[var(--text)]">
                  {t('glazenSchuifwanden.configTitle', 'Stel uw schuifwand samen')}
                </h2>

                {/* ── 1. Inbouwbreedte (dropdown) ────────────────── */}
                {hasBreedte && (<div>
                  <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                    {t('glazenSchuifwanden.widthLabel')}
                  </label>
                  <select
                    value={selectedInbouwbreedte}
                    onChange={(e) => setSelectedInbouwbreedte(e.target.value)}
                    className={`w-full h-12 px-4 rounded-xl border-2 text-sm bg-white appearance-none transition-colors focus:outline-none focus:border-[var(--secondary)] ${
                      selectedInbouwbreedte ? 'border-[var(--secondary)]' : 'border-gray-200'
                    }`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 16px center',
                      paddingRight: '44px',
                    }}
                  >
                    <option value="">{t('glazenSchuifwanden.selectWidth')}</option>
                    {config.inbouwbreedte.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                        {opt.priceDelta > 0 ? ` (+${formatEUR(opt.priceDelta, 'euros')})` : ''}
                      </option>
                    ))}
                  </select>
                </div>)}

                {/* ── 2. Werkhoogte (dropdown) ───────────────────── */}
                {hasHoogte && (<div>
                  <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                    {t('glazenSchuifwanden.heightLabel')}
                  </label>
                  <select
                    value={selectedWerkhoogte}
                    onChange={(e) => setSelectedWerkhoogte(e.target.value)}
                    className={`w-full h-12 px-4 rounded-xl border-2 text-sm bg-white appearance-none transition-colors focus:outline-none focus:border-[var(--secondary)] ${
                      selectedWerkhoogte ? 'border-[var(--secondary)]' : 'border-gray-200'
                    }`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 16px center',
                      paddingRight: '44px',
                    }}
                  >
                    <option value="">{t('glazenSchuifwanden.selectHeight')}</option>
                    {config.werkhoogte.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                        {opt.priceDelta > 0 ? ` (+${formatEUR(opt.priceDelta, 'euros')})` : ''}
                      </option>
                    ))}
                  </select>
                </div>)}

                {/* ── 3. Type glas — compact image cards ──────────── */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                    {t('glazenSchuifwanden.glassTypeLabel')}
                  </label>
                  <div className="flex gap-2">
                    {config.typeGlas.map((glass) => {
                      const isSelected = selectedTypeGlas === glass.id;
                      const glassImageIdx = IMAGE_INDEX_BY_GLASS[glass.id] ?? 0;
                      const glassThumb = productImages[glassImageIdx] || glass.imageUrl;
                      return (
                        <button
                          key={glass.id}
                          onClick={() => setSelectedTypeGlas(glass.id)}
                          className={`group relative flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-[var(--secondary)] bg-blue-50/40'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            {glassThumb ? (
                              <img
                                src={glassThumb}
                                alt={glass.label}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg text-gray-400">
                                {glass.id === 'helder' ? '◻' : '◼'}
                              </div>
                            )}
                          </div>
                          <div className="text-left">
                            <span className="text-[13px] font-semibold text-[var(--text)] block leading-tight">{glass.label}</span>
                            {glass.priceDelta > 0 && (
                              <span className="text-[11px] text-[var(--muted)]">+ {formatEUR(glass.priceDelta, 'euros')}</span>
                            )}
                          </div>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--secondary)] flex items-center justify-center">
                              <Check size={11} className="text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── 4. Kleur profiel — compact swatches with image ── */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                    {t('glazenSchuifwanden.colorLabel')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {config.kleurProfiel.map((color) => {
                      const isSelected = selectedKleurProfiel === color.id;
                      return (
                        <button
                          key={color.id}
                          onClick={() => setSelectedKleurProfiel(color.id)}
                          className={`group relative flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-[var(--secondary)] bg-blue-50/40'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                            {color.imageUrl ? (
                              <img
                                src={color.imageUrl}
                                alt={color.label}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).parentElement!.style.backgroundColor = color.swatch || '#ccc';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full" style={{ backgroundColor: color.swatch || '#ccc' }} />
                            )}
                          </div>
                          <span className="text-[13px] font-semibold text-[var(--text)]">{color.label}</span>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--secondary)] flex items-center justify-center">
                              <Check size={11} className="text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── 5. Extra's — from Shopify Accessoires ──────── */}
                {shopifyExtras.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                      {t('glazenSchuifwanden.extrasLabel', "Extra's")}
                    </label>
                    <div className="space-y-2">
                      {shopifyExtras.map((extra) => {
                        const on = selectedExtras.has(extra.id);
                        const qty = selectedExtras.get(extra.id) ?? 0;
                        const isQuantifiable = QUANTIFIABLE_EXTRAS.has(extra.id);
                        const tooltipOpen = openTooltip === extra.id;
                        return (
                          <div key={extra.id} className="relative">
                            <button
                              type="button"
                              onClick={() => { if (!isQuantifiable || !on) toggleExtra(extra.id); }}
                              className={`group w-full flex items-center gap-3 rounded-xl border-2 overflow-hidden text-left transition-all ${
                                on
                                  ? 'border-[var(--secondary)] bg-blue-50/40'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {/* Thumbnail */}
                              <div className="w-16 h-16 flex-shrink-0 bg-gray-100 overflow-hidden relative">
                                {extra.imageUrl ? (
                                  <img
                                    src={extra.imageUrl}
                                    alt={extra.label}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package size={18} className="text-gray-300" />
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0 py-2 pr-1">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-[13px] font-semibold text-[var(--text)] truncate">{extra.label}</span>
                                  </div>
                                  <span className="text-[13px] font-bold text-[var(--primary)] tabular-nums whitespace-nowrap">
                                    {formatEUR(on && isQuantifiable ? extra.priceDelta * qty : extra.priceDelta, 'euros')}
                                  </span>
                                </div>
                              </div>

                              {/* Quantity controls for quantifiable extras */}
                              {isQuantifiable && on && (
                                <div
                                  className="flex items-center flex-shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex items-center rounded-lg overflow-hidden border border-gray-200 bg-white">
                                    <button
                                      type="button"
                                      onClick={() => setExtraQty(extra.id, qty - 1)}
                                      className="w-7 h-7 flex items-center justify-center text-[var(--muted)] hover:bg-gray-50 transition-colors"
                                    >
                                      <Minus size={12} />
                                    </button>
                                    <span className="w-6 h-7 flex items-center justify-center text-[12px] font-semibold text-[var(--text)] tabular-nums border-x border-gray-200">
                                      {qty}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setExtraQty(extra.id, qty + 1)}
                                      className="w-7 h-7 flex items-center justify-center text-[var(--muted)] hover:bg-gray-50 transition-colors"
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Info button */}
                              {extra.infoText && (
                                <div
                                  className="flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenTooltip(tooltipOpen ? null : extra.id);
                                  }}
                                >
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-gray-100 transition-colors">
                                    <Info size={14} />
                                  </div>
                                </div>
                              )}

                              {/* Toggle indicator */}
                              <div className="pr-3 flex-shrink-0">
                                <div
                                  className="w-5 h-5 rounded-md flex items-center justify-center border-2 transition-colors"
                                  style={{
                                    backgroundColor: on ? '#2A8FCE' : '#ffffff',
                                    borderColor: on ? '#2A8FCE' : '#d1d5db',
                                  }}
                                >
                                  {on && <Check size={12} className="text-white" />}
                                </div>
                              </div>
                            </button>

                            {/* Tooltip */}
                            {tooltipOpen && extra.infoText && (
                              <div className="absolute left-0 right-0 mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-3 animate-in fade-in">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-[12px] leading-relaxed text-[var(--text)]">
                                    {extra.infoText}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setOpenTooltip(null); }}
                                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-gray-100 transition-colors"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Price summary + Quantity + CTA ─────────────── */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
                  {basePriceCents > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm text-[var(--muted)]">
                        <span>{t('glazenSchuifwanden.productTotal', 'Product')}</span>
                        <span className="tabular-nums">{formatEUR(basePriceEur, 'euros')}</span>
                      </div>
                      {optionsTotalEur > 0 && (
                        <div className="flex justify-between text-sm text-[var(--muted)]">
                          <span>{t('glazenSchuifwanden.optionsTotal', 'Opties')}</span>
                          <span className="tabular-nums">+ {formatEUR(optionsTotalEur, 'euros')}</span>
                        </div>
                      )}
                      <div className="h-px bg-gray-200" />
                      <div className="flex justify-between items-baseline pt-1">
                        <span className="text-sm font-semibold text-[var(--text)]">
                          {t('glazenSchuifwanden.totalLabel', 'Totaal')}
                          {quantity > 1 && (
                            <span className="font-normal ml-1 text-[var(--muted)]">({quantity}x)</span>
                          )}
                        </span>
                        <span className="text-2xl font-bold text-[var(--primary)] tabular-nums">
                          {formatEUR(grandTotal, 'euros')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Qty + CTA row */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-full overflow-hidden border border-gray-200">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="w-10 h-10 flex items-center justify-center text-[var(--muted)] hover:bg-gray-50 disabled:opacity-25 transition-colors"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="w-10 h-10 flex items-center justify-center text-sm font-semibold text-[var(--text)] tabular-nums border-x border-gray-200">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-10 h-10 flex items-center justify-center text-[var(--muted)] hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      disabled={!canAddToCart || addingToCart}
                      className={`flex-1 h-12 text-[15px] font-semibold rounded-full transition-all ${
                        canAddToCart
                          ? 'text-white hover:opacity-90 shadow-sm hover:shadow-md'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      style={canAddToCart ? { backgroundColor: '#F28C28' } : undefined}
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

                  {!shopifyLoading && !shopifyProduct?.shopifyVariantId && (
                    <p className="text-center text-xs text-[var(--muted)]">
                      {t('glazenSchuifwanden.noVariantWarning')}
                    </p>
                  )}

                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <Check size={14} />
                    <span className="text-xs font-medium">
                      Gratis bezorging | Binnen {config.leadTime} geleverd
                    </span>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* ── Tabs section (below the fold) ────────────────────────────── */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex gap-1 mb-8 border-b border-gray-200">
            {([
              { id: 'specs' as TabId, label: 'Specificaties' },
              { id: 'description' as TabId, label: 'Beschrijving' },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-semibold transition-colors relative -mb-px border-b-2 ${
                  activeTab === tab.id
                    ? 'text-[var(--primary)] border-[var(--secondary)]'
                    : 'text-[var(--muted)] border-transparent hover:text-[var(--text)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'specs' && (
            <div className="max-w-2xl">
              {[
                { label: 'Type', value: `${config.rail}-rail schuifsysteem` },
                { label: 'Glastype', value: '10 mm gehard veiligheidsglas' },
                { label: 'Materiaal', value: 'Aluminium 6060 T6' },
                { label: 'Bovenrail', value: '66 mm x 75 mm (B x H)' },
                { label: 'Onderrail', value: '65 mm x 19 mm (B x H)' },
                { label: 'Wielen', value: 'Verstelbare gelagerde wielen' },
                { label: 'Levertijd', value: config.leadTime },
              ].map((spec) => (
                <div key={spec.label} className="flex justify-between py-3.5 text-sm border-b border-gray-100">
                  <span className="text-[var(--muted)]">{spec.label}</span>
                  <span className="font-medium text-[var(--text)] text-right">{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'description' && (
            <div className="max-w-2xl space-y-4">
              <p className="text-[15px] leading-relaxed text-[var(--text)]">
                De {config.rail}-rail glazen schuifwand is de ideale oplossing om uw veranda, overkapping
                of tuinkamer te voorzien van een stijlvolle en functionele afsluiting. Met {config.rail} panelen
                van gehard veiligheidsglas (10 mm) biedt deze schuifwand optimale bescherming tegen wind en regen,
                terwijl u blijft genieten van maximaal uitzicht.
              </p>
              <p className="text-[15px] leading-relaxed text-[var(--text)]">
                Het aluminium profiel (6060 T6) is standaard verkrijgbaar in vier kleuren: Antraciet,
                Zwart, Wit en Creme. De unieke lage onderrail van slechts 19 mm zorgt voor een
                drempelvrije overgang. Dankzij de verstelbare gelagerde wielen schuiven de panelen
                soepel en geluidsarm.
              </p>
              <ul className="space-y-2 pt-2">
                {config.usps.map((usp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-[var(--text)]">
                    <Check size={16} className="mt-0.5 flex-shrink-0 text-[var(--secondary)]" />
                    {usp}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlazenSchuifwandenDetail;
