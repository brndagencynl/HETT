import React, { useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { X, Check, Info, ChevronLeft, ChevronRight, Truck, ShieldCheck, ArrowRight, Lightbulb, Edit2, Eye, ChevronUp, ShoppingBag, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VERANDA_OPTIONS_UI, DEFAULT_VERANDA_CONFIG, VerandaConfig } from '../src/configurator/schemas/veranda';
import { calcVerandaPrice } from '../src/configurator/pricing/veranda';
import { getVerandaLayers } from '../src/configurator/visual/verandaLayers';

const MotionDiv = motion.div as any;

// --- Types ---
export interface VerandaConfiguratorWizardRef {
    open: (initialConfig?: Partial<VerandaConfig>) => void;
    close: () => void;
}

interface VerandaConfiguratorWizardProps {
    productTitle?: string;
    basePrice?: number;
    onSubmit?: (config: VerandaConfig, mode: 'order' | 'quote', price: number, details: { label: string, value: string }[]) => void;
}

// --- Step Definitions ---
type StepId = 'daktype' | 'voorzijde' | 'zijwand_links' | 'zijwand_rechts' | 'goot' | 'verlichting' | 'overzicht';

interface StepDefinition {
    id: StepId;
    title: string;
    description: string;
    optionKey?: keyof VerandaConfig;
    required: boolean;
}

const STEPS: StepDefinition[] = [
    { 
        id: 'daktype', 
        title: 'Daktype', 
        description: 'Kies het materiaal voor uw overkapping',
        optionKey: 'daktype',
        required: true 
    },
    { 
        id: 'goot', 
        title: 'Goot', 
        description: 'Selecteer uw gootsysteem',
        optionKey: 'goot',
        required: true 
    },
    { 
        id: 'voorzijde', 
        title: 'Voorzijde', 
        description: 'Wilt u de voorzijde afsluiten?',
        optionKey: 'voorzijde',
        required: false 
    },
    { 
        id: 'zijwand_links', 
        title: 'Zijwand links', 
        description: 'Kies de afwerking voor de linker zijde',
        optionKey: 'zijwand_links',
        required: false 
    },
    { 
        id: 'zijwand_rechts', 
        title: 'Zijwand rechts', 
        description: 'Kies de afwerking voor de rechter zijde',
        optionKey: 'zijwand_rechts',
        required: false 
    },
    { 
        id: 'verlichting', 
        title: "Extra's", 
        description: 'Verlichting toevoegen aan uw veranda',
        optionKey: 'verlichting',
        required: false 
    },
    { 
        id: 'overzicht', 
        title: 'Overzicht', 
        description: 'Controleer uw configuratie',
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

const VerandaConfiguratorWizard = forwardRef<VerandaConfiguratorWizardRef, VerandaConfiguratorWizardProps>(
    ({ productTitle = "HETT Premium Veranda", basePrice = 1250, onSubmit }, ref) => {
    
    const [isOpen, setIsOpen] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [config, setConfig] = useState<Partial<VerandaConfig>>(DEFAULT_VERANDA_CONFIG);
    const [infoModal, setInfoModal] = useState<{ title: string, text: string } | null>(null);
    const [agreed, setAgreed] = useState(false);
    const [isSelectionOpen, setSelectionOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for add-to-cart

    // Price calculation
    const { total: currentPrice, items: priceItems, basePrice: calcBasePrice } = calcVerandaPrice(basePrice, config as VerandaConfig);

    // Visual layers (for future rendering)
    const layers = useMemo(() => {
        return config.daktype ? getVerandaLayers(config as VerandaConfig) : [];
    }, [config]);

    const currentStep = STEPS[currentStepIndex];
    const canProceed = isStepComplete(currentStep, config);
    const isLastStep = currentStepIndex === STEPS.length - 1;

    useImperativeHandle(ref, () => ({
        open: (initialConfig) => {
            setConfig(initialConfig ? { ...DEFAULT_VERANDA_CONFIG, ...initialConfig } : DEFAULT_VERANDA_CONFIG);
            setCurrentStepIndex(0);
            setAgreed(false);
            setIsOpen(true);
            document.body.style.overflow = 'hidden';
        },
        close: () => closeConfigurator()
    }));

    const closeConfigurator = () => {
        setIsOpen(false);
        document.body.style.overflow = 'unset';
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
        
        // Validation
        if (!config.daktype || !config.goot) {
            alert('Vul alle verplichte velden in');
            return;
        }

        setIsSubmitting(true);

        try {
            if (onSubmit) {
                const details = Object.keys(config).map(key => ({
                    label: VERANDA_OPTIONS_UI.find(f => f.key === key)?.label || key,
                    value: getOptionLabel(key, config[key as keyof VerandaConfig])
                }));
                
                // Call parent handler which adds to cart
                // Cart drawer will open automatically via CartContext.addToCart
                onSubmit(config as VerandaConfig, 'order', currentPrice, details);
            }
            
            // Close configurator after successful add-to-cart
            // User stays on PDP, cart drawer opens via CartContext
            closeConfigurator();
        } catch (error) {
            // If add-to-cart fails, keep configurator open and show error
            console.error('Add to cart failed:', error);
            alert('Er is een fout opgetreden. Probeer het opnieuw.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle quote request (separate from add-to-cart)
    const handleQuoteRequest = () => {
        if (!config.daktype || !config.goot) {
            alert('Vul alle verplichte velden in');
            return;
        }

        if (onSubmit) {
            const details = Object.keys(config).map(key => ({
                label: VERANDA_OPTIONS_UI.find(f => f.key === key)?.label || key,
                value: getOptionLabel(key, config[key as keyof VerandaConfig])
            }));
            onSubmit(config as VerandaConfig, 'quote', currentPrice, details);
        }
        
        closeConfigurator();
    };

    const getOptionLabel = (key: string, value: any): string => {
        if (value === undefined || value === null) return 'Geen';
        if (typeof value === 'boolean') return value ? 'Ja' : 'Nee';
        
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

        const optionDef = VERANDA_OPTIONS_UI.find(o => o.key === currentStep.optionKey);
        if (!optionDef) return null;

        const currentValue = config[currentStep.optionKey as keyof VerandaConfig];

        // Card-based selector (for daktype)
        if (optionDef.type === 'card') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {optionDef.choices.map((choice: any) => (
                        <div
                            key={choice.value}
                            onClick={() => setConfig(prev => ({ ...prev, [optionDef.key]: choice.value }))}
                            className={`relative rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${
                                currentValue === choice.value 
                                    ? 'border-[#003878] ring-2 ring-[#003878]/20 shadow-lg' 
                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                            }`}
                        >
                            {currentValue === choice.value && (
                                <div className="absolute top-3 left-3 z-10 w-8 h-8 bg-[#003878] rounded-full flex items-center justify-center text-white shadow-md">
                                    <Check size={18} strokeWidth={3} />
                                </div>
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); setInfoModal({ title: choice.label, text: choice.description }) }}
                                className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-[#003878] shadow-sm transition-colors"
                            >
                                <Info size={16} />
                            </button>
                            <div className="aspect-[4/3] bg-gray-100">
                                <img src={choice.image} alt={choice.label} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-4 bg-white">
                                <span className="block text-base font-bold text-gray-900 mb-1">{choice.label}</span>
                                <span className="text-sm text-gray-600">{choice.description}</span>
                                {choice.price > 0 && (
                                    <span className="inline-block mt-2 bg-[#FF7300]/10 text-[#FF7300] text-sm font-bold px-3 py-1 rounded-full">
                                        + €{choice.price},-
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        // Toggle selector (for verlichting)
        if (optionDef.type === 'toggle') {
            const choice = optionDef.choices[0];
            return (
                <div className="max-w-2xl">
                    <div
                        onClick={() => setConfig(prev => ({ ...prev, [optionDef.key]: !currentValue }))}
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
                                <span className="font-bold text-gray-900 text-lg block">{choice.label}</span>
                                <span className="text-sm text-gray-600">{choice.description}</span>
                                {choice.price > 0 && (
                                    <span className="block text-sm text-[#FF7300] font-semibold mt-1">+ €{choice.price},-</span>
                                )}
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer" onClick={e => e.stopPropagation()}>
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={!!currentValue}
                                onChange={(e) => setConfig(prev => ({ ...prev, [optionDef.key]: e.target.checked }))}
                            />
                            <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#003878] shadow-inner"></div>
                        </label>
                    </div>
                    {!currentStep.required && (
                        <p className="mt-4 text-sm text-gray-500 italic px-2">
                            Deze stap is optioneel. Klik op "Verdergaan" om door te gaan zonder selectie.
                        </p>
                    )}
                </div>
            );
        }

        // Radio/Select selector (for walls, goot, voorzijde)
        return (
            <div className="space-y-3 max-w-2xl">
                {optionDef.choices.map((choice: any) => (
                    <div
                        key={choice.value}
                        onClick={() => setConfig(prev => ({ ...prev, [optionDef.key]: choice.value }))}
                        className={`flex items-start p-4 rounded-xl border-2 transition-all cursor-pointer group ${
                            currentValue === choice.value 
                                ? 'border-[#003878] bg-[#003878]/5 shadow-md ring-2 ring-[#003878]/10' 
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${
                            currentValue === choice.value 
                                ? 'bg-[#003878] text-white' 
                                : 'bg-gray-100 text-gray-400 group-hover:text-gray-600'
                        }`}>
                            {currentValue === choice.value ? <Check size={22} /> : <Eye size={22} />}
                        </div>
                        <div className="flex-grow">
                            <span className={`block font-bold text-base mb-1 ${
                                currentValue === choice.value ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                                {choice.label}
                            </span>
                            <span className="text-sm text-gray-600">{choice.description}</span>
                            {choice.price > 0 && (
                                <span className="block text-sm text-[#FF7300] font-semibold mt-1">+ €{choice.price},-</span>
                            )}
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setInfoModal({ title: choice.label, text: choice.description }) }}
                            className="p-2 text-gray-300 hover:text-[#003878] transition-colors ml-2"
                        >
                            <Info size={18} />
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    const renderOverview = () => {
        const summaryItems = [
            { stepIndex: 0, label: 'Daktype', value: getOptionLabel('daktype', config.daktype), key: 'daktype' },
            { stepIndex: 1, label: 'Goot', value: getOptionLabel('goot', config.goot), key: 'goot' },
            { stepIndex: 2, label: 'Voorzijde', value: getOptionLabel('voorzijde', config.voorzijde), key: 'voorzijde' },
            { stepIndex: 3, label: 'Zijwand links', value: getOptionLabel('zijwand_links', config.zijwand_links), key: 'zijwand_links' },
            { stepIndex: 4, label: 'Zijwand rechts', value: getOptionLabel('zijwand_rechts', config.zijwand_rechts), key: 'zijwand_rechts' },
            { stepIndex: 5, label: 'Verlichting', value: config.verlichting ? 'Ja (LED spots)' : 'Nee', key: 'verlichting' },
        ];

        return (
            <div className="space-y-6 max-w-3xl">
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        <Check size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-green-800 text-lg">Configuratie compleet!</h4>
                        <p className="text-sm text-green-700">Controleer hieronder uw gekozen opties en rond uw bestelling af.</p>
                    </div>
                </div>

                {/* Configuration Summary */}
                <div className="bg-white rounded-xl border-2 border-gray-200 divide-y divide-gray-100 overflow-hidden shadow-sm">
                    {summaryItems.map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 hover:bg-[#EDF0F2] transition-colors">
                            <div>
                                <span className="text-sm text-gray-500 font-medium">{item.label}</span>
                                <span className="block font-bold text-gray-900 text-base">{item.value}</span>
                            </div>
                            <button
                                onClick={() => goToStep(item.stepIndex)}
                                className="flex items-center gap-1.5 text-[#003878] hover:text-[#002050] font-semibold text-sm transition-colors"
                            >
                                <Edit2 size={14} />
                                Bewerk
                            </button>
                        </div>
                    ))}
                </div>

                {/* Price Breakdown */}
                <div className="bg-[#EDF0F2] rounded-xl p-6 space-y-3">
                    <h4 className="font-bold text-gray-900 text-lg">Prijsoverzicht</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Basisprijs veranda</span>
                            <span className="font-semibold text-gray-900">€ {calcBasePrice.toLocaleString()},-</span>
                        </div>
                        {priceItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                                <span className="text-gray-600">{item.label}</span>
                                <span className="font-semibold text-gray-900">+ € {item.amount.toLocaleString()},-</span>
                            </div>
                        ))}
                        <div className="border-t-2 border-gray-300 pt-3 mt-3 flex justify-between items-center">
                            <span className="font-bold text-gray-900 text-base">Totaal (incl. BTW)</span>
                            <span className="font-black text-2xl text-[#003878]">€ {currentPrice.toLocaleString()},-</span>
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
                        Ik heb de configuratie gecontroleerd en ga akkoord met de getoonde opties en prijs.
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
        if (config.daktype) count++;
        if (config.goot) count++;
        if (config.voorzijde && config.voorzijde !== 'geen') count++;
        if (config.zijwand_links && config.zijwand_links !== 'geen') count++;
        if (config.zijwand_rechts && config.zijwand_rechts !== 'geen') count++;
        if (config.verlichting) count++;
        return count;
    }, [config]);

    // Reusable Selection Summary Component
    const SelectionSummary = ({ showEditButtons = true }: { showEditButtons?: boolean }) => (
        <div className="space-y-3">
            {config.daktype && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Daktype</span>
                        <span className="block text-sm font-semibold text-gray-900">{getOptionLabel('daktype', config.daktype)}</span>
                    </div>
                    {showEditButtons && (
                        <button onClick={() => { goToStep(0); setSelectionOpen(false); }} className="text-xs text-[#003878] font-medium hover:underline">
                            Wijzig
                        </button>
                    )}
                </div>
            )}
            {config.goot && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Goot</span>
                        <span className="block text-sm font-semibold text-gray-900">{getOptionLabel('goot', config.goot)}</span>
                    </div>
                    {showEditButtons && (
                        <button onClick={() => { goToStep(1); setSelectionOpen(false); }} className="text-xs text-[#003878] font-medium hover:underline">
                            Wijzig
                        </button>
                    )}
                </div>
            )}
            {config.voorzijde && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Voorzijde</span>
                        <span className="block text-sm font-semibold text-gray-900">{getOptionLabel('voorzijde', config.voorzijde)}</span>
                    </div>
                    {showEditButtons && (
                        <button onClick={() => { goToStep(2); setSelectionOpen(false); }} className="text-xs text-[#003878] font-medium hover:underline">
                            Wijzig
                        </button>
                    )}
                </div>
            )}
            {config.zijwand_links && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Zijwand links</span>
                        <span className="block text-sm font-semibold text-gray-900">{getOptionLabel('zijwand_links', config.zijwand_links)}</span>
                    </div>
                    {showEditButtons && (
                        <button onClick={() => { goToStep(3); setSelectionOpen(false); }} className="text-xs text-[#003878] font-medium hover:underline">
                            Wijzig
                        </button>
                    )}
                </div>
            )}
            {config.zijwand_rechts && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Zijwand rechts</span>
                        <span className="block text-sm font-semibold text-gray-900">{getOptionLabel('zijwand_rechts', config.zijwand_rechts)}</span>
                    </div>
                    {showEditButtons && (
                        <button onClick={() => { goToStep(4); setSelectionOpen(false); }} className="text-xs text-[#003878] font-medium hover:underline">
                            Wijzig
                        </button>
                    )}
                </div>
            )}
            <div className="flex justify-between items-center py-2">
                <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Verlichting</span>
                    <span className="block text-sm font-semibold text-gray-900">{config.verlichting ? 'Ja (LED spots)' : 'Nee'}</span>
                </div>
                {showEditButtons && (
                    <button onClick={() => { goToStep(5); setSelectionOpen(false); }} className="text-xs text-[#003878] font-medium hover:underline">
                        Wijzig
                    </button>
                )}
            </div>
        </div>
    );

    // Mobile Bottom Sheet Component
    const BottomSheet = () => (
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
                    {/* Sheet */}
                    <MotionDiv
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[201] max-h-[80vh] flex flex-col"
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-10 h-1 bg-gray-300 rounded-full" />
                        </div>
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 pb-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Uw selectie</h3>
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
                </>
            )}
        </AnimatePresence>
    );

    // Visualization Component
    const Visualization = ({ className = "" }: { className?: string }) => (
        <div className={`bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl overflow-hidden ${className}`}>
            <div className="aspect-[16/9] lg:aspect-[21/9] relative flex items-center justify-center">
                {/* Placeholder for future overlay rendering */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <Eye size={40} className="text-gray-300 mb-3" />
                    <p className="text-sm text-gray-400 font-medium">Preview visualisatie</p>
                </div>
                {/* Config badges */}
                {(config.daktype || config.goot) && (
                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
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
                )}
            </div>
        </div>
    );

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
                    <BottomSheet />

                    {/* Main Container */}
                    <MotionDiv
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="h-full w-full lg:h-[95vh] lg:w-[95vw] lg:max-w-[1200px] lg:mx-auto lg:my-auto lg:rounded-2xl bg-white overflow-hidden flex flex-col lg:absolute lg:inset-0 lg:m-auto"
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeConfigurator}
                            className="absolute top-4 right-4 z-50 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
                        >
                            <X size={22} />
                        </button>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto pb-32 lg:pb-24">
                            
                            {/* Header with Title */}
                            <div className="px-5 pt-5 pb-4 lg:px-8 lg:pt-6">
                                <h1 className="text-xl lg:text-2xl font-black text-[#003878] pr-10">{productTitle}</h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Stap {currentStepIndex + 1} van {STEPS.length} — {currentStep.title}
                                </p>
                            </div>

                            {/* Visualization - Always visible */}
                            <div className="px-5 lg:px-8 mb-6">
                                <Visualization />
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gray-100 mx-5 lg:mx-8 mb-6" />

                            {/* Main Content Grid */}
                            <div className="px-5 lg:px-8">
                                <div className="lg:grid lg:grid-cols-[1fr,320px] lg:gap-8">
                                    
                                    {/* Left Column - Steps/Options */}
                                    <div>
                                        {renderProgressIndicator()}
                                        
                                        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{currentStep.title}</h2>
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

                                    {/* Right Column - Selection Summary (Desktop only) */}
                                    <div className="hidden lg:block">
                                        <div className="sticky top-4">
                                            <div className="bg-gray-50 rounded-xl p-5">
                                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Uw selectie</h3>
                                                <SelectionSummary showEditButtons={false} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer - Fixed */}
                        <div className="fixed lg:absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
                            {/* Mobile: Selection Button */}
                            <div className="lg:hidden px-5 py-3 border-b border-gray-100">
                                <button
                                    onClick={() => setSelectionOpen(true)}
                                    className="w-full flex items-center justify-between py-2.5 px-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag size={18} className="text-[#003878]" />
                                        <span className="font-semibold text-gray-900 text-sm">Uw selectie</span>
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
                            <div className="px-5 py-4 lg:px-8">
                                <div className="flex items-center justify-between gap-4">
                                    {/* Price */}
                                    <div>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">Totaalprijs incl. BTW</span>
                                        <span className="block text-2xl lg:text-3xl font-black text-[#003878]">€ {currentPrice.toLocaleString()},-</span>
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
                                                <span className="hidden sm:inline">Verdergaan</span>
                                                <ChevronRight size={18} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleAddToCart}
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
                                                        <span className="hidden sm:inline">Toevoegen...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="hidden sm:inline">Toevoegen</span>
                                                        <ArrowRight size={18} />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Desktop Info badges */}
                                <div className="hidden lg:flex items-center gap-4 mt-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1.5">
                                        <Truck size={12} /> 1-2 weken levertijd
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <ShieldCheck size={12} /> 10 jaar garantie
                                    </span>
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
