/**
 * Maatwerk Veranda Configurator Component
 * ========================================
 * 
 * Standalone configurator for custom/maatwerk verandas.
 * NOT tied to product pages. NO localStorage persistence.
 * 
 * Step order:
 * 1. Afmetingen (Width × Depth)
 * 2. Color
 * 3. Daktype
 * 4. Goot
 * 5. Zijwand links
 * 6. Zijwand rechts
 * 7. Voorzijde
 * 8. Verlichting
 * 9. Overzicht
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Check, Info, ChevronLeft, ChevronRight, Truck, ShieldCheck, ArrowRight, Lightbulb, Edit2, Eye, ChevronUp, ShoppingBag, Loader2, Ruler, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Card } from './ui/card';
// Use shared LED addon service for both standard and maatwerk configurators
import { getLedTotals, LED_UNIT_PRICE_EUR } from '../src/services/addons/led';

// Custom maatwerk types and pricing - completely isolated
import {
  type PartialMaatwerkConfig,
  type MaatwerkConfig,
  type MaatwerkSize,
  type MaatwerkColorId,
  DEFAULT_MAATWERK_CONFIG,
  MAATWERK_COLOR_OPTIONS,
  MAATWERK_WIDTH_MIN,
  MAATWERK_WIDTH_MAX,
  MAATWERK_DEPTH_MIN,
  MAATWERK_DEPTH_MAX,
  clampMaatwerkWidth,
  clampMaatwerkDepth,
  isMaatwerkVeranda,
} from '../src/configurators/custom/customTypes';

import {
  calculateMaatwerkPrice,
  formatMaatwerkPrice,
  getMaatwerkOptionLabel,
  MAATWERK_OPTION_GROUPS,
  MAATWERK_ROOF_OPTIONS,
  MAATWERK_GUTTER_OPTIONS,
  MAATWERK_SIDEWALL_OPTIONS,
  MAATWERK_FRONT_OPTIONS,
  MAATWERK_EXTRAS_OPTIONS,
  getMaatwerkOptionPrice,
} from '../src/configurators/custom/customPricing';

import {
  type MaatwerkStepId,
  MAATWERK_STEPS,
  isMaatwerkStepComplete,
  formatMaatwerkSize,
  buildMaatwerkCartPayload,
  isMaatwerkConfigComplete,
  getMaatwerkValidationErrors,
} from '../src/configurators/custom/customHelpers';

import {
  MAATWERK_DEPTH_BUCKETS,
  MAATWERK_WIDTH_BUCKETS,
  MAATWERK_SURCHARGE,
  mapToBucket,
  resolveMaatwerkVariant,
} from '../src/configurators/custom/maatwerkShopifyMapping';

// Reuse visual layer system for preview (but from existing assets)
import { buildVisualizationLayers, type VisualizationLayer, FALLBACK_IMAGE, FALLBACK_THUMBNAIL, type VerandaColorId, getThumbnailPath, verifyThumbnailUrl } from '../src/configurator/visual/verandaAssets';

const MotionDiv = motion.div as any;

// =============================================================================
// TYPES
// =============================================================================

interface MaatwerkVerandaConfiguratorProps {
  onAddToCart?: (payload: ReturnType<typeof buildMaatwerkCartPayload>) => void;
  /** Edit mode: when set, the configurator saves changes instead of adding a new cart line */
  mode?: 'create' | 'edit';
  /** Prefill config (used for edit mode). Merged over defaults. */
  initialConfig?: PartialMaatwerkConfig;
  /** Called on save in edit mode (validated complete config) */
  onSave?: (config: MaatwerkConfig) => void;
  /** Called when user cancels in edit mode */
  onCancel?: () => void;
  /** Layout variant for embedding in a modal */
  layout?: 'page' | 'modal';
  onClose?: () => void;
}

// =============================================================================
// SAFE IMAGE COMPONENT
// =============================================================================

const SafeImage = ({ src, alt, className, fallback = FALLBACK_IMAGE }: { src: string; alt: string; className?: string; fallback?: string }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  
  const handleError = useCallback(() => {
    if (!hasError) {
      console.warn('[Thumb missing]', src, { fallbackUsed: fallback });
      setHasError(true);
      setImgSrc(fallback);
    }
  }, [src, fallback, hasError]);
  
  React.useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);
  
  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={className}
      onError={handleError}
    />
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const MaatwerkVerandaConfigurator: React.FC<MaatwerkVerandaConfiguratorProps> = ({
  onAddToCart,
  mode = 'create',
  initialConfig,
  onSave,
  onCancel,
  layout = 'page',
  onClose,
}) => {
  // STATE - completely isolated, NO localStorage
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [config, setConfig] = useState<PartialMaatwerkConfig>(() => {
    const mergedSize = {
      ...(DEFAULT_MAATWERK_CONFIG.size || { width: 600, depth: 300 }),
      ...(initialConfig?.size || {}),
    };
    return {
      ...DEFAULT_MAATWERK_CONFIG,
      ...initialConfig,
      size: mergedSize,
    };
  });
  const [infoModal, setInfoModal] = useState<{ title: string; text: string } | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [isSelectionOpen, setSelectionOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(true);
  const [shopifyVariantError, setShopifyVariantError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== 'edit') return;
    const mergedSize = {
      ...(DEFAULT_MAATWERK_CONFIG.size || { width: 600, depth: 300 }),
      ...(initialConfig?.size || {}),
    };
    setConfig({
      ...DEFAULT_MAATWERK_CONFIG,
      ...initialConfig,
      size: mergedSize,
    });
    setCurrentStepIndex(0);
    setAgreed(false);
  }, [mode, initialConfig]);

  // Current step
  const currentStep = MAATWERK_STEPS[currentStepIndex];
  const canProceed = isMaatwerkStepComplete(currentStep.id, config);
  const isLastStep = currentStepIndex === MAATWERK_STEPS.length - 1;

  // Price calculation
  const priceBreakdown = useMemo(() => calculateMaatwerkPrice(config), [config]);

  // LED totals based on width (exact mapping)
  const rawWidthForLed = config.size?.width ?? 0;
  const ledInfo = useMemo(() => getLedTotals(rawWidthForLed), [rawWidthForLed]);
  const ledAvailable = ledInfo.qty > 0;
  const ledSelectedTotal = config.verlichting ? ledInfo.total : 0;
  const displayGrandTotal = priceBreakdown.grandTotal + ledSelectedTotal;

  // Keep derived LED fields in config for debugging/consumers
  useEffect(() => {
    setConfig(prev => {
      const prevAny = prev as any;
      if (
        prevAny?.ledQty === ledInfo.qty &&
        prevAny?.ledUnitPrice === ledInfo.unitPrice &&
        prevAny?.ledTotalPrice === ledInfo.total &&
        prevAny?.ledWidthCm === rawWidthForLed
      ) {
        return prev;
      }
      return {
        ...prev,
        ledQty: ledInfo.qty,
        ledUnitPrice: ledInfo.unitPrice,
        ledTotalPrice: ledInfo.total,
        ledWidthCm: rawWidthForLed,
      };
    });
  }, [ledInfo.qty, ledInfo.total, ledInfo.unitPrice, rawWidthForLed]);

  // Visual layers - reuse existing asset system
  const visualLayers = useMemo((): VisualizationLayer[] => {
    const color = (config.color || 'ral7016') as VerandaColorId;
    return buildVisualizationLayers({
      color,
      daktype: config.daktype,
      goot: config.goot,
      zijwand_links: config.zijwand_links,
      zijwand_rechts: config.zijwand_rechts,
      voorzijde: config.voorzijde,
      verlichting: config.verlichting,
    });
  }, [config]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const goToStep = (stepIndex: number) => {
    if (stepIndex <= currentStepIndex && stepIndex >= 0) {
      setCurrentStepIndex(stepIndex);
    }
  };

  const handleNext = () => {
    if (canProceed && currentStepIndex < MAATWERK_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (isSubmitting) return;
    
    // Validate
    const errors = getMaatwerkValidationErrors(config);
    if (errors.length > 0) {
      alert(`Configuratie incompleet:\n${errors.join('\n')}`);
      return;
    }

    if (!isMaatwerkConfigComplete(config)) {
      alert('Vul alle verplichte velden in.');
      return;
    }

    setIsSubmitting(true);
    setShopifyVariantError(null);

    try {
      const widthCm = config.size?.width ?? 0;
      const depthCm = config.size?.depth ?? 0;

      const bucketW = mapToBucket(widthCm, MAATWERK_WIDTH_BUCKETS);
      const bucketD = mapToBucket(depthCm, MAATWERK_DEPTH_BUCKETS);

      console.log('[MaatwerkConfigurator] Resolving Shopify variant for buckets', {
        originalWidthCm: widthCm,
        originalDepthCm: depthCm,
        bucketW,
        bucketD,
      });

      const variantResult = await resolveMaatwerkVariant(bucketW, bucketD);
      if (!variantResult) {
        const message = `Geen geldige Shopify-variant gevonden voor deze maat (${bucketW}x${bucketD} cm).`;
        console.error('[MaatwerkConfigurator]', message);
        setShopifyVariantError(message);
        return;
      }

      // Get prices from Shopify variant
      const shopifyVariantPrice = variantResult.priceAmount;
      const maatwerkSurcharge = MAATWERK_SURCHARGE;
      const basePrice = shopifyVariantPrice + maatwerkSurcharge;
      const optionsTotal = priceBreakdown.optionsTotal;
      const grandTotal = basePrice + optionsTotal;
      const displayGrandTotalForPayload = grandTotal + (config.verlichting ? ledInfo.total : 0);

      console.log('[Maatwerk Price]', {
        variantId: variantResult.id,
        shopifyVariantPrice,
        maatwerkSurcharge,
        base: basePrice,
        optionsTotal,
        grandTotal,
        ledSelected: !!config.verlichting,
        ledQty: ledInfo.qty,
        ledTotal: ledInfo.total,
        displayGrandTotal: displayGrandTotalForPayload,
      });

      // Build payload with Shopify-based pricing
      const payload = buildMaatwerkCartPayload(config);
      payload.bucketWidthCm = bucketW;
      payload.bucketDepthCm = bucketD;
      payload.shopifyVariantId = variantResult.id;
      payload.shopifyVariantPrice = shopifyVariantPrice;
      payload.maatwerkSurcharge = maatwerkSurcharge;
      payload.basePrice = basePrice;
      payload.optionsTotal = optionsTotal;
      payload.totalPrice = grandTotal;
      
      // Update priceBreakdown with Shopify prices
      payload.priceBreakdown = {
        ...payload.priceBreakdown,
        shopifyVariantPrice,
        maatwerkSurcharge,
        basePrice,
        optionsTotal,
        grandTotal: displayGrandTotalForPayload,
        anchor: {
          anchorSizeKey: `${bucketW}x${bucketD}`,
          anchorPrice: shopifyVariantPrice,
          customFee: maatwerkSurcharge,
        },
      };

      if (!onAddToCart) {
        console.warn('[MaatwerkConfigurator] Missing onAddToCart in create mode');
        return;
      }
      onAddToCart(payload);
    } catch (error) {
      console.error('Add to cart failed:', error);
      alert('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (isSubmitting) return;

    const errors = getMaatwerkValidationErrors(config);
    if (errors.length > 0) {
      alert(`Configuratie incompleet:\n${errors.join('\n')}`);
      return;
    }

    if (!isMaatwerkConfigComplete(config)) {
      alert('Vul alle verplichte velden in.');
      return;
    }

    setIsSubmitting(true);
    try {
      onSave?.(config);
    } catch (error) {
      console.error('Save edit failed:', error);
      alert('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================================================
  // SIZE SELECTOR (Step 1) - Sliders with 1cm increments
  // ==========================================================================

  const renderSizeSelector = () => {
    const currentSize = config.size || { width: 600, depth: 300 };
    
    // Handle slider change
    const handleWidthChange = (value: number) => {
      console.log('[Maatwerk Slider] width slider =>', value);
      const clampedValue = clampMaatwerkWidth(value);
      setConfig((prev) => {
        const prevSize = prev.size || { width: 600, depth: 300 };
        return {
          ...prev,
          size: { ...prevSize, width: clampedValue },
        };
      });
    };

    const handleDepthChange = (value: number) => {
      console.log('[Maatwerk Slider] depth slider =>', value);
      const clampedValue = clampMaatwerkDepth(value);
      setConfig((prev) => {
        const prevSize = prev.size || { width: 600, depth: 300 };
        return {
          ...prev,
          size: { ...prevSize, depth: clampedValue },
        };
      });
    };

    // Calculate area in m²
    const areaM2 = (currentSize.width / 100) * (currentSize.depth / 100);
    
    const DimensionCard = ({
      label,
      value,
      min,
      max,
      onSlider,
      configKey,
    }: {
      label: string;
      value: number;
      min: number;
      max: number;
      onSlider: (value: number) => void;
      configKey: 'width' | 'depth';
    }) => {
      // Local string state for typing - allows empty/intermediate values
      const [inputValue, setInputValue] = React.useState(String(value));
      // Track if user is actively dragging
      const [isDragging, setIsDragging] = React.useState(false);
      // Local slider value during drag to prevent React re-render interference
      const [localSliderValue, setLocalSliderValue] = React.useState(value);
      
      // Sync local state when value prop changes (but not during drag)
      React.useEffect(() => {
        if (!isDragging) {
          setInputValue(String(value));
          setLocalSliderValue(value);
        }
      }, [value, isDragging]);

      const ratio = ((isDragging ? localSliderValue : value) - min) / (max - min);
      const percent = Math.max(0, Math.min(1, ratio)) * 100;

      // Clamp and commit value
      const commitValue = (raw: string) => {
        const parsed = parseInt(raw, 10);
        if (isNaN(parsed)) {
          setInputValue(String(value));
          return;
        }
        const clamped = Math.max(min, Math.min(max, Math.round(parsed)));
        console.log(`[Maatwerk Input] ${configKey} commit =>`, clamped);
        onSlider(clamped);
        setInputValue(String(clamped));
      };

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
      };

      const handleBlur = () => {
        commitValue(inputValue);
      };

      const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          commitValue(inputValue);
          (e.target as HTMLInputElement).blur();
        }
      };

      // Slider handlers
      const handleSliderInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val)) {
          setLocalSliderValue(val);
          console.log(`[Maatwerk Slider] ${configKey} drag =>`, val);
        }
      };

      const handleSliderMouseDown = () => {
        setIsDragging(true);
      };

      const handleSliderMouseUp = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
        setIsDragging(false);
        const target = e.target as HTMLInputElement;
        const val = parseInt(target.value, 10);
        if (!isNaN(val)) {
          console.log(`[Maatwerk Slider] ${configKey} commit =>`, val);
          onSlider(val);
        }
      };

      return (
        <Card padding="tight" className="space-y-2">
          <div className="flex items-end justify-between gap-4">
            <div className="text-sm font-bold text-gray-800">{label}</div>
            <div className="text-[11px] text-gray-500">{min}–{max} cm</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 relative h-6 flex items-center">
              {/* Track background */}
              <div className="absolute inset-x-0 h-2.5 bg-gray-200 rounded-full" />
              {/* Track fill */}
              <div 
                className="absolute left-0 h-2.5 bg-[#003878] rounded-full transition-all duration-75"
                style={{ width: `${percent}%` }}
              />
              {/* Actual range input */}
              <input
                type="range"
                min={min}
                max={max}
                step={1}
                value={isDragging ? localSliderValue : value}
                onInput={handleSliderInput}
                onChange={handleSliderInput}
                onMouseDown={handleSliderMouseDown}
                onTouchStart={handleSliderMouseDown}
                onMouseUp={handleSliderMouseUp}
                onTouchEnd={handleSliderMouseUp}
                className="absolute inset-0 w-full h-full cursor-pointer appearance-none bg-transparent
                  [&::-webkit-slider-runnable-track]:h-2.5 [&::-webkit-slider-runnable-track]:bg-transparent
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                  [&::-webkit-slider-thumb]:bg-[#003878] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-grab
                  [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                  [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10
                  [&::-moz-range-track]:h-2.5 [&::-moz-range-track]:bg-transparent
                  [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:bg-[#003878] 
                  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white
                  [&::-moz-range-thumb]:border-0"
              />
            </div>

            <div className="relative w-[128px] flex-shrink-0">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={isDragging ? String(localSliderValue) : inputValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="w-full py-2.5 px-3 pr-10 rounded-md font-semibold text-base text-center border border-gray-200 focus:border-[#003878] focus:ring-2 focus:ring-[#003878]/20 outline-none transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">cm</span>
            </div>
          </div>

          <div className="flex justify-between text-[11px] text-gray-400">
            <span>{min} cm</span>
            <span>{max} cm</span>
          </div>
        </Card>
      );
    };

    return (
      <div className="space-y-4">
        <DimensionCard
          label="Breedte"
          value={currentSize.width}
          min={MAATWERK_WIDTH_MIN}
          max={MAATWERK_WIDTH_MAX}
          onSlider={handleWidthChange}
          configKey="width"
        />

        <DimensionCard
          label="Diepte"
          value={currentSize.depth}
          min={MAATWERK_DEPTH_MIN}
          max={MAATWERK_DEPTH_MAX}
          onSlider={handleDepthChange}
          configKey="depth"
        />

        <Card padding="tight" className="flex items-start gap-3">
          <div className="w-9 h-9 bg-[#003878] rounded-lg flex items-center justify-center flex-shrink-0">
            <Ruler size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-gray-500">Geselecteerde afmeting</div>
            <div className="font-black text-[#003878] text-base leading-tight">
              {currentSize.width} × {currentSize.depth} cm
            </div>
            <div className="text-[11px] text-gray-500">{areaM2.toFixed(2)} m²</div>
          </div>
          <div className="ml-auto text-right flex-shrink-0">
            <div className="text-xs text-gray-500">Basisprijs</div>
            <div className="font-black text-[#003878] text-base leading-tight">{formatMaatwerkPrice(priceBreakdown.basePrice)}</div>
            {priceBreakdown.anchor && (
              <div className="text-[11px] text-gray-500">incl. {formatMaatwerkPrice(priceBreakdown.anchor.customFee)} maatwerk toeslag</div>
            )}
          </div>
        </Card>

        <Card padding="tight" className="bg-amber-50 border border-amber-200 flex items-start gap-2.5">
          <Info size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800 leading-snug">
            <strong>Maatwerk:</strong> Kies elke maat tot op de centimeter. De prijs wordt automatisch berekend op basis van de gekozen afmetingen, plus € 750,00 maatwerk toeslag.
          </div>
        </Card>
      </div>
    );
  };

  // ==========================================================================
  // COLOR SELECTOR
  // ==========================================================================

  const renderColorSelector = () => {
    const currentColor = config.color;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
        {MAATWERK_COLOR_OPTIONS.map((choice) => (
          <div
            key={choice.id}
            onClick={() => setConfig(prev => ({ ...prev, color: choice.id }))}
            className={`relative rounded-xl overflow-hidden cursor-pointer transition-all border-2 p-4 ${
              currentColor === choice.id
                ? 'border-[#003878] ring-2 ring-[#003878]/20 shadow-lg bg-[#003878]/5'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
            }`}
          >
            {currentColor === choice.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-[#003878] rounded-full flex items-center justify-center text-white shadow-sm">
                <Check size={14} strokeWidth={3} />
              </div>
            )}
            
            <div 
              className="w-full aspect-square rounded-lg mb-3 border border-gray-200 shadow-inner"
              style={{ backgroundColor: choice.hex }}
            />
            
            <span className="block text-sm font-bold text-gray-900 text-center">{choice.label}</span>
            {choice.description && (
              <span className="block text-xs text-gray-500 text-center mt-1">{choice.description}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  // ==========================================================================
  // CARD SELECTOR (for daktype)
  // ==========================================================================

  const renderCardSelector = (options: typeof MAATWERK_ROOF_OPTIONS, configKey: keyof PartialMaatwerkConfig) => {
    const currentValue = config[configKey];
    // Get current color for dynamic thumbnail URLs
    const selectedColor = (config.kleur || 'ral7016') as VerandaColorId;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((choice) => {
          const price = config.size ? getMaatwerkOptionPrice(choice.pricing, config.size) : 0;
          // Generate dynamic thumbnail URL based on selected color
          const thumbnailUrl = getThumbnailPath(String(configKey), choice.id, selectedColor);
          
          return (
            <div
              key={choice.id}
              onClick={() => setConfig(prev => ({ ...prev, [configKey]: choice.id }))}
              className={`relative rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${
                currentValue === choice.id
                  ? 'border-[#003878] ring-2 ring-[#003878]/20 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              {currentValue === choice.id && (
                <div className="absolute top-3 left-3 z-10 w-8 h-8 bg-[#003878] rounded-full flex items-center justify-center text-white shadow-md">
                  <Check size={18} strokeWidth={3} />
                </div>
              )}
              {choice.description && (
                <button
                  onClick={(e) => { e.stopPropagation(); setInfoModal({ title: choice.label, text: choice.description! }); }}
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-[#003878] shadow-sm transition-colors"
                >
                  <Info size={16} />
                </button>
              )}
              <div className="aspect-[4/3] bg-gray-100">
                <SafeImage 
                  src={thumbnailUrl} 
                  alt={choice.label} 
                  className="w-full h-full object-cover"
                  fallback={FALLBACK_THUMBNAIL}
                />
              </div>
              <div className="p-4 bg-white">
                <span className="block text-base font-bold text-gray-900 mb-1">{choice.label}</span>
                <span className="text-sm text-gray-600">{choice.description}</span>
                {price > 0 && (
                  <span className="inline-block mt-2 bg-[#FF7300]/10 text-[#FF7300] text-sm font-bold px-3 py-1 rounded-full">
                    + {formatMaatwerkPrice(price)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ==========================================================================
  // RADIO/SELECT SELECTOR
  // ==========================================================================

  const renderSelectSelector = (options: typeof MAATWERK_SIDEWALL_OPTIONS, configKey: keyof PartialMaatwerkConfig) => {
    const currentValue = config[configKey];

    return (
      <div className="space-y-3 max-w-2xl">
        {options.map((choice) => {
          const price = config.size ? getMaatwerkOptionPrice(choice.pricing, config.size) : 0;
          
          return (
            <div
              key={choice.id}
              onClick={() => setConfig(prev => ({ ...prev, [configKey]: choice.id }))}
              className={`flex items-start p-4 rounded-xl border-2 transition-all cursor-pointer group ${
                currentValue === choice.id
                  ? 'border-[#003878] bg-[#003878]/5 shadow-md ring-2 ring-[#003878]/10'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${
                currentValue === choice.id
                  ? 'bg-[#003878] text-white'
                  : 'bg-gray-100 text-gray-400 group-hover:text-gray-600'
              }`}>
                {currentValue === choice.id ? <Check size={22} /> : <Eye size={22} />}
              </div>
              <div className="flex-grow">
                <span className={`block font-bold text-base mb-1 ${
                  currentValue === choice.id ? 'text-gray-900' : 'text-gray-700'
                }`}>
                  {choice.label}
                </span>
                <span className="text-sm text-gray-600">{choice.description}</span>
                {price > 0 && (
                  <span className="block text-sm text-[#FF7300] font-semibold mt-1">+ {formatMaatwerkPrice(price)}</span>
                )}
              </div>
              {choice.description && (
                <button
                  onClick={(e) => { e.stopPropagation(); setInfoModal({ title: choice.label, text: choice.description! }); }}
                  className="p-2 text-gray-300 hover:text-[#003878] transition-colors ml-2"
                >
                  <Info size={18} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ==========================================================================
  // TOGGLE SELECTOR (for verlichting) - with dynamic LED pricing
  // ==========================================================================

  const renderToggleSelector = () => {
    const currentValue = config.verlichting;

    const rawWidth = rawWidthForLed;
    console.log(`[LED UI] widthCm=${rawWidth}`);
    console.log(`[LED UI] qty=${ledInfo.qty}`);
    console.log(`[LED UI] total=${ledInfo.total.toFixed(2)}`);
    console.log(`[LED UI] enabled=${!!currentValue}`);

    return (
      <div className="max-w-2xl">
        <div
          onClick={() => {
            setConfig(prev => ({ ...prev, verlichting: !currentValue }));
          }}
          className={`flex items-center justify-between p-6 rounded-xl border-2 cursor-pointer transition-all ${
            currentValue
              ? 'border-[#003878] bg-[#003878]/5 shadow-md ring-2 ring-[#003878]/10'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-sm transition-colors ${
              currentValue ? 'bg-[#FF7300] text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              <Lightbulb size={28} fill={currentValue ? "currentColor" : "none"} />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-lg block">LED verlichting</span>
              {ledAvailable ? (
                <>
                  <span className="text-sm text-gray-600">
                    Voeg {ledInfo.qty} LED spots toe (€ {LED_UNIT_PRICE_EUR.toFixed(2).replace('.', ',')} per stuk)
                  </span>
                  <span className="block text-sm text-[#FF7300] font-semibold mt-1">
                    + € {ledInfo.total.toFixed(2).replace('.', ',')}
                  </span>
                </>
              ) : (
                <span className="text-sm text-amber-600 flex items-center gap-1 mt-1">
                  <AlertTriangle size={14} />
                  {rawWidth > 0 
                    ? 'LED is voor deze breedte niet beschikbaar. (+ € 0,00)'
                    : 'Selecteer eerst afmetingen om LED prijs te berekenen.'
                  }
                </span>
              )}
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer" onClick={e => e.stopPropagation()}>
            <input
              type="checkbox"
              className="sr-only peer"
              checked={!!currentValue}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, verlichting: e.target.checked }));
              }}
            />
            <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#003878] shadow-inner" />
          </label>
        </div>
        {/* Warning if LED is ON but no mapping */}
        {currentValue && !ledAvailable && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-700 text-sm">
            <AlertTriangle size={16} />
            LED is voor deze breedte niet beschikbaar en wordt niet toegevoegd.
          </div>
        )}
        <p className="mt-4 text-sm text-gray-500 italic px-2">
          Deze stap is optioneel.
        </p>
      </div>
    );
  };

  // ==========================================================================
  // OVERVIEW
  // ==========================================================================

  const renderOverview = () => {
    const rawWidth = rawWidthForLed;
    const ledSummaryValue = config.verlichting
      ? (ledInfo.qty > 0
        ? `Ja, ${ledInfo.qty} LED spots (€ ${ledInfo.total.toFixed(2).replace('.', ',')})`
        : `Ja (niet beschikbaar voor ${rawWidth} cm)`)
      : 'Nee';
    
    const summaryItems = [
      { stepIndex: 0, label: 'Afmetingen', value: config.size ? formatMaatwerkSize(config.size) : '-', key: 'afmetingen' },
      { stepIndex: 1, label: 'Kleur profiel', value: getMaatwerkOptionLabel('color', config.color), key: 'color' },
      { stepIndex: 2, label: 'Daktype', value: getMaatwerkOptionLabel('daktype', config.daktype), key: 'daktype' },
      { stepIndex: 3, label: 'Goot optie', value: getMaatwerkOptionLabel('goot', config.goot), key: 'goot' },
      { stepIndex: 4, label: 'Zijwand links', value: getMaatwerkOptionLabel('zijwand_links', config.zijwand_links), key: 'zijwand_links' },
      { stepIndex: 5, label: 'Zijwand rechts', value: getMaatwerkOptionLabel('zijwand_rechts', config.zijwand_rechts), key: 'zijwand_rechts' },
      { stepIndex: 6, label: 'Voorzijde', value: getMaatwerkOptionLabel('voorzijde', config.voorzijde), key: 'voorzijde' },
      { stepIndex: 7, label: "Extra's", value: ledSummaryValue, key: 'verlichting' },
    ];

    return (
      <div className="space-y-6 max-w-3xl">
        {/* Success message */}
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 flex items-start gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
            <Check size={20} />
          </div>
          <div>
            <h4 className="font-bold text-green-800 text-lg">Configuratie compleet!</h4>
            <p className="text-sm text-green-700">Controleer uw selecties en voeg toe aan de winkelwagen.</p>
          </div>
        </div>

        {/* Configuration summary */}
        <div className="bg-white rounded-xl border-2 border-gray-200 divide-y divide-gray-100 overflow-hidden shadow-sm">
          {summaryItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 hover:bg-[#eff6ff] transition-colors">
              <div>
                <span className="text-sm text-gray-500 font-medium">{item.label}</span>
                <span className="block font-bold text-gray-900 text-base">{item.value}</span>
              </div>
              <button
                onClick={() => goToStep(item.stepIndex)}
                className="flex items-center gap-1.5 text-[#003878] hover:text-[#002050] font-semibold text-sm transition-colors"
              >
                <Edit2 size={14} />
                Wijzig
              </button>
            </div>
          ))}
        </div>

        {/* Price breakdown */}
        <div className="bg-[#eff6ff] rounded-xl p-6 space-y-3">
          <h4 className="font-bold text-gray-900 text-lg">Prijsoverzicht</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Basisprijs ({config.size ? formatMaatwerkSize(config.size) : '-'})</span>
              <span className="font-semibold text-gray-900">{formatMaatwerkPrice(priceBreakdown.basePrice)}</span>
            </div>
            {priceBreakdown.selections.filter(s => s.price > 0).map((selection, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="text-gray-600">{selection.choiceLabel}</span>
                <span className="font-semibold text-gray-900">+ {formatMaatwerkPrice(selection.price)}</span>
              </div>
            ))}
            <div className="border-t-2 border-gray-300 pt-3 mt-3 flex justify-between items-center">
              <span className="font-bold text-gray-900 text-base">Totaal incl. BTW</span>
              <span className="font-black text-2xl text-[#003878]">{formatMaatwerkPrice(displayGrandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Agreement checkbox */}
        <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-colors">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-[#003878] focus:ring-[#003878] cursor-pointer"
          />
          <span className="text-sm text-gray-700">
            Ik ga akkoord met de{' '}
            <Link to="/algemene-voorwaarden" className="text-[#003878] underline hover:no-underline" target="_blank" rel="noopener noreferrer">
              algemene voorwaarden
            </Link>{' '}
            en heb de{' '}
            <Link to="/privacy" className="text-[#003878] underline hover:no-underline" target="_blank" rel="noopener noreferrer">
              privacyverklaring
            </Link>{' '}
            gelezen.
          </span>
        </label>
      </div>
    );
  };

  // ==========================================================================
  // OPTION SELECTOR ROUTER
  // ==========================================================================

  const renderOptionSelector = () => {
    switch (currentStep.id) {
      case 'afmetingen':
        return renderSizeSelector();
      case 'color':
        return renderColorSelector();
      case 'daktype':
        return renderCardSelector(MAATWERK_ROOF_OPTIONS, 'daktype');
      case 'goot':
        return renderSelectSelector(MAATWERK_GUTTER_OPTIONS, 'goot');
      case 'zijwand_links':
        return renderSelectSelector(MAATWERK_SIDEWALL_OPTIONS, 'zijwand_links');
      case 'zijwand_rechts':
        return renderSelectSelector(MAATWERK_SIDEWALL_OPTIONS, 'zijwand_rechts');
      case 'voorzijde':
        return renderSelectSelector(MAATWERK_FRONT_OPTIONS, 'voorzijde');
      case 'verlichting':
        return renderToggleSelector();
      case 'overzicht':
        return renderOverview();
      default:
        return null;
    }
  };

  // ==========================================================================
  // PROGRESS INDICATOR
  // ==========================================================================

  const renderProgressIndicator = () => (
    <div className="flex items-center gap-1.5 mb-8 overflow-x-auto pb-2">
      {MAATWERK_STEPS.map((step, idx) => (
        <React.Fragment key={step.id}>
          <button
            onClick={() => goToStep(idx)}
            disabled={idx > currentStepIndex}
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              idx === currentStepIndex
                ? 'bg-[#003878] text-white'
                : idx < currentStepIndex
                  ? 'bg-[#003878]/20 text-[#003878] cursor-pointer hover:bg-[#003878]/30'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title={step.title}
          >
            {idx < currentStepIndex ? <Check size={14} /> : idx + 1}
          </button>
          {idx < MAATWERK_STEPS.length - 1 && (
            <div className={`h-0.5 w-4 lg:w-6 flex-shrink-0 transition-colors ${
              idx < currentStepIndex ? 'bg-[#003878]/30' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // ==========================================================================
  // VISUALIZATION
  // ==========================================================================

  const Visualization = ({ className = "" }: { className?: string }) => {
    const selectedColor = MAATWERK_COLOR_OPTIONS.find(c => c.id === config.color);
    
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl overflow-hidden ${className}`}>
        <div className="aspect-[16/10] relative flex items-center justify-center">
          {visualLayers.length > 0 ? (
            visualLayers.map((layer) => (
              <SafeImage
                key={layer.id}
                src={layer.src}
                alt={layer.alt}
                className="absolute inset-0 w-full h-full object-contain"
              />
            ))
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <Eye size={40} className="text-gray-300 mb-3" />
              <p className="text-sm text-gray-400 font-medium">Preview wordt geladen...</p>
            </div>
          )}
          
          {/* Config badges */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            {config.size && (
              <span className="px-2.5 py-1 bg-[#003878] text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                {config.size.width}×{config.size.depth}
              </span>
            )}
            {selectedColor && (
              <span 
                className="px-2.5 py-1 text-white text-[10px] font-bold rounded-full uppercase tracking-wide flex items-center gap-1.5"
                style={{ backgroundColor: selectedColor.hex === '#FDF4E3' ? '#8B8685' : selectedColor.hex }}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full border border-white/30"
                  style={{ backgroundColor: selectedColor.hex }}
                />
                {config.color?.replace('ral', 'RAL ')}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  const selectedColor = MAATWERK_COLOR_OPTIONS.find(c => c.id === config.color);
  const selectedSize = config.size;
  const selectedAreaM2 = selectedSize ? (selectedSize.width / 100) * (selectedSize.depth / 100) : null;

  const Chip = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-700 shadow-sm">
      {children}
    </span>
  );

  const isModalLayout = layout === 'modal';

  return (
    <div className={isModalLayout ? 'font-sans bg-white' : 'bg-hett-bg font-sans'}>
      {/* Info Modal */}
      <AnimatePresence>
        {infoModal && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50"
            onClick={() => setInfoModal(null)}
          >
            <MotionDiv
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-5 max-w-sm w-full shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-base text-gray-900">{infoModal.title}</h4>
                <button onClick={() => setInfoModal(null)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X size={18} />
                </button>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{infoModal.text}</p>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>

      <div className={isModalLayout ? 'py-4 sm:py-6' : 'pt-24 md:pt-28 pb-14'}>
        <div className={isModalLayout ? 'px-3 sm:px-6' : 'container'}>
          {!isModalLayout && (
            <div className="flex items-start justify-between gap-6 mb-6">
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl md:text-3xl font-black text-hett-primary">Maatwerk configurator</h1>
                {onClose && (
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                    <X size={20} />
                  </button>
                )}
              </div>
              <p className="text-sm text-hett-muted mt-1">Configureer uw veranda op maat</p>
            </div>
            <div className="hidden sm:block text-right flex-shrink-0">
              <div className="text-xs text-hett-muted uppercase tracking-wide">Totaal incl. BTW</div>
              <div className="text-2xl font-black text-hett-primary">{formatMaatwerkPrice(displayGrandTotal)}</div>
            </div>
          </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8 items-start">
            {/* Left: Preview */}
            <div className="space-y-3 lg:sticky lg:top-28">
              <Card padding="tight" className="overflow-hidden">
                <div className="flex items-center justify-between gap-3 mb-3 lg:hidden">
                  <button
                    type="button"
                    onClick={() => setIsMobilePreviewOpen((v) => !v)}
                    className="flex items-center gap-2 text-sm font-bold text-gray-800"
                  >
                    Preview
                    <ChevronUp
                      size={16}
                      className={`transition-transform ${isMobilePreviewOpen ? 'rotate-180' : 'rotate-0'}`}
                    />
                  </button>
                  <div className="text-xs text-gray-500">Stap {currentStepIndex + 1}/{MAATWERK_STEPS.length}</div>
                </div>

                <div className={`${isMobilePreviewOpen ? 'block' : 'hidden'} lg:block`}>
                  <Visualization />
                </div>
              </Card>

              <div className="flex flex-wrap gap-2">
                {selectedSize && (
                  <Chip>
                    <span className="text-gray-500">Afmeting</span>
                    <span className="text-gray-900">{selectedSize.width} × {selectedSize.depth} cm</span>
                  </Chip>
                )}
                {selectedColor && (
                  <Chip>
                    <span className="text-gray-500">Kleur</span>
                    <span className="text-gray-900">{selectedColor.label}</span>
                  </Chip>
                )}
                {selectedAreaM2 != null && (
                  <Chip>
                    <span className="text-gray-500">Oppervlakte</span>
                    <span className="text-gray-900">{selectedAreaM2.toFixed(2)} m²</span>
                  </Chip>
                )}
              </div>
            </div>

            {/* Right: Controls + Summary */}
            <div className="space-y-4">
              <Card padding="tight">
                {renderProgressIndicator()}

                <h2 className="text-xl font-bold text-gray-900 mb-1">{currentStep.title}</h2>
                <p className="text-sm text-gray-500 mb-4">{currentStep.description}</p>

                <AnimatePresence mode="wait">
                  <MotionDiv
                    key={currentStepIndex}
                    initial={{ opacity: 0, y: 10, pointerEvents: 'none' as const }}
                    animate={{ opacity: 1, y: 0, pointerEvents: 'auto' as const }}
                    exit={{ opacity: 0, y: -10, pointerEvents: 'none' as const }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderOptionSelector()}
                  </MotionDiv>
                </AnimatePresence>
              </Card>

              {/* Sticky CTA row */}
              <div className={isModalLayout ? 'sticky bottom-0 z-30' : 'sticky bottom-0 z-30'}>
                <Card padding="tight" className="border border-gray-200">
                  <div className="flex items-center justify-between sm:hidden mb-3">
                    <div>
                      <div className="text-[11px] text-gray-500 uppercase tracking-wide">Totaal incl. BTW</div>
                      <div className="text-xl font-black text-[#003878]">{formatMaatwerkPrice(displayGrandTotal)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {mode === 'edit' && (
                      <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-3 font-bold rounded-xl text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Annuleren
                      </button>
                    )}
                    {currentStepIndex > 0 && (
                      <button
                        onClick={handleBack}
                        className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                    )}

                    <div className="flex-1" />

                    {!isLastStep ? (
                      <button
                        onClick={handleNext}
                        disabled={!canProceed}
                        className={`px-6 py-3 font-bold rounded-xl text-sm flex items-center gap-2 transition-all ${
                          canProceed
                            ? 'bg-[#003878] text-white hover:bg-[#002050]'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Volgende
                        <ChevronRight size={18} />
                      </button>
                    ) : (
                      <div className="flex flex-col items-end gap-2">
                        {shopifyVariantError && mode !== 'edit' ? (
                          <div className="max-w-md w-full p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold">
                            {shopifyVariantError}
                          </div>
                        ) : null}
                        <button
                          onClick={mode === 'edit' ? handleSaveEdit : handleAddToCart}
                          disabled={!agreed || isSubmitting}
                          className={`px-6 py-3 font-bold rounded-xl text-sm flex items-center gap-2 transition-all ${
                            agreed && !isSubmitting
                              ? 'bg-[#FF7300] text-white hover:bg-[#E66600]'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              {mode === 'edit' ? 'Opslaan...' : 'Toevoegen...'}
                            </>
                          ) : (
                            <>
                              {mode === 'edit' ? 'Opslaan' : 'Toevoegen aan winkelwagen'}
                              <ArrowRight size={18} />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Truck size={12} /> Levering 5-10 werkdagen
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={12} /> 5 jaar garantie
                    </span>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaatwerkVerandaConfigurator;
