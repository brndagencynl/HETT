import React, { useState, forwardRef, useImperativeHandle, useMemo, useCallback, useEffect } from 'react';
import { X, Check, Info, ChevronLeft, ChevronRight, ShieldCheck, ArrowRight, Lightbulb, Edit2, Eye, ChevronUp, ShoppingBag, Loader2, AlertTriangle, Wrench, FileText } from 'lucide-react';
import DeliveryTime from '../src/components/ui/DeliveryTime';
import { motion, AnimatePresence } from 'framer-motion';
import { VERANDA_OPTIONS_UI, DEFAULT_VERANDA_CONFIG, VerandaConfig, COLOR_OPTIONS, DEFAULT_COLOR } from '../src/configurator/schemas/veranda';
import { calcVerandaPrice, type VerandaProductSize } from '../src/configurator/pricing/veranda';
import { getOptionPrice, FRONT_SIDE_OPTIONS, SIDE_WALL_OPTIONS, type OptionChoice } from '../src/configurator/pricing/verandapricing';
import { buildVisualizationLayers, type VisualizationLayer, FALLBACK_IMAGE, type VerandaColorId, getPreloadPaths, preloadImages } from '../src/configurator/visual/verandaAssets';
import { useTranslation } from 'react-i18next';
import { formatEUR, toCents } from '../src/utils/money';
// Use shared LED addon service for both standard and maatwerk configurators
import { getLedTotals, LED_UNIT_PRICE_EUR } from '../src/services/addons/led';

/**
 * Convert widthCm to the nearest supported VerandaProductSize
 * This ensures proper pricing for glass sliding walls based on actual product width
 * 
 * @param widthCm - Width in cm (e.g., 506, 606, 706)
 * @returns VerandaProductSize string (e.g., '500x300', '600x300', '700x300')
 */
function widthCmToProductSize(widthCm: number): VerandaProductSize {
    // Map widthCm to the closest supported width
    // Product handles use 506, 606, 706 etc. which map to 500, 600, 700 sizes
    let width: 500 | 600 | 700;
    if (widthCm <= 550) {
        width = 500;
    } else if (widthCm <= 650) {
        width = 600;
    } else {
        width = 700;
    }
    // Default depth is 300 - the exact depth doesn't affect glass wall pricing
    // since glass wall pricing is based on width only
    return `${width}x300` as VerandaProductSize;
}

/**
 * Get dynamic price for a side/front option based on actual product size.
 * Needed because glass sliding wall prices vary by width (voorzijde) or depth (zijwanden),
 * and sandwich/poly options also depend on depth.
 * 
 * @param optionKey - The option group key (e.g., 'voorzijde', 'zijwand_links')
 * @param choiceId  - The option choice ID (e.g., 'glas_schuifwand_helder', 'glas_schuifwand')
 * @param productSize - The actual product size
 * @returns Price in EUR
 */
function getDynamicSidePrice(optionKey: string, choiceId: string, productSize: VerandaProductSize): number {
    const options = (optionKey === 'voorzijde') ? FRONT_SIDE_OPTIONS : SIDE_WALL_OPTIONS;
    const option = options.find(opt => opt.id === choiceId);
    if (!option) return 0;
    return getOptionPrice(option.pricing, productSize);
}

const MotionDiv = motion.div as any;

// --- Types ---
export interface VerandaConfiguratorWizardRef {
    open: (initialConfig?: Partial<VerandaConfig>) => void;
    close: () => void;
}

export interface PriceBreakdownItem {
    label: string;
    amount: number;
}

export interface VerandaPriceBreakdown {
    basePrice: number;
    items: PriceBreakdownItem[];
    optionsTotal: number;
    grandTotal: number;
}

interface VerandaConfiguratorWizardProps {
    productTitle?: string;
    basePrice?: number;
    /** Width of the veranda in cm (e.g. 506, 606, 706) - used for dynamic LED pricing */
    widthCm?: number;
    onSubmit?: (config: VerandaConfig, mode: 'order' | 'quote', price: number, details: { label: string, value: string }[], priceBreakdown: VerandaPriceBreakdown) => void;
    /** 'new' (default) adds to cart, 'edit' updates existing item */
    mode?: 'new' | 'edit';
    /** Show message when config was reset to defaults due to missing data */
    showResetMessage?: boolean;
    /** Callback when user cancels (especially useful in edit mode) */
    onCancel?: () => void;
    /** Layout mode: 'modal' (default popup) or 'inline' (renders in-page, no overlay) */
    layout?: 'modal' | 'inline';
    /**
     * When true, an "Afmetingen" step is prepended as step 1.
     * Requires availableWidths, selectedWidth, selectedDepth, availableDepths,
     * onWidthChange, onDepthChange to be provided.
     */
    showDimensionStep?: boolean;
    /** Available widths for dimension step */
    availableWidths?: number[];
    /** Currently selected width */
    selectedWidth?: number | null;
    /** Currently selected depth */
    selectedDepth?: number | null;
    /** Available depths for the currently selected width */
    availableDepths?: number[];
    /** Callback when width changes */
    onWidthChange?: (width: number) => void;
    /** Callback when depth changes */
    onDepthChange?: (depth: number) => void;
    /** Label for "choose width" */
    widthLabel?: string;
    /** Label for "choose depth" */
    depthLabel?: string;
    /** Label for "select width first" hint */
    selectWidthFirstLabel?: string;
}

// --- Step Definitions ---
// Single source of truth for step order
type StepId = 'afmetingen' | 'color' | 'daktype' | 'goot' | 'zijwand_links' | 'zijwand_rechts' | 'voorzijde' | 'verlichting' | 'montage' | 'overzicht';

interface StepDefinition {
    id: StepId;
    title: string;
    description: string;
    optionKey?: keyof VerandaConfig;
    required: boolean;
}

/**
 * CONFIG_STEPS - Single source of truth for step order
 * 
 * ORDER:
 * 1. color - RAL color selection (determines base + overlay variants)
 * 2. daktype - Roof type
 * 3. goot - Gutter system  
 * 4. zijwand_links - Left side wall
 * 5. zijwand_rechts - Right side wall
 * 6. voorzijde - Front side (glazen schuifwand)
 * 7. verlichting - Extras (LED lighting) - NOT color-specific
 * 8. montage - Optional professional installation (Ja/Nee, default Nee)
 * 9. overzicht - Summary/review
 */
const buildSteps = (t: (key: string) => string): StepDefinition[] => [
    { 
        id: 'color', 
        title: t('configurator.steps.color.title'), 
        description: t('configurator.steps.color.description'),
        optionKey: 'color',
        required: true 
    },
    { 
        id: 'daktype', 
        title: t('configurator.steps.daktype.title'), 
        description: t('configurator.steps.daktype.description'),
        optionKey: 'daktype',
        required: true 
    },
    { 
        id: 'goot', 
        title: t('configurator.steps.goot.title'), 
        description: t('configurator.steps.goot.description'),
        optionKey: 'goot',
        required: true 
    },
    { 
        id: 'zijwand_links', 
        title: t('configurator.steps.zijwand_links.title'), 
        description: t('configurator.steps.zijwand_links.description'),
        optionKey: 'zijwand_links',
        required: false 
    },
    { 
        id: 'zijwand_rechts', 
        title: t('configurator.steps.zijwand_rechts.title'), 
        description: t('configurator.steps.zijwand_rechts.description'),
        optionKey: 'zijwand_rechts',
        required: false 
    },
    { 
        id: 'voorzijde', 
        title: t('configurator.steps.voorzijde.title'), 
        description: t('configurator.steps.voorzijde.description'),
        optionKey: 'voorzijde',
        required: false 
    },
    { 
        id: 'verlichting', 
        title: t('configurator.steps.verlichting.title'), 
        description: t('configurator.steps.verlichting.description'),
        optionKey: 'verlichting',
        required: false 
    },
    {
        id: 'montage',
        title: t('configuratorWizard.montageTitle'),
        description: t('configuratorWizard.montageDesc'),
        optionKey: 'montage',
        required: false
    },
    { 
        id: 'overzicht', 
        title: t('configurator.steps.overzicht.title'), 
        description: t('configurator.steps.overzicht.description'),
        required: false 
    },
];

// --- Helper Functions ---
const isStepComplete = (step: StepDefinition, config: Partial<VerandaConfig>, extraCtx?: { selectedWidth?: number | null; selectedDepth?: number | null }): boolean => {
    if (step.id === 'afmetingen') {
        return !!(extraCtx?.selectedWidth && extraCtx?.selectedDepth);
    }
    if (!step.required) return true;
    if (step.id === 'overzicht') return true;
    if (!step.optionKey) return true;
    
    const value = config[step.optionKey];
    return value !== undefined && value !== null;
};

// --- Safe Image Component (for visualization only) ---
const SafeImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);
    
    const handleError = useCallback(() => {
        if (!hasError) {
            setHasError(true);
            setImgSrc(FALLBACK_IMAGE);
        }
    }, [hasError]);
    
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

const VerandaConfiguratorWizard = forwardRef<VerandaConfiguratorWizardRef, VerandaConfiguratorWizardProps>(
    ({ productTitle = "HETT Premium Veranda", basePrice = 1250, widthCm = 606, onSubmit, mode = 'new', showResetMessage = false, onCancel, layout = 'modal',
       showDimensionStep = false, availableWidths, selectedWidth, selectedDepth, availableDepths,
       onWidthChange, onDepthChange, widthLabel, depthLabel, selectWidthFirstLabel,
    }, ref) => {
    
    const isInline = layout === 'inline';
    const { t } = useTranslation();

    // Build steps — optionally prepend "Afmetingen" dimension step
    const STEPS = useMemo(() => {
        const configSteps = buildSteps(t);
        if (!showDimensionStep) return configSteps;
        const dimStep: StepDefinition = {
            id: 'afmetingen',
            title: t('configurator.steps.afmetingen.title', { defaultValue: 'Afmetingen' }),
            description: t('configurator.steps.afmetingen.description', { defaultValue: 'Kies de breedte en diepte van uw veranda' }),
            required: true,
        };
        return [dimStep, ...configSteps];
    }, [t, showDimensionStep]);

    // In inline mode, always "open" — no modal toggling needed
    const [isOpen, setIsOpen] = useState(isInline);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [config, setConfig] = useState<Partial<VerandaConfig>>(DEFAULT_VERANDA_CONFIG);
    const [infoModal, setInfoModal] = useState<{ title: string, text: string } | null>(null);
    const [agreed, setAgreed] = useState(false);
    const [isSelectionOpen, setSelectionOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for add-to-cart
    const [didSubmit, setDidSubmit] = useState(false); // Track if form was submitted successfully

    // LED totals based on width (exact mapping)
    const ledInfo = useMemo(() => getLedTotals(widthCm), [widthCm]);
    const ledAvailable = ledInfo.qty > 0;
    const ledSelectedTotal = config.verlichting ? ledInfo.total : 0;

    // Convert widthCm to productSize for correct glass wall pricing
    const productSize = useMemo(() => widthCmToProductSize(widthCm), [widthCm]);

    // Price calculation - basePrice comes from Shopify product.price
    // Pass productSize to ensure correct pricing for width-dependent options (e.g., glass sliding walls)
    const { total: currentPrice, items: priceItems, basePrice: calcBasePrice } = calcVerandaPrice(basePrice, config as VerandaConfig, productSize);

    // Display-only totals: base product + options + (optional) LED add-on
    const displayTotal = currentPrice + ledSelectedTotal;

    // Keep derived LED fields in config for debugging/consumers
    // IMPORTANT: Include widthCm for LED checkout flow to extract width correctly
    useEffect(() => {
        setConfig(prev => {
            const prevAny = prev as any;
            if (
                prevAny?.widthCm === widthCm &&
                prevAny?.ledQty === ledInfo.qty &&
                prevAny?.ledUnitPrice === ledInfo.unitPrice &&
                prevAny?.ledTotalPrice === ledInfo.total &&
                prevAny?.ledWidthCm === widthCm
            ) {
                return prev;
            }
            console.log(`[VerandaConfigurator] Setting widthCm=${widthCm} in config for LED checkout`);
            return {
                ...prev,
                widthCm, // Used by LED checkout flow
                ledQty: ledInfo.qty,
                ledUnitPrice: ledInfo.unitPrice,
                ledTotalPrice: ledInfo.total,
                ledWidthCm: widthCm, // Legacy field
            };
        });
    }, [ledInfo.qty, ledInfo.total, ledInfo.unitPrice, widthCm]);
    
    // Log pricing source for debugging
    console.log('[VerandaConfigurator] Pricing:', {
        basePriceProp: basePrice,
        calculatedBasePrice: calcBasePrice,
        optionsTotal: priceItems.reduce((sum, item) => sum + item.amount, 0),
        grandTotal: displayTotal,
        source: 'Shopify via product.price prop',
    });

    // Visual layers for rendering - uses color to determine base image and overlay variants
    const visualLayers = useMemo((): VisualizationLayer[] => {
        const color = (config.color || DEFAULT_COLOR) as VerandaColorId;
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
    
    // Preload images for current and next step
    useEffect(() => {
        const paths = getPreloadPaths(currentStepIndex, {
            color: config.color as VerandaColorId,
            daktype: config.daktype,
            goot: config.goot,
            zijwand_links: config.zijwand_links,
            zijwand_rechts: config.zijwand_rechts,
            voorzijde: config.voorzijde,
            verlichting: config.verlichting,
        });
        preloadImages(paths);
    }, [currentStepIndex, config.color]);

    const currentStep = STEPS[currentStepIndex];
    const canProceed = isStepComplete(currentStep, config, { selectedWidth, selectedDepth });
    const isLastStep = currentStepIndex === STEPS.length - 1;

    useImperativeHandle(ref, () => ({
        open: (initialConfig) => {
            setConfig(initialConfig ? { ...DEFAULT_VERANDA_CONFIG, ...initialConfig } : DEFAULT_VERANDA_CONFIG);
            setCurrentStepIndex(0);
            setAgreed(false);
            setDidSubmit(false); // Reset submit flag when opening
            setIsOpen(true);
            if (!isInline) document.body.style.overflow = 'hidden';
        },
        close: () => closeConfigurator()
    }));

    const closeConfigurator = () => {
        if (!isInline) {
            setIsOpen(false);
            document.body.style.overflow = 'unset';
        }
        // In edit mode, call onCancel ONLY if we didn't submit (user cancelled)
        if (mode === 'edit' && onCancel && !didSubmit) {
            onCancel();
        }
    };

    const goToStep = (stepIndex: number) => {
        // Only allow going back or to current step
        if (stepIndex <= currentStepIndex && stepIndex >= 0) {
            setCurrentStepIndex(stepIndex);
        }
    };

    const handleNext = () => {
        if (canProceed && currentStepIndex < STEPS.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const handleAddToCart = async () => {
        // Prevent double submits
        if (isSubmitting) return;
        
        // Validation - include color as required
        if (!config.color || !config.daktype || !config.goot) {
            alert(t('configurator.validation.fillRequiredFields'));
            return;
        }

        setIsSubmitting(true);

        try {
            if (onSubmit) {
                const detailKeys = VERANDA_OPTIONS_UI.map(o => o.key);
                const details = detailKeys.map(key => {
                    if (key === 'verlichting') {
                        if (!config.verlichting) {
                            return {
                                label: VERANDA_OPTIONS_UI.find(f => f.key === key)?.label || key,
                                value: t('configurator.selection.no'),
                            };
                        }

                        if (ledInfo.qty > 0) {
                            return {
                                label: VERANDA_OPTIONS_UI.find(f => f.key === key)?.label || key,
                                value: `Ja, ${ledInfo.qty} LED spots (€ ${ledInfo.total.toFixed(2).replace('.', ',')})`,
                            };
                        }

                        return {
                            label: VERANDA_OPTIONS_UI.find(f => f.key === key)?.label || key,
                            value: `Ja (niet beschikbaar voor ${widthCm} cm)`,
                        };
                    }

                    return {
                        label: VERANDA_OPTIONS_UI.find(f => f.key === key)?.label || key,
                        value: getOptionLabel(key, config[key as keyof VerandaConfig])
                    };
                });
                
                // Build price breakdown for the popup
                const priceBreakdown: VerandaPriceBreakdown = {
                    basePrice: calcBasePrice,
                    items: config.verlichting
                        ? [
                            ...priceItems,
                            {
                                label: ledInfo.qty > 0
                                    ? `LED spots (${ledInfo.qty}x € ${ledInfo.unitPrice.toFixed(2).replace('.', ',')})`
                                    : 'LED spots (niet beschikbaar)',
                                amount: ledSelectedTotal,
                            },
                          ]
                        : priceItems,
                                        optionsTotal: priceItems.reduce((sum, item) => sum + item.amount, 0) + (config.verlichting ? ledSelectedTotal : 0),
                    grandTotal: displayTotal,
                };
                
                // Mark as submitted before calling onSubmit (prevents onCancel from being called)
                setDidSubmit(true);
                
                // Call parent handler which adds to cart
                // Cart drawer will open automatically via CartContext.addToCart
                // IMPORTANT: pass base configurator price (excl. LED) to cart line to avoid double-counting
                onSubmit(config as VerandaConfig, 'order', currentPrice, details, priceBreakdown);
            }
            
            // Close configurator after successful add-to-cart
            // User stays on PDP, cart drawer opens via CartContext
            closeConfigurator();
        } catch (error) {
            // If add-to-cart fails, keep configurator open and show error
            console.error('Add to cart failed:', error);
            alert(t('configurator.validation.errorOccurred'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle quote request (separate from add-to-cart)
    const handleQuoteRequest = () => {
        if (!config.color || !config.daktype || !config.goot) {
            alert(t('configurator.validation.fillRequiredFields'));
            return;
        }

        if (onSubmit) {
            const detailKeys = VERANDA_OPTIONS_UI.map(o => o.key);
            const details = detailKeys.map(key => {
                if (key === 'verlichting') {
                    if (!config.verlichting) {
                        return {
                            label: VERANDA_OPTIONS_UI.find(f => f.key === key)?.label || key,
                            value: t('configurator.selection.no'),
                        };
                    }

                    if (ledInfo.qty > 0) {
                        return {
                            label: VERANDA_OPTIONS_UI.find(f => f.key === key)?.label || key,
                            value: t('configuratorWizard.ledYesSpots', { qty: ledInfo.qty, price: ledInfo.total.toFixed(2).replace('.', ',') }),
                        };
                    }

                    return {
                        label: VERANDA_OPTIONS_UI.find(f => f.key === key)?.label || key,
                        value: t('configuratorWizard.ledNotAvailableFor', { width: widthCm }),
                    };
                }

                return {
                    label: VERANDA_OPTIONS_UI.find(f => f.key === key)?.label || key,
                    value: getOptionLabel(key, config[key as keyof VerandaConfig])
                };
            });
            
            // Build price breakdown for the popup
            const priceBreakdown: VerandaPriceBreakdown = {
                basePrice: calcBasePrice,
                items: config.verlichting
                    ? [
                        ...priceItems,
                        {
                            label: ledInfo.qty > 0
                                ? `LED spots (${ledInfo.qty}x € ${ledInfo.unitPrice.toFixed(2).replace('.', ',')})`
                                : t('configuratorWizard.ledNotAvailableLabel'),
                            amount: ledSelectedTotal,
                        },
                      ]
                    : priceItems,
                                optionsTotal: priceItems.reduce((sum, item) => sum + item.amount, 0) + (config.verlichting ? ledSelectedTotal : 0),
                grandTotal: displayTotal,
            };
            
            // IMPORTANT: pass base configurator price (excl. LED) to keep behavior consistent with order flow
            onSubmit(config as VerandaConfig, 'quote', currentPrice, details, priceBreakdown);
        }
        
        closeConfigurator();
    };

    const getOptionLabel = (key: string, value: any): string => {
        if (value === undefined || value === null) return t('configurator.selection.none');
        if (typeof value === 'boolean') return value ? t('configurator.selection.yes') : t('configurator.selection.no');
        
        const field = VERANDA_OPTIONS_UI.find(f => f.key === key);
        if (!field) return String(value);
        
        const choice = field.choices.find(c => c.value === value);
        return choice ? choice.label : String(value);
    };

    // --- Dimension step renderer ---
    // Mobile: native <select> dropdowns  |  Desktop (sm+): card grid buttons
    const renderDimensionSelector = () => {
        const wLabel = widthLabel || t('standardVerandaPage.chooseWidth');
        const dLabel = depthLabel || t('standardVerandaPage.chooseDepth');
        const hintLabel = selectWidthFirstLabel || t('standardVerandaPage.selectWidthFirst');
        const widths = availableWidths || [];
        const depths = availableDepths || [];

        return (
            <div className="space-y-6">
                {/* ── Width ─────────────────────────── */}
                <div>
                    <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wide mb-3">{wLabel}</h3>

                    {/* Mobile: dropdown */}
                    <select
                        value={selectedWidth ?? ''}
                        onChange={(e) => onWidthChange?.(Number(e.target.value))}
                        className="sm:hidden w-full rounded-xl border-2 border-[var(--border)] bg-[var(--surface,#fff)] text-[var(--text)] font-bold text-sm px-4 py-3 appearance-none focus:outline-none focus:border-[var(--text)]"
                    >
                        <option value="" disabled>{wLabel}</option>
                        {widths.map((w) => (
                            <option key={w} value={w}>{w} cm</option>
                        ))}
                    </select>

                    {/* Desktop: card grid */}
                    <div className="hidden sm:grid sm:grid-cols-5 gap-2">
                        {widths.map((w) => (
                            <button
                                key={w}
                                onClick={() => onWidthChange?.(w)}
                                className={`ds-card py-3 text-center font-bold text-sm transition-all ${
                                    selectedWidth === w
                                        ? 'border-[var(--text)] bg-[var(--text)] text-white'
                                        : 'hover:border-[var(--border-strong)] text-[var(--text)]'
                                }`}
                            >
                                {w} cm
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Depth ─────────────────────────── */}
                <div className={`transition-opacity ${selectedWidth ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                    <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wide mb-3">{dLabel}</h3>

                    {depths.length > 0 ? (
                        <>
                            {/* Mobile: dropdown */}
                            <select
                                value={selectedDepth ?? ''}
                                onChange={(e) => onDepthChange?.(Number(e.target.value))}
                                className="sm:hidden w-full rounded-xl border-2 border-[var(--border)] bg-[var(--surface,#fff)] text-[var(--text)] font-bold text-sm px-4 py-3 appearance-none focus:outline-none focus:border-[var(--text)]"
                            >
                                <option value="" disabled>{dLabel}</option>
                                {depths.map((d) => (
                                    <option key={d} value={d}>{d} cm</option>
                                ))}
                            </select>

                            {/* Desktop: card grid */}
                            <div className="hidden sm:grid sm:grid-cols-4 gap-2">
                                {depths.map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => onDepthChange?.(d)}
                                        className={`ds-card py-3 text-center font-bold text-sm transition-all ${
                                            selectedDepth === d
                                                ? 'border-[var(--text)] bg-[var(--text)] text-white'
                                                : 'hover:border-[var(--border-strong)] text-[var(--text)]'
                                        }`}
                                    >
                                        {d} cm
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-[var(--muted)] text-sm">{hintLabel}</p>
                    )}
                </div>
            </div>
        );
    };

    // --- Renderers ---
    const renderOptionSelector = () => {
        if (currentStep.id === 'afmetingen') {
            return renderDimensionSelector();
        }

        if (currentStep.id === 'overzicht') {
            return renderOverview();
        }

        if (currentStep.id === 'montage') {
            return renderMontageSelector();
        }

        const optionDef = VERANDA_OPTIONS_UI.find(o => o.key === currentStep.optionKey);
        if (!optionDef) return null;

        const currentValue = config[currentStep.optionKey as keyof VerandaConfig];

        // Color selector (for kleur step) — always 3 cols, compact
        if (optionDef.type === 'color') {
            return (
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {optionDef.choices.map((choice: any) => (
                        <div
                            key={choice.value}
                            onClick={() => setConfig(prev => ({ ...prev, [optionDef.key]: choice.value }))}
                            className={`relative rounded-xl overflow-hidden cursor-pointer transition-all border-2 p-2 sm:p-3 ${
                                currentValue === choice.value 
                                    ? 'border-[#003878] ring-2 ring-[#003878]/20 shadow-sm bg-[#003878]/5' 
                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
                            }`}
                        >
                            {currentValue === choice.value && (
                                <div className="absolute top-1.5 right-1.5 w-5 h-5 sm:w-6 sm:h-6 bg-[#003878] rounded-full flex items-center justify-center text-white shadow-sm">
                                    <Check size={12} strokeWidth={3} />
                                </div>
                            )}
                            
                            {/* Color swatch */}
                            <div 
                                className="w-full aspect-[4/3] rounded-lg mb-2 border border-gray-200 shadow-inner"
                                style={{ backgroundColor: choice.hex }}
                            />
                            
                            <span className="block text-xs sm:text-sm font-bold text-gray-900 text-center">{choice.label}</span>
                        </div>
                    ))}
                </div>
            );
        }

        // Card-based selector (for daktype) - TEXT-ONLY, compact
        if (optionDef.type === 'card') {
            return (
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {optionDef.choices.map((choice: any) => (
                        <button
                            key={choice.value}
                            type="button"
                            onClick={() => setConfig(prev => ({ ...prev, [optionDef.key]: choice.value }))}
                            aria-pressed={currentValue === choice.value}
                            className={`relative text-left p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                currentValue === choice.value 
                                    ? 'border-[#003878] bg-[#003878]/5 ring-2 ring-[#003878]/10 shadow-md' 
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            }`}
                        >
                            {currentValue === choice.value && (
                                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 bg-[#003878] rounded-full flex items-center justify-center text-white">
                                    <Check size={12} strokeWidth={3} />
                                </div>
                            )}
                            <span className="block text-sm sm:text-base font-bold text-gray-900 pr-6">{choice.label}</span>
                            {choice.price > 0 && (
                                <span className="inline-block mt-2 bg-[#FF7300]/10 text-[#FF7300] text-xs sm:text-sm font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
                                    + {formatEUR(toCents(choice.price), 'cents')}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            );
        }

        // Toggle selector (for verlichting) - with dynamic LED pricing
        if (optionDef.type === 'toggle') {
            return (
                <div>
                    <div
                        onClick={() => {
                            setConfig(prev => ({ ...prev, [optionDef.key]: !currentValue }));
                        }}
                        className={`flex items-center justify-between p-3 sm:p-5 rounded-xl border-2 cursor-pointer transition-all ${
                            currentValue 
                                ? 'border-[#003878] bg-[#003878]/5 shadow-md ring-2 ring-[#003878]/10' 
                                : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-sm transition-colors flex-shrink-0 ${
                                currentValue ? 'bg-[#FF7300] text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                                <Lightbulb size={22} fill={currentValue ? "currentColor" : "none"} />
                            </div>
                            <div>
                                <span className="font-bold text-gray-900 text-sm sm:text-base block">{t('configuratorWizard.ledLighting')}</span>
                                {ledAvailable ? (
                                    <>
                                        <span className="text-sm text-gray-600">
                                            {t('configuratorWizard.ledAddSpots', { qty: ledInfo.qty, price: LED_UNIT_PRICE_EUR.toFixed(2).replace('.', ',') })}
                                        </span>
                                        <span className="block text-sm text-[#FF7300] font-semibold mt-1">
                                            + € {ledInfo.total.toFixed(2).replace('.', ',')}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-sm text-amber-600 flex items-center gap-1 mt-1">
                                        <AlertTriangle size={14} />
                                        {t('configuratorWizard.ledNotAvailable')}
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
                                    setConfig(prev => ({ ...prev, [optionDef.key]: e.target.checked }));
                                }}
                            />
                            <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#003878] shadow-inner" />
                        </label>
                    </div>
                    {/* Warning if LED is ON but no mapping */}
                    {currentValue && !ledAvailable && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-700 text-sm">
                            <AlertTriangle size={16} />
                            {t('configuratorWizard.ledNotAvailableWarning')}
                        </div>
                    )}
                    {!currentStep.required && (
                        <p className="mt-4 text-sm text-gray-500 italic px-2">
                            {t('configurator.hints.optionalStep')}
                        </p>
                    )}
                </div>
            );
        }

        // Radio/Select selector (for walls, goot, voorzijde) - compact
        return (
            <div className="space-y-2">
                {optionDef.choices.map((choice: any) => {
                    // For voorzijde and zijwand options, calculate dynamic price based on actual product size
                    const needsDynamicPrice = optionDef.key === 'voorzijde' 
                        || optionDef.key === 'zijwand_links' 
                        || optionDef.key === 'zijwand_rechts';
                    const displayPrice = needsDynamicPrice
                        ? getDynamicSidePrice(optionDef.key, choice.value, productSize)
                        : choice.price;
                    
                    return (
                        <button
                            key={choice.value}
                            type="button"
                            onClick={() => setConfig(prev => ({ ...prev, [optionDef.key]: choice.value }))}
                            aria-pressed={currentValue === choice.value}
                            className={`relative w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                currentValue === choice.value 
                                    ? 'border-[#003878] bg-[#003878]/5 shadow-md ring-2 ring-[#003878]/10' 
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            }`}
                        >
                            {currentValue === choice.value && (
                                <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 bg-[#003878] rounded-full flex items-center justify-center text-white">
                                    <Check size={12} strokeWidth={3} />
                                </div>
                            )}
                            <span className={`block font-bold text-sm sm:text-base mb-0.5 pr-7 ${
                                currentValue === choice.value ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                                {choice.label}
                            </span>
                            {displayPrice > 0 && (
                                <span className="inline-block mt-1 text-xs sm:text-sm text-[#FF7300] font-semibold">+ {formatEUR(toCents(displayPrice), 'cents')}</span>
                            )}
                        </button>
                    );
                })}
            </div>
        );
    };

    // --- Montage Selector (Ja / Nee cards) ---
    const renderMontageSelector = () => {
        const montageValue = !!config.montage;

        const options = [
            {
                value: false,
                label: t('configuratorWizard.montageNo'),
                description: t('configuratorWizard.montageNoDesc'),
                icon: <Wrench size={28} />,
            },
            {
                value: true,
                label: t('configuratorWizard.montageYes'),
                description: t('configuratorWizard.montageYesDesc'),
                icon: <FileText size={28} />,
            },
        ];

        return (
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {options.map((opt) => {
                        const selected = montageValue === opt.value;
                        return (
                            <button
                                key={String(opt.value)}
                                type="button"
                                onClick={() => setConfig(prev => ({ ...prev, montage: opt.value }))}
                                aria-pressed={selected}
                                className={`relative text-left p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                    selected
                                        ? 'border-[#003878] bg-[#003878]/5 ring-2 ring-[#003878]/10 shadow-md'
                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                }`}
                            >
                                {selected && (
                                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 bg-[#003878] rounded-full flex items-center justify-center text-white">
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                )}
                                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-2 ${
                                    selected ? 'bg-[#FF7300] text-white' : 'bg-gray-100 text-gray-400'
                                }`}>
                                    {React.cloneElement(opt.icon as React.ReactElement, { size: 20 })}
                                </div>
                                <span className="block text-sm sm:text-base font-bold text-gray-900 mb-1 pr-6">{opt.label}</span>
                                <span className="block text-xs sm:text-sm text-gray-600 leading-relaxed">{opt.description}</span>
                            </button>
                        );
                    })}
                </div>

                {montageValue && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                        <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                            <p className="font-semibold mb-1">{t('configuratorWizard.montageNotice')}</p>
                            <p className="text-blue-700">
                                {t('configuratorWizard.montageNoticeText')}
                            </p>
                        </div>
                    </div>
                )}

                <p className="text-sm text-gray-500 italic px-2">
                    {t('configuratorWizard.montageOptionalNote')}
                </p>
            </div>
        );
    };

    const renderOverview = () => {
        const ledSummaryValue = config.verlichting
            ? (ledInfo.qty > 0
                ? t('configuratorWizard.ledYesSpots', { qty: ledInfo.qty, price: ledInfo.total.toFixed(2).replace('.', ',') })
                : t('configuratorWizard.ledNotAvailableFor', { width: widthCm }))
            : t('configurator.selection.no');
        
        // Step offset: when dimension step is present, config steps shift by 1
        const off = showDimensionStep ? 1 : 0;

        // Summary items in exact step order
        const summaryItems = [
            ...(showDimensionStep ? [{
                stepIndex: 0,
                label: t('configurator.steps.afmetingen.title', { defaultValue: 'Afmetingen' }),
                value: selectedWidth && selectedDepth ? `${selectedWidth} × ${selectedDepth} cm` : '—',
                key: 'afmetingen',
            }] : []),
            { stepIndex: 0 + off, label: t('configurator.steps.color.title'), value: getOptionLabel('color', config.color), key: 'color' },
            { stepIndex: 1 + off, label: t('configurator.steps.daktype.title'), value: getOptionLabel('daktype', config.daktype), key: 'daktype' },
            { stepIndex: 2 + off, label: t('configurator.steps.goot.title'), value: getOptionLabel('goot', config.goot), key: 'goot' },
            { stepIndex: 3 + off, label: t('configurator.steps.zijwand_links.title'), value: getOptionLabel('zijwand_links', config.zijwand_links), key: 'zijwand_links' },
            { stepIndex: 4 + off, label: t('configurator.steps.zijwand_rechts.title'), value: getOptionLabel('zijwand_rechts', config.zijwand_rechts), key: 'zijwand_rechts' },
            { stepIndex: 5 + off, label: t('configurator.steps.voorzijde.title'), value: getOptionLabel('voorzijde', config.voorzijde), key: 'voorzijde' },
            { stepIndex: 6 + off, label: t('configurator.steps.verlichting.title'), value: ledSummaryValue, key: 'verlichting' },
            { stepIndex: 7 + off, label: t('configuratorWizard.montageTitle'), value: config.montage ? t('configuratorWizard.montageOnQuote') : t('configurator.selection.no'), key: 'montage' },
        ];

        return (
            <div className="space-y-6 max-w-3xl">
                {/* Show reset message in edit mode if config was incomplete */}
                {mode === 'edit' && showResetMessage && (
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 flex items-start gap-3">
                        <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                            <Info size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-amber-800 text-lg">{t('configuratorWizard.configRestoredTitle')}</h4>
                            <p className="text-sm text-amber-700">{t('configuratorWizard.configRestoredDesc')}</p>
                        </div>
                    </div>
                )}

                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        <Check size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-green-800 text-lg">{t('configurator.overview.completeTitle')}</h4>
                        <p className="text-sm text-green-700">{t('configurator.overview.completeDescription')}</p>
                    </div>
                </div>

                {/* Configuration Summary */}
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
                                {t('configurator.navigation.edit')}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Price Breakdown */}
                <div className="bg-[#eff6ff] rounded-xl p-6 space-y-3">
                    <h4 className="font-bold text-gray-900 text-lg">{t('configurator.overview.priceOverview')}</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">{t('configurator.overview.basePrice')}</span>
                            <span className="font-semibold text-gray-900">{formatEUR(toCents(calcBasePrice), 'cents')}</span>
                        </div>
                        {priceItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                                <span className="text-gray-600">{item.label}</span>
                                <span className="font-semibold text-gray-900">+ {formatEUR(toCents(item.amount), 'cents')}</span>
                            </div>
                        ))}
                        <div className="border-t-2 border-gray-300 pt-3 mt-3 flex justify-between items-center">
                            <span className="font-bold text-gray-900 text-base">{t('configurator.overview.totalInclVat')}</span>
                            <span className="font-black text-2xl text-[#003878]">{formatEUR(toCents(displayTotal), 'cents')}</span>
                        </div>
                    </div>
                </div>

                {/* Agreement Checkbox */}
                <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-colors">
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-[#003878] focus:ring-[#003878] cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">
                        {t('configurator.overview.agreement')}
                    </span>
                </label>
            </div>
        );
    };

    const renderProgressIndicator = () => {
        const totalSteps = STEPS.length;
        const progressPercent = ((currentStepIndex) / (totalSteps - 1)) * 100;

        return (
            <div className="mb-6 sm:mb-8 space-y-2 sm:space-y-3">
                {/* Step text + progress bar */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--text)]">
                        {t('configurator.steps.stepOf', { current: currentStepIndex + 1, total: totalSteps, defaultValue: `Stap ${currentStepIndex + 1} van ${totalSteps}` })}
                    </span>
                    <span className="text-sm text-[var(--muted)]">{currentStep.title}</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[var(--accent,#003878)] rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                {/* Breadcrumb trail — step numbers on mobile, full names on sm+ */}
                <div className="flex flex-wrap gap-1 text-xs text-[var(--muted)]">
                    {STEPS.map((step, idx) => (
                        <React.Fragment key={step.id}>
                            <button
                                onClick={() => goToStep(idx)}
                                disabled={idx > currentStepIndex}
                                className={`transition-colors ${
                                    idx === currentStepIndex
                                        ? 'text-[var(--text)] font-bold'
                                        : idx < currentStepIndex
                                            ? 'text-[var(--accent,#003878)] hover:underline cursor-pointer'
                                            : 'text-[var(--muted)] cursor-not-allowed'
                                }`}
                            >
                                {/* Mobile: just the step number */}
                                <span className="sm:hidden">{idx + 1}</span>
                                {/* Desktop: full step name */}
                                <span className="hidden sm:inline">{step.title}</span>
                            </button>
                            {idx < STEPS.length - 1 && <span className="text-[var(--border-strong)]">›</span>}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    };

    // Count selected options for mobile button
    const selectionCount = useMemo(() => {
        let count = 0;
        if (config.color) count++;
        if (config.daktype) count++;
        if (config.goot) count++;
        if (config.zijwand_links && config.zijwand_links !== 'geen') count++;
        if (config.zijwand_rechts && config.zijwand_rechts !== 'geen') count++;
        if (config.voorzijde && config.voorzijde !== 'geen') count++;
        if (config.verlichting) count++;
        return count;
    }, [config]);

    // Selection items in step order - always show all options
    const selectionItems = useMemo(() => {
        const off = showDimensionStep ? 1 : 0;
        return [
        {
            key: 'color',
            label: t('configurator.steps.color.title'),
            value: config.color ? getOptionLabel('color', config.color) : null,
            stepIndex: 0 + off,
            colorHex: config.color ? COLOR_OPTIONS.find(c => c.id === config.color)?.hex : null,
        },
        {
            key: 'daktype',
            label: t('configurator.steps.daktype.title'),
            value: config.daktype ? getOptionLabel('daktype', config.daktype) : null,
            stepIndex: 1 + off,
        },
        {
            key: 'goot',
            label: t('configurator.steps.goot.title'),
            value: config.goot ? getOptionLabel('goot', config.goot) : null,
            stepIndex: 2 + off,
        },
        {
            key: 'zijwand_links',
            label: t('configurator.steps.zijwand_links.title'),
            value: config.zijwand_links ? getOptionLabel('zijwand_links', config.zijwand_links) : null,
            stepIndex: 3 + off,
        },
        {
            key: 'zijwand_rechts',
            label: t('configurator.steps.zijwand_rechts.title'),
            value: config.zijwand_rechts ? getOptionLabel('zijwand_rechts', config.zijwand_rechts) : null,
            stepIndex: 4 + off,
        },
        {
            key: 'voorzijde',
            label: t('configurator.steps.voorzijde.title'),
            value: config.voorzijde ? getOptionLabel('voorzijde', config.voorzijde) : null,
            stepIndex: 5 + off,
        },
        {
            key: 'verlichting',
            label: t('configurator.steps.verlichting.title'),
            value: config.verlichting !== undefined 
                ? (config.verlichting 
                    ? t('configuratorWizard.yesSpots', { qty: getLedTotals(widthCm).qty })
                    : t('configurator.selection.no'))
                : null,
            stepIndex: 6 + off,
        },
    ];
    }, [config, getOptionLabel, t, widthCm, showDimensionStep]);

    // Reusable Selection Summary Component - shows all options
    const SelectionSummary = ({ showEditButtons = true }: { showEditButtons?: boolean }) => (
        <div className="space-y-3">
            {selectionItems.map((item, idx) => (
                <div 
                    key={item.key} 
                    className={`flex justify-between items-center py-2 ${idx < selectionItems.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                    <div className="flex items-center gap-2">
                        {item.colorHex && (
                            <div 
                                className="w-5 h-5 rounded border border-gray-200 shadow-inner flex-shrink-0"
                                style={{ backgroundColor: item.colorHex }}
                            />
                        )}
                        <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</span>
                            <span className={`block text-sm font-semibold ${item.value ? 'text-gray-900' : 'text-gray-400'}`}>
                                {item.value || '—'}
                            </span>
                        </div>
                    </div>
                    {showEditButtons && item.value && (
                        <button 
                            onClick={() => { goToStep(item.stepIndex); setSelectionOpen(false); }} 
                            className="text-xs text-[#003878] font-medium hover:underline flex-shrink-0"
                        >
                            {t('configurator.navigation.change')}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );

    // Selection Modal/Sheet Component - works for both mobile (bottom sheet) and desktop (centered modal)
    const SelectionModal = () => (
        <AnimatePresence>
            {isSelectionOpen && (
                <>
                    {/* Backdrop */}
                    <MotionDiv
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[200]"
                        onClick={() => setSelectionOpen(false)}
                    />
                    
                    {/* Mobile: Bottom Sheet */}
                    <MotionDiv
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[201] max-h-[80vh] flex flex-col"
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-10 h-1 bg-gray-300 rounded-full" />
                        </div>
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 pb-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">{t('configurator.selection.title')}</h3>
                            <button
                                onClick={() => setSelectionOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-5 py-4">
                            <SelectionSummary showEditButtons={true} />
                        </div>
                    </MotionDiv>
                    
                    {/* Desktop: Centered Modal */}
                    <MotionDiv
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="hidden lg:flex fixed inset-0 z-[201] items-center justify-center p-6"
                    >
                        <div className="bg-white rounded-md shadow-sm max-w-lg w-full max-h-[80vh] flex flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">{t('configurator.selection.title')}</h3>
                                <button
                                    onClick={() => setSelectionOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            {/* Content */}
                            <div className="flex-1 overflow-y-auto px-6 py-4">
                                <SelectionSummary showEditButtons={true} />
                            </div>
                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-100">
                                <button
                                    onClick={() => setSelectionOpen(false)}
                                    className="w-full py-3 bg-[#003878] text-white font-semibold rounded-xl hover:bg-[#002050] transition-colors"
                                >
                                    {t('configurator.navigation.close')}
                                </button>
                            </div>
                        </div>
                    </MotionDiv>
                </>
            )}
        </AnimatePresence>
    );

    // Visualization Component with layer rendering
    const Visualization = ({ className = "" }: { className?: string }) => {
        const selectedColor = COLOR_OPTIONS.find(c => c.id === config.color);
        
        return (
            <div className={`bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl overflow-hidden ${className}`}>
                <div className="aspect-[16/10] relative flex items-center justify-center">
                    {/* Render stacked layers */}
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
                        /* Placeholder when no layers */
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                            <Eye size={40} className="text-gray-300 mb-3" />
                            <p className="text-sm text-gray-400 font-medium">{t('configurator.visualization.previewPlaceholder')}</p>
                        </div>
                    )}
                    
                    {/* Config badges */}
                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
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
                        {config.daktype && (
                            <span className="px-2.5 py-1 bg-[#003878] text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                                {config.daktype.replace('_', ' ')}
                            </span>
                        )}
                        {config.goot && (
                            <span className="px-2.5 py-1 bg-[#FF7300] text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                                {config.goot}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // ── INLINE LAYOUT ─────────────────────────────────────────────────
    if (isInline) {
        return (
            <div className="font-sans">
                {/* Info Modal (inline mode uses fixed overlay) */}
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
                                className="bg-white rounded-xl p-5 max-w-sm w-full shadow-sm"
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

                {/* Selection sheet (inline mode) */}
                <SelectionModal />

                {/* 2-column grid: Preview (left) | Config (right) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">

                    {/* LEFT — Preview/Visualization */}
                    <div className="lg:sticky lg:top-28 self-start">
                        <Visualization className="w-full rounded-xl overflow-hidden" />
                    </div>

                    {/* RIGHT — Configuration Panel */}
                    <div className="flex flex-col gap-3 lg:gap-4">
                        {/* Progress + Step title */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                            {renderProgressIndicator()}
                            <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-1">{currentStep.title}</h2>
                            <p className="text-sm text-gray-500 mb-4 lg:mb-6">{currentStep.description}</p>

                            <AnimatePresence mode="wait">
                                <MotionDiv
                                    key={currentStepIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {renderOptionSelector()}
                                </MotionDiv>
                            </AnimatePresence>
                        </div>

                        {/* Sticky CTA row */}
                        <div className="sticky bottom-0 z-30">
                            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                                {/* Price row — compact on mobile */}
                                <div className="flex items-center justify-between mb-3 sm:block">
                                    <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">{t('configurator.footer.totalPriceInclVat')}</span>
                                    <span className="text-xl sm:text-2xl font-black text-[#003878] sm:block">{formatEUR(toCents(displayTotal), 'cents')}</span>
                                </div>

                                {/* Navigation Buttons */}
                                <div className="flex items-center gap-2">
                                    {currentStepIndex > 0 && (
                                        <button
                                            onClick={handleBack}
                                            className="p-2.5 sm:p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                    )}

                                    {/* Selection Button — icon-only on mobile */}
                                    <button
                                        onClick={() => setSelectionOpen(true)}
                                        className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        <ShoppingBag size={18} className="text-[#003878]" />
                                        <span className="font-semibold text-sm hidden sm:inline">{t('configurator.selection.title')}</span>
                                        {selectionCount > 0 && (
                                            <span className="px-1.5 py-0.5 bg-[#003878] text-white text-[10px] font-bold rounded-full">
                                                {selectionCount}
                                            </span>
                                        )}
                                    </button>

                                    <div className="flex-1" />

                                    {!isLastStep ? (
                                        <button
                                            onClick={handleNext}
                                            disabled={!canProceed}
                                            className={`px-5 sm:px-6 py-3 sm:py-3.5 font-bold rounded-xl text-sm flex items-center gap-2 transition-all ${
                                                canProceed
                                                    ? 'bg-[#003878] text-white hover:bg-[#002050] shadow-sm shadow-[#003878]/20'
                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            {t('configurator.navigation.next')}
                                            <ChevronRight size={18} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={config.montage ? handleQuoteRequest : handleAddToCart}
                                            disabled={!agreed || isSubmitting}
                                            className={`px-5 sm:px-6 py-3 sm:py-3.5 font-bold rounded-xl text-sm flex items-center gap-2 transition-all ${
                                                agreed && !isSubmitting
                                                    ? 'bg-[#FF7300] text-white hover:bg-[#E66600] shadow-sm shadow-[#FF7300]/20'
                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    {mode === 'edit' ? t('configuratorWizard.saving') : t('configurator.navigation.adding')}
                                                </>
                                            ) : (
                                                <>
                                                    {config.montage
                                                        ? t('configuratorWizard.requestQuote')
                                                        : (mode === 'edit' ? t('configuratorWizard.saveLabel') : t('configurator.navigation.add'))
                                                    }
                                                    {config.montage ? <FileText size={18} /> : <ArrowRight size={18} />}
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* Trust badges — hidden on mobile to save space */}
                                <div className="hidden sm:flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                                    <DeliveryTime label={t('configurator.footer.deliveryTime')} iconSize={12} />
                                    <span className="flex items-center gap-1.5">
                                        <ShieldCheck size={12} /> {t('configurator.footer.warranty')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── MODAL LAYOUT (default) ────────────────────────────────────────
    return (
        <AnimatePresence>
            {isOpen && (
                <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-white lg:bg-black/40 lg:backdrop-blur-sm font-sans overflow-hidden"
                >
                    {/* Info Modal */}
                    <AnimatePresence>
                        {infoModal && (
                            <MotionDiv
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-[150] flex items-center justify-center p-4 bg-black/50"
                                onClick={() => setInfoModal(null)}
                            >
                                <MotionDiv
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.95, opacity: 0 }}
                                    className="bg-white rounded-xl p-5 max-w-sm w-full shadow-sm"
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

                    {/* Mobile Bottom Sheet */}
                    <SelectionModal />

                    {/* Main Container */}
                    <MotionDiv
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="h-full w-full lg:h-[95vh] lg:w-[95vw] lg:max-w-[1400px] lg:mx-auto lg:my-auto lg:rounded-md bg-white overflow-hidden flex flex-col lg:absolute lg:inset-0 lg:m-auto"
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeConfigurator}
                            className="absolute top-4 right-4 z-50 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
                        >
                            <X size={22} />
                        </button>

                        {/* ========== MOBILE LAYOUT (<1024px) ========== */}
                        <div className="lg:hidden flex-1 overflow-y-auto pb-32">
                            {/* Header with Title */}
                            <div className="px-5 pt-5 pb-4">
                                <h1 className="text-xl font-black text-[#003878] pr-10">{productTitle}</h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    {t('configurator.navigation.stepOf', { current: currentStepIndex + 1, total: STEPS.length })} — {currentStep.title}
                                </p>
                            </div>

                            {/* Visualization */}
                            <div className="px-5 mb-6">
                                <Visualization />
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gray-100 mx-5 mb-6" />

                            {/* Steps/Options */}
                            <div className="px-5">
                                {renderProgressIndicator()}
                                
                                <h2 className="text-xl font-bold text-gray-900 mb-1">{currentStep.title}</h2>
                                <p className="text-sm text-gray-500 mb-6">{currentStep.description}</p>
                                
                                <AnimatePresence mode="wait">
                                    <MotionDiv
                                        key={currentStepIndex}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {renderOptionSelector()}
                                    </MotionDiv>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* ========== DESKTOP LAYOUT (≥1024px) ========== */}
                        {/* 2-column grid: Preview (left) | Config (right) */}
                        <div className="hidden lg:grid lg:grid-cols-[1fr,420px] lg:gap-6 flex-1 min-h-0">
                            
                            {/* LEFT COLUMN - Preview/Visualization */}
                            <div className="flex flex-col p-6 pr-0 min-h-0">
                                {/* Product Title */}
                                <div className="mb-4 pr-12">
                                    <h1 className="text-2xl font-black text-[#003878]">{productTitle}</h1>
                                </div>
                                
                                {/* Visualization - fills available space */}
                                <div className="flex-1 min-h-0 flex items-center justify-center">
                                    <Visualization className="w-full h-full max-h-[calc(95vh-200px)]" />
                                </div>
                            </div>

                            {/* RIGHT COLUMN - Configuration Panel */}
                            <div className="flex flex-col min-h-0 border-l border-gray-100 bg-gray-50/50">
                                
                                {/* Sticky Header - Progress + Step Title */}
                                <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 pt-6 pb-4">
                                    {/* Step Progress */}
                                    {renderProgressIndicator()}
                                    
                                    {/* Step Title & Description */}
                                    <h2 className="text-xl font-bold text-gray-900 mt-4 mb-1">{currentStep.title}</h2>
                                    <p className="text-sm text-gray-500">{currentStep.description}</p>
                                </div>

                                {/* Scrollable Content - Options */}
                                <div className="flex-1 overflow-y-auto px-6 py-6">
                                    <AnimatePresence mode="wait">
                                        <MotionDiv
                                            key={currentStepIndex}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {renderOptionSelector()}
                                        </MotionDiv>
                                    </AnimatePresence>
                                </div>

                                {/* Sticky Footer - Price + Navigation */}
                                <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 px-6 py-4">
                                    {/* Price */}
                                    <div className="mb-4">
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">{t('configurator.footer.totalPriceInclVat')}</span>
                                        <span className="block text-2xl font-black text-[#003878]">{formatEUR(toCents(displayTotal), 'cents')}</span>
                                    </div>

                                    {/* Navigation Buttons */}
                                    <div className="flex items-center gap-2">
                                        {currentStepIndex > 0 && (
                                            <button
                                                onClick={handleBack}
                                                className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                                            >
                                                <ChevronLeft size={20} />
                                            </button>
                                        )}

                                        {/* Selection Button */}
                                        <button
                                            onClick={() => setSelectionOpen(true)}
                                            className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                                        >
                                            <ShoppingBag size={18} className="text-[#003878]" />
                                            <span className="font-semibold text-sm">{t('configurator.selection.title')}</span>
                                            {selectionCount > 0 && (
                                                <span className="px-1.5 py-0.5 bg-[#003878] text-white text-[10px] font-bold rounded-full">
                                                    {selectionCount}
                                                </span>
                                            )}
                                        </button>

                                        {/* Spacer */}
                                        <div className="flex-1" />

                                        {!isLastStep ? (
                                            <button
                                                onClick={handleNext}
                                                disabled={!canProceed}
                                                className={`px-5 py-3 font-bold rounded-xl text-sm flex items-center gap-2 transition-all ${
                                                    canProceed
                                                        ? 'bg-[#003878] text-white hover:bg-[#002050]'
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                {t('configurator.navigation.next')}
                                                <ChevronRight size={18} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={config.montage ? handleQuoteRequest : handleAddToCart}
                                                disabled={!agreed || isSubmitting}
                                                className={`px-5 py-3 font-bold rounded-xl text-sm flex items-center gap-2 transition-all ${
                                                    agreed && !isSubmitting
                                                        ? 'bg-[#FF7300] text-white hover:bg-[#E66600]'
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 size={18} className="animate-spin" />
                                                        {mode === 'edit' ? t('configuratorWizard.saving') : t('configurator.navigation.adding')}
                                                    </>
                                                ) : (
                                                    <>
                                                        {config.montage
                                                            ? t('configuratorWizard.requestQuote')
                                                            : (mode === 'edit' ? t('configuratorWizard.saveLabel') : t('configurator.navigation.add'))
                                                        }
                                                        {config.montage ? <FileText size={18} /> : <ArrowRight size={18} />}
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Info badges */}
                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                        <DeliveryTime label={t('configurator.footer.deliveryTime')} iconSize={12} />
                                        <span className="flex items-center gap-1.5">
                                            <ShieldCheck size={12} /> {t('configurator.footer.warranty')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ========== MOBILE FOOTER (only <1024px) ========== */}
                        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
                            {/* Mobile: Selection Button */}
                            <div className="px-5 py-3 border-b border-gray-100">
                                <button
                                    onClick={() => setSelectionOpen(true)}
                                    className="w-full flex items-center justify-between py-2.5 px-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag size={18} className="text-[#003878]" />
                                        <span className="font-semibold text-gray-900 text-sm">{t('configurator.selection.title')}</span>
                                        {selectionCount > 0 && (
                                            <span className="px-1.5 py-0.5 bg-[#003878] text-white text-[10px] font-bold rounded-full">
                                                {selectionCount}
                                            </span>
                                        )}
                                    </div>
                                    <ChevronUp size={18} className="text-gray-400" />
                                </button>
                            </div>

                            {/* Price + Navigation */}
                            <div className="px-5 py-4">
                                <div className="flex items-center justify-between gap-4">
                                    {/* Price */}
                                    <div>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">{t('configurator.footer.totalPriceInclVat')}</span>
                                        <span className="block text-2xl font-black text-[#003878]">{formatEUR(toCents(displayTotal), 'cents')}</span>
                                    </div>

                                    {/* Navigation Buttons */}
                                    <div className="flex items-center gap-2">
                                        {currentStepIndex > 0 && (
                                            <button
                                                onClick={handleBack}
                                                className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                                            >
                                                <ChevronLeft size={20} />
                                            </button>
                                        )}

                                        {!isLastStep ? (
                                            <button
                                                onClick={handleNext}
                                                disabled={!canProceed}
                                                className={`px-5 py-3 font-bold rounded-xl text-sm flex items-center gap-2 transition-all ${
                                                    canProceed
                                                        ? 'bg-[#003878] text-white hover:bg-[#002050]'
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                <span className="hidden sm:inline">{t('configurator.navigation.next')}</span>
                                                <ChevronRight size={18} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={config.montage ? handleQuoteRequest : handleAddToCart}
                                                disabled={!agreed || isSubmitting}
                                                className={`px-5 py-3 font-bold rounded-xl text-sm flex items-center gap-2 transition-all ${
                                                    agreed && !isSubmitting
                                                        ? 'bg-[#FF7300] text-white hover:bg-[#E66600]'
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 size={18} className="animate-spin" />
                                                        <span className="hidden sm:inline">{mode === 'edit' ? t('configuratorWizard.saving') : t('configurator.navigation.adding')}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="hidden sm:inline">
                                                            {config.montage
                                                                ? t('configuratorWizard.requestQuote')
                                                                : (mode === 'edit' ? t('configuratorWizard.saveLabel') : t('configurator.navigation.add'))
                                                            }
                                                        </span>
                                                        {config.montage ? <FileText size={18} /> : <ArrowRight size={18} />}
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </MotionDiv>
                </MotionDiv>
            )}
        </AnimatePresence>
    );
});

export default VerandaConfiguratorWizard;
