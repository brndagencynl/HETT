/**
 * Veranda Category Page
 * =====================
 * 
 * Instead of showing a product grid, this page presents a configurator entry
 * for the "Standaard Veranda" product with a wizard-based flow.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Loader2, Settings, Truck, ShieldCheck, Info } from 'lucide-react';
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
import { formatEUR } from '../src/utils/money';
import { setOfferDraft } from '../src/services/offers/offerStorage';
import { createStandardOfferDraft } from '../src/services/offers/createStandardOfferDraft';
import { buildVisualizationLayers, FALLBACK_IMAGE, type VerandaColorId } from '../src/configurator/visual/verandaAssets';

const VerandaCategoryPage: React.FC = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
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
  const [showConfigurator, setShowConfigurator] = useState(false);
  
  // Cart validation error state (for inline display)
  const [cartError, setCartError] = useState<string | null>(null);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const productData = await getStandaardVerandaProduct();
        if (!productData) {
          setError('Product niet gevonden. Controleer of het product "standaard-veranda" bestaat in Shopify.');
        } else {
          setProduct(productData);
        }
      } catch (err) {
        console.error('Failed to fetch standaard veranda product:', err);
        setError('Fout bij het laden van het product.');
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

  // Handle opening the configurator
  const handleOpenConfigurator = () => {
    if (selectedVariant && configuratorRef.current) {
      setShowConfigurator(true);
      configuratorRef.current.open();
    }
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
          title="Veranda's"
          subtitle="Configureer uw veranda"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-hett-secondary" />
            <span className="ml-3 text-hett-muted font-medium">Product laden...</span>
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
          title="Veranda's"
          subtitle="Configureer uw veranda"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <p className="text-red-600 font-medium mb-4">{error || 'Er is een fout opgetreden.'}</p>
            <Link to="/" className="text-hett-secondary hover:underline">
              Terug naar home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hett-bg pb-20">
      <PageHeader
        title="Stel uw veranda samen"
        subtitle="Kies een standaard maat en configureer uw veranda volledig naar wens"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3">
          <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Standaard veranda's</strong> hebben vaste afmetingen en zijn sneller leverbaar.
            Voor een veranda op maat kunt u onze{' '}
            <Link to="/maatwerk-configurator" className="text-blue-600 hover:underline font-medium">
              maatwerk configurator
            </Link>{' '}
            gebruiken.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Size Selection */}
          <div className="space-y-6">
            {/* Step 1: Width Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-hett-primary text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="text-lg font-bold text-hett-dark">Kies breedte</h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {product.availableWidths.map((width) => (
                  <button
                    key={width}
                    onClick={() => setSelectedWidth(width)}
                    className={`relative py-4 px-3 rounded-lg border-2 transition-all font-bold text-center ${
                      selectedWidth === width
                        ? 'border-hett-secondary bg-hett-secondary/10 text-hett-dark'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span className="text-lg">{width}</span>
                    <span className="block text-xs text-gray-500 font-normal">cm</span>
                    {selectedWidth === width && (
                      <Check size={16} className="absolute top-2 right-2 text-hett-secondary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Depth Selection */}
            <div className={`bg-white rounded-xl border border-gray-200 p-6 transition-opacity ${
              selectedWidth ? 'opacity-100' : 'opacity-50 pointer-events-none'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  selectedWidth ? 'bg-hett-primary text-white' : 'bg-gray-300 text-gray-500'
                }`}>
                  2
                </div>
                <h2 className="text-lg font-bold text-hett-dark">Kies diepte</h2>
              </div>
              
              {availableDepths.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {availableDepths.map((depth) => (
                    <button
                      key={depth}
                      onClick={() => setSelectedDepth(depth)}
                      className={`relative py-4 px-3 rounded-lg border-2 transition-all font-bold text-center ${
                        selectedDepth === depth
                          ? 'border-hett-secondary bg-hett-secondary/10 text-hett-dark'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <span className="text-lg">{depth}</span>
                      <span className="block text-xs text-gray-500 font-normal">cm</span>
                      {selectedDepth === depth && (
                        <Check size={16} className="absolute top-2 right-2 text-hett-secondary" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Selecteer eerst een breedte om de beschikbare dieptes te zien.
                </p>
              )}
            </div>

            {/* Selected Size Summary */}
            {selectedVariant && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-green-700 font-medium">Geselecteerde afmeting</div>
                    <div className="text-xl font-black text-green-800">
                      {selectedWidth} x {selectedDepth} cm
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-700 font-medium">Basisprijs</div>
                    <div className="text-2xl font-black text-green-800">
                      {formatEUR(selectedVariant.priceCents, 'cents')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Product Preview & CTA */}
          <div className="space-y-6">
            {/* Product Image */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="aspect-[4/3] relative">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-black text-hett-dark mb-2">{product.title}</h1>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {product.description || 'Hoogwaardige aluminium veranda met vele configuratie-opties. Kies uw gewenste afmetingen en stel de veranda volledig samen naar uw wensen.'}
                </p>
              </div>
            </div>

            {/* USPs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Truck size={20} className="text-green-600" />
                </div>
                <div>
                  <div className="font-bold text-hett-dark text-sm">Snelle levering</div>
                  <div className="text-xs text-gray-500">1-2 weken</div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ShieldCheck size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-hett-dark text-sm">10 jaar garantie</div>
                  <div className="text-xs text-gray-500">Op constructie</div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleOpenConfigurator}
              disabled={!selectedVariant}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                selectedVariant
                  ? 'bg-hett-secondary text-white hover:bg-hett-secondary/90 shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Settings size={22} />
              {selectedVariant ? 'Configureer uw veranda' : 'Selecteer eerst een afmeting'}
              {selectedVariant && <ArrowRight size={20} />}
            </button>

            {/* Alternative: Maatwerk */}
            <div className="text-center">
              <span className="text-gray-500 text-sm">Of bekijk onze </span>
              <Link
                to="/maatwerk-configurator"
                className="text-hett-secondary hover:underline font-medium text-sm"
              >
                maatwerk veranda's →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Cart Validation Error Toast */}
      {cartError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 text-lg">!</span>
            </div>
            <div className="flex-1">
              <p className="text-red-800 font-medium text-sm">Configuratie onvolledig</p>
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

      {/* Configurator Modal */}
      {selectedVariant && (
        <VerandaConfiguratorWizard
          ref={configuratorRef}
          productTitle={`${product.title} ${selectedWidth} x ${selectedDepth} cm`}
          basePrice={selectedVariant.priceEur}
          widthCm={selectedWidth!}
          onSubmit={handleConfiguratorSubmit}
          mode="new"
        />
      )}
    </div>
  );
};

export default VerandaCategoryPage;
