import React, { useState, forwardRef, useImperativeHandle, useMemo, useCallback, useEffect } from 'react';
import { X, Check, Info, ChevronLeft, ChevronRight, Truck, ShieldCheck, ArrowRight, Lightbulb, Edit2, Eye, ChevronUp, ShoppingBag, Loader2, AlertTriangle, Wrench, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VERANDA_OPTIONS_UI, DEFAULT_VERANDA_CONFIG, VerandaConfig, COLOR_OPTIONS, DEFAULT_COLOR } from '../src/configurator/schemas/veranda';
import { calcVerandaPrice, type VerandaProductSize } from '../src/configurator/pricing/veranda';
import { getOptionPrice, FRONT_SIDE_OPTIONS, SIDE_WALL_OPTIONS, type OptionChoice } from '../src/configurator/pricing/verandapricing';
import { buildVisualizationLayers, type VisualizationLayer, FALLBACK_IMAGE, type VerandaColorId, getPreloadPaths, preloadImages } from '../src/configurator/visual/verandaAssets';
import { t } from '../src/utils/i18n';
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
}

// --- Step Definitions ---
// Single source of truth for step order
type StepId = 'color' | 'daktype' | 'goot' | 'zijwand_links' | 'zijwand_rechts' | 'voorzijde' | 'verlichting' | 'montage' | 'overzicht';

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
const STEPS: StepDefinition[] = [
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
        title: 'Montage',
        description: 'Wilt u professionele montage bij uw veranda?',
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
const isStepComplete = (step: StepDefinition, config: Partial<VerandaConfig>): boolean => {
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
    ({ productTitle = "HETT Premium Veranda", basePrice = 1250, widthCm = 606, onSubmit, mode = 'new', showResetMessage = false, onCancel }, ref) => {
    
    const [isOpen, setIsOpen] = useState(false);
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
    const canProceed = isStepComplete(currentStep, config);
    const isLastStep = currentStepIndex === STEPS.length - 1;

    useImperativeHandle(ref, () => ({
        open: (initialConfig) => {
            setConfig(initialConfig ? { ...DEFAULT_VERANDA_CONFIG, ...initialConfig } : DEFAULT_VERANDA_CONFIG);
            setCurrentStepIndex(0);
            setAgreed(false);
            setDidSubmit(false); // Reset submit flag when opening
            setIsOpen(true);
            document.body.style.overflow = 'hidden';
        },
        close: () => closeConfigurator()
    }));

    const closeConfigurator = () => {
        setIsOpen(false);
        document.body.style.overflow = 'unset';
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

    // --- Renderers ---
    const renderOptionSelector = () => {
        if (currentStep.id === 'overzicht') {
            return renderOverview();
        }

        if (currentStep.id === 'montage') {
            return renderMontageSelector();
        }

        const optionDef = VERANDA_OPTIONS_UI.find(o => o.key === currentStep.optionKey);
        if (!optionDef) return null;

        const currentValue = config[currentStep.optionKey as keyof VerandaConfig];

        // Color selector (for kleur step)
        if (optionDef.type === 'color') {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
                    {optionDef.choices.map((choice: any) => (
                        <div
                            key={choice.value}
                            onClick={() => setConfig(prev => ({ ...prev, [optionDef.key]: choice.value }))}
                            className={`relative rounded-xl overflow-hidden cursor-pointer transition-all border-2 p-4 ${
                                currentValue === choice.value 
                                    ? 'border-[#003878] ring-2 ring-[#003878]/20 shadow-lg bg-[#003878]/5' 
                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
                            }`}
                        >
                            {currentValue === choice.value && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-[#003878] rounded-full flex items-center justify-center text-white shadow-sm">
                                    <Check size={14} strokeWidth={3} />
                                </div>
                            )}
                            
                            {/* Color swatch */}
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
        }

        // Card-based selector (for daktype) - TEXT-ONLY
        if (optionDef.type === 'card') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {optionDef.choices.map((choice: any) => (
                        <button
                            key={choice.value}
                            type="button"
                            onClick={() => setConfig(prev => ({ ...prev, [optionDef.key]: choice.value }))}
                            aria-pressed={currentValue === choice.value}
                            className={`relative text-left p-5 rounded-xl border-2 transition-all cursor-pointer min-h-[120px] ${
                                currentValue === choice.value 
                                    ? 'border-[#003878] bg-[#003878]/5 ring-2 ring-[#003878]/10 shadow-md' 
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            }`}
                        >
                            {currentValue === choice.value && (
                                <div className="absolute top-4 right-4 w-6 h-6 bg-[#003878] rounded-full flex items-center justify-center text-white">
                                    <Check size={14} strokeWidth={3} />
                                </div>
                            )}
                            <span className="block text-base font-bold text-gray-900 mb-2 pr-8">{choice.label}</span>
                            <span className="block text-sm text-gray-600 leading-relaxed">{choice.description}</span>
                            {choice.price > 0 && (
                                <span className="inline-block mt-3 bg-[#FF7300]/10 text-[#FF7300] text-sm font-bold px-3 py-1 rounded-full">
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
            console.log(`[LED UI] widthCm=${widthCm}`);
            console.log(`[LED UI] qty=${ledInfo.qty}`);
            console.log(`[LED UI] total=${ledInfo.total.toFixed(2)}`);
            console.log(`[LED UI] enabled=${!!currentValue}`);
            
            return (
                <div className="max-w-2xl">
                    <div
                        onClick={() => {
                            setConfig(prev => ({ ...prev, [optionDef.key]: !currentValue }));
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
                                        LED is voor deze breedte niet beschikbaar. (+ € 0,00)
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
                            LED is voor deze breedte niet beschikbaar en wordt niet toegevoegd.
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

        // Radio/Select selector (for walls, goot, voorzijde) - TEXT-ONLY
        return (
            <div className="space-y-3 max-w-2xl">
                {optionDef.choices.map((choice: any) => {
                    // For voorzijde and zijwand options, calculate dynamic price based on actual product size
                    // This ensures glass sliding wall prices reflect the actual width/depth
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
                            className={`relative w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                currentValue === choice.value 
                                    ? 'border-[#003878] bg-[#003878]/5 shadow-md ring-2 ring-[#003878]/10' 
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            }`}
                        >
                            {currentValue === choice.value && (
                                <div className="absolute top-4 right-4 w-6 h-6 bg-[#003878] rounded-full flex items-center justify-center text-white">
                                    <Check size={14} strokeWidth={3} />
                                </div>
                            )}
                            <span className={`block font-bold text-base mb-1 pr-8 ${
                                currentValue === choice.value ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                                {choice.label}
                            </span>
                            <span className="block text-sm text-gray-600">{choice.description}</span>
                            {displayPrice > 0 && (
                                <span className="inline-block mt-2 text-sm text-[#FF7300] font-semibold">+ {formatEUR(toCents(displayPrice), 'cents')}</span>
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
                label: 'Nee, zelf monteren',
                description: 'U monteert de veranda zelf of schakelt een eigen monteur in.',
                icon: <Wrench size={28} />,
            },
            {
                value: true,
                label: 'Ja, montage gewenst',
                description: 'U ontvangt een persoonlijke montage-offerte op basis van uw situatie.',
                icon: <FileText size={28} />,
            },
        ];

        return (
            <div className="max-w-2xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {options.map((opt) => {
                        const selected = montageValue === opt.value;
                        return (
                            <button
                                key={String(opt.value)}
                                type="button"
                                onClick={() => setConfig(prev => ({ ...prev, montage: opt.value }))}
                                aria-pressed={selected}
                                className={`relative text-left p-5 rounded-xl border-2 transition-all cursor-pointer min-h-[140px] ${
                                    selected
                                        ? 'border-[#003878] bg-[#003878]/5 ring-2 ring-[#003878]/10 shadow-md'
                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                }`}
                            >
                                {selected && (
                                    <div className="absolute top-4 right-4 w-6 h-6 bg-[#003878] rounded-full flex items-center justify-center text-white">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                )}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                                    selected ? 'bg-[#FF7300] text-white' : 'bg-gray-100 text-gray-400'
                                }`}>
                                    {opt.icon}
                                </div>
                                <span className="block text-base font-bold text-gray-900 mb-2 pr-8">{opt.label}</span>
                                <span className="block text-sm text-gray-600 leading-relaxed">{opt.description}</span>
                            </button>
                        );
                    })}
                </div>

                {montageValue && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                        <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                            <p className="font-semibold mb-1">Let op: Uw bestelling gaat via een offerte</p>
                            <p className="text-blue-700">
                                Wanneer u montage selecteert, wordt uw configuratie niet direct aan de winkelwagen
                                toegevoegd. In plaats daarvan ontvangt u een persoonlijke offerte inclusief montagekosten.
                            </p>
                        </div>
                    </div>
                )}

                <p className="text-sm text-gray-500 italic px-2">
                    Montage is optioneel. De montagekosten worden apart geoffreerd.
                </p>
            </div>
        );
    };

    const renderOverview = () => {
        const ledSummaryValue = config.verlichting
            ? (ledInfo.qty > 0
                ? `Ja, ${ledInfo.qty} LED spots (€ ${ledInfo.total.toFixed(2).replace('.', ',')})`
                : `Ja (niet beschikbaar voor ${widthCm} cm)`)
            : t('configurator.selection.no');
        
        // Summary items in exact step order
        const summaryItems = [
            { stepIndex: 0, label: t('configurator.steps.color.title'), value: getOptionLabel('color', config.color), key: 'color' },
            { stepIndex: 1, label: t('configurator.steps.daktype.title'), value: getOptionLabel('daktype', config.daktype), key: 'daktype' },
            { stepIndex: 2, label: t('configurator.steps.goot.title'), value: getOptionLabel('goot', config.goot), key: 'goot' },
            { stepIndex: 3, label: t('configurator.steps.zijwand_links.title'), value: getOptionLabel('zijwand_links', config.zijwand_links), key: 'zijwand_links' },
            { stepIndex: 4, label: t('configurator.steps.zijwand_rechts.title'), value: getOptionLabel('zijwand_rechts', config.zijwand_rechts), key: 'zijwand_rechts' },
            { stepIndex: 5, label: t('configurator.steps.voorzijde.title'), value: getOptionLabel('voorzijde', config.voorzijde), key: 'voorzijde' },
            { stepIndex: 6, label: t('configurator.steps.verlichting.title'), value: ledSummaryValue, key: 'verlichting' },
            { stepIndex: 7, label: 'Montage', value: config.montage ? 'Ja (op offerte)' : 'Nee', key: 'montage' },
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
                            <h4 className="font-bold text-amber-800 text-lg">Configuratie hersteld</h4>
                            <p className="text-sm text-amber-700">De vorige configuratie was onvolledig. Standaardwaarden zijn ingesteld.</p>
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

    const renderProgressIndicator = () => (
        <div className="flex items-center gap-1.5 mb-8">
            {STEPS.map((step, idx) => (
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
                    {idx < STEPS.length - 1 && (
                        <div className={`h-0.5 w-4 lg:w-6 flex-shrink-0 transition-colors ${
                            idx < currentStepIndex ? 'bg-[#003878]/30' : 'bg-gray-200'
                        }`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

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
    const selectionItems = useMemo(() => [
        {
            key: 'color',
            label: t('configurator.steps.color.title'),
            value: config.color ? getOptionLabel('color', config.color) : null,
            stepIndex: 0,
            colorHex: config.color ? COLOR_OPTIONS.find(c => c.id === config.color)?.hex : null,
        },
        {
            key: 'daktype',
            label: t('configurator.steps.daktype.title'),
            value: config.daktype ? getOptionLabel('daktype', config.daktype) : null,
            stepIndex: 1,
        },
        {
            key: 'goot',
            label: t('configurator.steps.goot.title'),
            value: config.goot ? getOptionLabel('goot', config.goot) : null,
            stepIndex: 2,
        },
        {
            key: 'zijwand_links',
            label: t('configurator.steps.zijwand_links.title'),
            value: config.zijwand_links ? getOptionLabel('zijwand_links', config.zijwand_links) : null,
            stepIndex: 3,
        },
        {
            key: 'zijwand_rechts',
            label: t('configurator.steps.zijwand_rechts.title'),
            value: config.zijwand_rechts ? getOptionLabel('zijwand_rechts', config.zijwand_rechts) : null,
            stepIndex: 4,
        },
        {
            key: 'voorzijde',
            label: t('configurator.steps.voorzijde.title'),
            value: config.voorzijde ? getOptionLabel('voorzijde', config.voorzijde) : null,
            stepIndex: 5,
        },
        {
            key: 'verlichting',
            label: t('configurator.steps.verlichting.title'),
            value: config.verlichting !== undefined 
                ? (config.verlichting 
                    ? `Ja, ${getLedTotals(widthCm).qty} spots`
                    : t('configurator.selection.no'))
                : null,
            stepIndex: 6,
        },
    ], [config, getOptionLabel, t, widthCm]);

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
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col">
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

                    {/* Mobile Bottom Sheet */}
                    <SelectionModal />

                    {/* Main Container */}
                    <MotionDiv
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="h-full w-full lg:h-[95vh] lg:w-[95vw] lg:max-w-[1400px] lg:mx-auto lg:my-auto lg:rounded-2xl bg-white overflow-hidden flex flex-col lg:absolute lg:inset-0 lg:m-auto"
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
                                                        {mode === 'edit' ? 'Opslaan...' : t('configurator.navigation.adding')}
                                                    </>
                                                ) : (
                                                    <>
                                                        {config.montage
                                                            ? 'Vraag offerte aan'
                                                            : (mode === 'edit' ? 'Opslaan' : t('configurator.navigation.add'))
                                                        }
                                                        {config.montage ? <FileText size={18} /> : <ArrowRight size={18} />}
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Info badges */}
                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                            <Truck size={12} /> {t('configurator.footer.deliveryTime')}
                                        </span>
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
                                                        <span className="hidden sm:inline">{mode === 'edit' ? 'Opslaan...' : t('configurator.navigation.adding')}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="hidden sm:inline">
                                                            {config.montage
                                                                ? 'Vraag offerte aan'
                                                                : (mode === 'edit' ? 'Opslaan' : t('configurator.navigation.add'))
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
