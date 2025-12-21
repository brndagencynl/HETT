import React, { useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { X, Check, Info, ChevronLeft, ChevronRight, Truck, ShieldCheck, ArrowRight, Lightbulb, Edit2, Eye } from 'lucide-react';
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

    const handleAddToCart = () => {
        // Validation
        if (!config.daktype || !config.goot) {
            alert('Vul alle verplichte velden in');
            return;
        }

        if (onSubmit) {
            const details = Object.keys(config).map(key => ({
                label: VERANDA_OPTIONS_UI.find(f => f.key === key)?.label || key,
                value: getOptionLabel(key, config[key as keyof VerandaConfig])
            }));
            onSubmit(config as VerandaConfig, 'order', currentPrice, details);
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
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {STEPS.map((step, idx) => (
                <React.Fragment key={step.id}>
                    <button
                        onClick={() => goToStep(idx)}
                        disabled={idx > currentStepIndex}
                        className={`flex-shrink-0 min-w-[32px] h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                            idx === currentStepIndex 
                                ? 'bg-[#003878] text-white shadow-md scale-110 px-3' 
                                : idx < currentStepIndex 
                                    ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600' 
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        title={step.title}
                    >
                        {idx < currentStepIndex ? <Check size={16} /> : idx + 1}
                    </button>
                    {idx < STEPS.length - 1 && (
                        <div className={`h-0.5 w-8 flex-shrink-0 transition-colors ${
                            idx < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    const renderSummarySidebar = () => (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-5 space-y-4 shadow-sm sticky top-4">
            <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Eye size={18} className="text-[#003878]" />
                Uw selectie
            </h4>
            <div className="space-y-2.5 text-sm">
                {config.daktype && (
                    <div className="flex justify-between items-start">
                        <span className="text-gray-600">Daktype</span>
                        <span className="font-semibold text-gray-900 text-right">{getOptionLabel('daktype', config.daktype)}</span>
                    </div>
                )}
                {config.goot && (
                    <div className="flex justify-between items-start">
                        <span className="text-gray-600">Goot</span>
                        <span className="font-semibold text-gray-900 text-right">{getOptionLabel('goot', config.goot)}</span>
                    </div>
                )}
                {config.voorzijde && config.voorzijde !== 'geen' && (
                    <div className="flex justify-between items-start">
                        <span className="text-gray-600">Voorzijde</span>
                        <span className="font-semibold text-gray-900 text-right">{getOptionLabel('voorzijde', config.voorzijde)}</span>
                    </div>
                )}
                {config.zijwand_links && config.zijwand_links !== 'geen' && (
                    <div className="flex justify-between items-start">
                        <span className="text-gray-600">Zijwand L</span>
                        <span className="font-semibold text-gray-900 text-right">{getOptionLabel('zijwand_links', config.zijwand_links)}</span>
                    </div>
                )}
                {config.zijwand_rechts && config.zijwand_rechts !== 'geen' && (
                    <div className="flex justify-between items-start">
                        <span className="text-gray-600">Zijwand R</span>
                        <span className="font-semibold text-gray-900 text-right">{getOptionLabel('zijwand_rechts', config.zijwand_rechts)}</span>
                    </div>
                )}
                {config.verlichting && (
                    <div className="flex justify-between items-start">
                        <span className="text-gray-600">Verlichting</span>
                        <span className="font-semibold text-gray-900">Ja</span>
                    </div>
                )}
            </div>
            <div className="border-t-2 border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm font-medium">Totaalprijs</span>
                    <div className="text-right">
                        <span className="block font-black text-xl text-[#003878]">€ {currentPrice.toLocaleString()},-</span>
                        <span className="text-xs text-gray-500">incl. BTW</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPreviewPlaceholder = () => (
        <div className="bg-gradient-to-br from-[#003878]/10 to-[#FF7300]/10 rounded-xl p-6 h-full min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Eye size={32} className="text-[#003878]" />
            </div>
            <h4 className="font-bold text-gray-900 text-lg mb-2">Preview Visualisatie</h4>
            <p className="text-sm text-gray-600 max-w-xs">
                Uw configuratie wordt hier visueel weergegeven. Overlay rendering wordt later geïmplementeerd.
            </p>
            {config.goot && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <span className="px-3 py-1.5 bg-[#003878] text-white text-xs font-bold rounded-full shadow-sm">
                        Goot: {config.goot}
                    </span>
                    {config.daktype && (
                        <span className="px-3 py-1.5 bg-[#FF7300] text-white text-xs font-bold rounded-full shadow-sm">
                            Dak: {config.daktype.replace('_', ' ')}
                        </span>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm font-sans"
                >
                    {/* Info Modal */}
                    <AnimatePresence>
                        {infoModal && (
                            <MotionDiv
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-[110] flex items-center justify-center p-4"
                                onClick={() => setInfoModal(null)}
                            >
                                <MotionDiv
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="font-bold text-lg text-gray-900">{infoModal.title}</h4>
                                        <button onClick={() => setInfoModal(null)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">{infoModal.text}</p>
                                </MotionDiv>
                            </MotionDiv>
                        )}
                    </AnimatePresence>

                    {/* Main Modal Container */}
                    <MotionDiv
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="bg-white w-full h-full md:h-[95vh] md:w-[95vw] md:max-w-[1400px] md:rounded-2xl shadow-2xl overflow-hidden flex flex-col relative"
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeConfigurator}
                            className="absolute top-4 right-4 z-50 bg-white p-2.5 rounded-full hover:bg-gray-100 shadow-md transition-all text-gray-600 hover:text-gray-900"
                        >
                            <X size={22} />
                        </button>

                        {/* Header */}
                        <div className="bg-[#EDF0F2] border-b-2 border-gray-200 px-6 py-5 md:px-8">
                            <h2 className="text-xl md:text-2xl font-black text-[#003878] pr-12">{productTitle}</h2>
                            <p className="text-gray-600 text-sm mt-1 font-medium">
                                Stap {currentStepIndex + 1} van {STEPS.length} — {currentStep.title}
                            </p>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                            
                            {/* LEFT: Step Content */}
                            <div className="flex-1 lg:w-[60%] overflow-y-auto p-6 md:p-8 pb-32 lg:pb-8">
                                {renderProgressIndicator()}
                                
                                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{currentStep.title}</h3>
                                <p className="text-gray-600 mb-6">{currentStep.description}</p>
                                
                                <AnimatePresence mode="wait">
                                    <MotionDiv
                                        key={currentStepIndex}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {renderOptionSelector()}
                                    </MotionDiv>
                                </AnimatePresence>
                            </div>

                            {/* RIGHT: Preview + Summary (Desktop) */}
                            <div className="hidden lg:flex lg:w-[40%] flex-col bg-[#EDF0F2] border-l-2 border-gray-200 p-6 overflow-y-auto">
                                <div className="mb-6 flex-shrink-0">
                                    {renderPreviewPlaceholder()}
                                </div>
                                <div className="flex-shrink-0">
                                    {renderSummarySidebar()}
                                </div>
                            </div>
                        </div>

                        {/* Footer Navigation (Fixed on mobile, static on desktop) */}
                        <div className="fixed lg:relative bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 md:p-5 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-30">
                            <div className="flex items-center justify-between gap-4 max-w-[1400px] mx-auto">
                                {/* Info badges (desktop) */}
                                <div className="hidden md:flex items-center gap-4 text-xs text-gray-600 font-semibold">
                                    <span className="flex items-center gap-1.5">
                                        <Truck size={14} className="text-[#003878]" /> 1-2 weken levertijd
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <ShieldCheck size={14} className="text-[#003878]" /> 10 jaar garantie
                                    </span>
                                </div>

                                {/* Mobile Price Display */}
                                <div className="lg:hidden">
                                    <span className="text-xs text-gray-600 font-medium">Totaal (incl. BTW)</span>
                                    <span className="block text-xl font-black text-[#003878]">€ {currentPrice.toLocaleString()},-</span>
                                </div>

                                {/* Navigation Buttons */}
                                <div className="flex items-center gap-3">
                                    {currentStepIndex > 0 && (
                                        <button
                                            onClick={handleBack}
                                            className="px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm flex items-center gap-2 shadow-sm"
                                        >
                                            <ChevronLeft size={18} />
                                            <span className="hidden sm:inline">Vorige</span>
                                        </button>
                                    )}

                                    {!isLastStep ? (
                                        <button
                                            onClick={handleNext}
                                            disabled={!canProceed}
                                            className={`px-6 py-3 font-bold rounded-xl text-sm flex items-center gap-2 transition-all shadow-md ${
                                                canProceed
                                                    ? 'bg-[#003878] text-white hover:bg-[#002050]'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            Verdergaan
                                            <ChevronRight size={18} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={!agreed}
                                            className={`px-6 py-3 font-bold rounded-xl text-sm flex items-center gap-2 transition-all shadow-md ${
                                                agreed
                                                    ? 'bg-[#FF7300] text-white hover:bg-[#E66600]'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            Toevoegen aan winkelwagen
                                            <ArrowRight size={18} />
                                        </button>
                                    )}
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
