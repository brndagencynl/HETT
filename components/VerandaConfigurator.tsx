import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Check, Info, ChevronLeft, ChevronRight, Truck, ShieldCheck, ArrowRight, Lightbulb, LayoutTemplate } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VERANDA_OPTIONS_UI, DEFAULT_VERANDA_CONFIG, VerandaConfig, VerandaOptionKey } from '../src/configurator/schemas/veranda';
import { calcVerandaPrice } from '../src/configurator/pricing/veranda';
import { getVerandaLayers } from '../src/configurator/visual/verandaLayers';

const MotionDiv = motion.div as any;

// --- Types ---
export interface VerandaConfiguratorRef {
    open: (initialConfig?: Partial<VerandaConfig>) => void;
    close: () => void;
}

interface VerandaConfiguratorProps {
    productTitle?: string;
    basePrice?: number;
    onSubmit?: (config: VerandaConfig, mode: 'order' | 'quote', price: number, details: { label: string, value: string }[]) => void;
}

// --- Mock Data for Visuals (unchanged for now) ---
const IMAGES = [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053",
    "https://images.unsplash.com/photo-1595846519845-68e298c2edd8?q=80&w=1960"
];

const VerandaConfigurator = forwardRef<VerandaConfiguratorRef, VerandaConfiguratorProps>(({ productTitle = "HETT Premium Veranda", basePrice = 1250, onSubmit }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('daktype');
    const [currentImageIdx, setCurrentImageIdx] = useState(0);
    const [infoModal, setInfoModal] = useState<{ title: string, text: string } | null>(null);

    // Configuration State
    const [config, setConfig] = useState<Partial<VerandaConfig>>(DEFAULT_VERANDA_CONFIG);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Price Calculation
    // calcVerandaPrice likely expects full config, let's cast or ensure defaults in calc
    // For now assuming calcVerandaPrice handles missing gracefully or we provide defaults during calc
    const { total: currentPrice } = calcVerandaPrice(basePrice, config as VerandaConfig);

    // Visual Layers Check (Integration)
    useEffect(() => {
        // Safe check
        if (config.daktype) {
            const layers = getVerandaLayers(config as VerandaConfig);
            // console.log('Active Visual Layers:', layers);
        }
    }, [config]);

    useImperativeHandle(ref, () => ({
        open: (initialConfig) => {
            if (initialConfig) {
                setConfig(prev => ({ ...prev, ...initialConfig }));
            } else {
                // Reset to default if no initial
                setConfig(DEFAULT_VERANDA_CONFIG);
            }
            setErrors({}); // Clear errors
            setIsOpen(true);
            document.body.style.overflow = 'hidden';
            // Default open first section
            setActiveSection('daktype');
        },
        close: () => closeConfigurator()
    }));

    const closeConfigurator = () => {
        setIsOpen(false);
        document.body.style.overflow = 'unset';
    };

    const toggleSection = (section: string) => {
        setActiveSection(activeSection === section ? '' : section);
    };

    const nextImage = () => setCurrentImageIdx((prev) => (prev + 1) % IMAGES.length);
    const prevImage = () => setCurrentImageIdx((prev) => (prev - 1 + IMAGES.length) % IMAGES.length);

    // Helper to get readable labels
    const getOptionLabel = (key: string, value: any) => {
        const field = VERANDA_OPTIONS_UI.find(f => f.key === key);
        if (!field) return value;
        const choice = field.choices.find(c => c.value === value);
        return choice ? choice.label : value;
    };

    const generateDetails = () => {
        return Object.keys(config).map(key => ({
            label: VERANDA_OPTIONS_UI.find(f => f.key === key)?.label || key,
            value: getOptionLabel(key, config[key as keyof VerandaConfig])
        }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        if (!config.daktype) {
            newErrors['daktype'] = 'Kies een daktype';
            isValid = false;
        }
        if (!config.goot) {
            newErrors['goot'] = 'Kies een goot optie';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (mode: 'order' | 'quote') => {
        if (validate()) {
            if (onSubmit) {
                onSubmit(config as VerandaConfig, mode, currentPrice, generateDetails());
            }
        } else {
            // Auto open first invalid section
            if (!config.daktype) setActiveSection('daktype');
            else if (!config.goot) setActiveSection('goot');
        }
    };

    // Generic Renderers
    const renderOption = (optionDef: any) => {
        const currentValue = config[optionDef.key as keyof VerandaConfig];

        // 1. CARDS (Like Roof Types)
        if (optionDef.type === 'card') {
            return (
                <div className="grid grid-cols-2 gap-4">
                    {optionDef.choices.map((choice: any) => (
                        <div
                            key={choice.value}
                            onClick={() => setConfig(prev => ({ ...prev, [optionDef.key]: choice.value }))}
                            className={`relative rounded-lg overflow-hidden cursor-pointer transition-all border group ${currentValue === choice.value ? 'border-hett-brown ring-1 ring-hett-brown shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            {currentValue === choice.value && (
                                <div className="absolute top-2 left-2 z-10 w-6 h-6 bg-hett-brown rounded-full flex items-center justify-center text-white shadow-sm"><Check size={14} strokeWidth={3} /></div>
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); setInfoModal({ title: choice.label, text: choice.description }) }}
                                className="absolute top-2 right-2 z-10 w-6 h-6 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-hett-brown shadow-sm transition-colors"
                            >
                                <Info size={14} />
                            </button>
                            <div className="aspect-[4/3] bg-gray-100">
                                <img src={choice.image} alt={choice.label} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-3 bg-white">
                                <span className="block text-sm font-bold text-hett-dark mb-1">{choice.label}</span>
                                {choice.price > 0 && <span className="inline-block bg-gray-100 text-hett-dark text-xs font-bold px-2 py-0.5 rounded">+ €{choice.price},-</span>}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        // 2. RADIO / COLORS
        if (optionDef.key === 'profileColor') {
            return (
                <div className="grid grid-cols-1 gap-3">
                    {optionDef.choices.map((choice: any) => (
                        <label key={choice.value} className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-all ${currentValue === choice.value ? 'border-hett-brown bg-orange-50/20 ring-1 ring-hett-brown' : 'border-gray-200'}`}>
                            <div className="w-8 h-8 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: choice.hex }}></div>
                            <span className="font-bold text-gray-800 text-sm flex-grow">{choice.label}</span>
                            <input
                                type="radio"
                                name={optionDef.key}
                                className="accent-hett-brown w-5 h-5"
                                checked={currentValue === choice.value}
                                onChange={() => setConfig(prev => ({ ...prev, [optionDef.key]: choice.value }))}
                            />
                        </label>
                    ))}
                </div>
            );
        }

        // 3. SELECT / LIST (Walls)
        if (optionDef.type === 'select' || optionDef.type === 'radio') {
            return (
                <div className="space-y-3">
                    {optionDef.choices.map((choice: any) => (
                        <div
                            key={choice.value}
                            onClick={() => setConfig(prev => ({ ...prev, [optionDef.key]: choice.value }))}
                            className={`flex items-center p-4 rounded-lg border transition-all cursor-pointer group ${currentValue === choice.value ? 'border-hett-brown bg-white shadow-sm ring-1 ring-hett-brown' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                        >
                            <div className={`w-10 h-10 rounded-md flex items-center justify-center mr-4 transition-colors ${currentValue === choice.value ? 'bg-hett-brown text-white' : 'bg-gray-100 text-gray-400 group-hover:text-gray-600'}`}>
                                <LayoutTemplate size={20} />
                            </div>
                            <div className="flex-grow">
                                <span className={`block font-bold text-sm ${currentValue === choice.value ? 'text-hett-dark' : 'text-gray-700'}`}>{choice.label}</span>
                                {choice.price > 0 && <span className="text-xs text-gray-500 font-medium">+ €{choice.price}</span>}
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setInfoModal({ title: choice.label, text: choice.description }) }}
                                className="p-2 text-gray-300 hover:text-hett-brown transition-colors"
                            >
                                <Info size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            );
        }

        // 4. TOGGLE
        if (optionDef.type === 'toggle') {
            const choice = optionDef.choices[0]; // Assuming single toggle for lighting
            return (
                <div>
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center text-yellow-50 shadow-sm border border-gray-100">
                                <Lightbulb size={20} fill={currentValue ? "currentColor" : "none"} />
                            </div>
                            <div>
                                <span className="font-bold text-hett-dark text-sm block">{choice.label}</span>
                                {choice.price > 0 && <span className="text-xs text-gray-500">{choice.description} (+€{choice.price})</span>}
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={!!currentValue}
                                onChange={(e) => setConfig(prev => ({ ...prev, [optionDef.key]: e.target.checked }))}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hett-brown"></div>
                        </label>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm font-sans"
                >
                    {/* Info Modal */}
                    {infoModal && (
                        <div className="absolute inset-0 z-[110] flex items-center justify-center p-4" onClick={() => setInfoModal(null)}>
                            <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-bold text-lg text-hett-dark">{infoModal.title}</h4>
                                    <button onClick={() => setInfoModal(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">{infoModal.text}</p>
                            </div>
                        </div>
                    )}

                    {/* Main Modal Container */}
                    <MotionDiv
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="bg-white w-full h-full md:h-[95vh] md:w-[95vw] md:max-w-[1600px] md:rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative"
                    >

                        {/* Close Button */}
                        <button
                            onClick={closeConfigurator}
                            className="absolute top-4 right-4 z-50 bg-white/90 p-2 rounded-full hover:bg-white shadow-sm transition-all text-gray-500 hover:text-black"
                        >
                            <X size={24} />
                        </button>

                        {/* --- LEFT COLUMN: VISUALS --- */}
                        <div className="w-full md:w-[45%] h-[35vh] md:h-full bg-gray-100 relative group overflow-hidden">
                            {/* Base Image */}
                            <img
                                src={IMAGES[currentImageIdx]}
                                alt="Configurator View"
                                className="absolute inset-0 w-full h-full object-cover z-0"
                            />

                            {/* Overlays */}
                            {getVerandaLayers(config as VerandaConfig).map((layer) => (
                                <img
                                    key={layer.id}
                                    src={layer.src}
                                    alt={layer.type}
                                    className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300"
                                    style={{ zIndex: layer.zIndex }}
                                    onError={(e) => {
                                        console.warn(`Failed to load overlay: ${layer.src}`);
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            ))}

                            {/* Controls */}
                            <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 z-50"><ChevronLeft size={20} /></button>
                            <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 z-50"><ChevronRight size={20} /></button>

                            <div className="absolute bottom-6 left-6 flex flex-col items-start gap-2 z-50">
                                <span className="px-4 py-2 rounded-md text-xs font-bold bg-white/90 shadow-sm text-gray-600">Visualisatie</span>
                                {config.goot && (
                                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-hett-brown text-white shadow-sm animate-in fade-in slide-in-from-bottom-2">
                                        Goot: {config.goot.charAt(0).toUpperCase() + config.goot.slice(1)} ({config.profileColor?.split(' ')[0]})
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* --- RIGHT COLUMN: OPTIONS --- */}
                        <div className="w-full md:w-[55%] h-[65vh] md:h-full bg-white flex flex-col border-l border-gray-100">

                            <div className="p-6 md:p-8 border-b border-gray-100 bg-white z-10">
                                <h2 className="text-2xl font-black text-[#1a1a1a] leading-tight mb-1">{productTitle}</h2>
                                <p className="text-gray-500 text-sm">Configureer uw droomveranda.</p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 pb-28 custom-scrollbar">

                                {VERANDA_OPTIONS_UI.map((option) => (
                                    <div key={option.key} className="border-b border-gray-100 pb-6">
                                        <button onClick={() => toggleSection(option.key)} className="w-full flex justify-between items-center mb-2 group">
                                            <h3 className={`text-lg font-bold flex items-center ${errors[option.key] ? 'text-red-500' : 'text-[#1a1a1a]'}`}>
                                                {option.label}
                                                {errors[option.key] && <span className="text-red-500 text-xs ml-2 font-normal">({errors[option.key]})</span>}
                                                {/* Selection Badge if valid */}
                                                {!errors[option.key] && activeSection !== option.key && config[option.key as keyof VerandaConfig] && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ml-2 bg-gray-100 text-gray-600">
                                                        {getOptionLabel(option.key, config[option.key as keyof VerandaConfig] as any).toString().substring(0, 20)}...
                                                    </span>
                                                )}
                                            </h3>
                                            {activeSection === option.key ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                        <AnimatePresence>
                                            {activeSection === option.key && (
                                                <MotionDiv initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-2">
                                                    {renderOption(option)}
                                                    {errors[option.key] && (
                                                        <div className="mt-2 text-sm text-red-500 font-bold flex items-center gap-1 animate-pulse">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                                                            {errors[option.key]}
                                                        </div>
                                                    )}
                                                </MotionDiv>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}

                                <div className="h-24"></div>
                            </div>

                            {/* --- FOOTER (COMPACT) --- */}
                            <div className="absolute bottom-0 left-0 right-0 md:left-auto md:w-[55%] bg-white border-t border-gray-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
                                <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-3">
                                    <span className="flex items-center gap-1.5"><Truck size={12} /> 1-2 weken</span>
                                    <span className="flex items-center gap-1.5"><ShieldCheck size={12} /> 10 jaar garantie</span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-500 font-medium leading-tight">Totaalprijs (incl. BTW)</span>
                                        <span className="text-2xl font-black text-[#1a1a1a] leading-none">€ {currentPrice.toLocaleString()},-</span>
                                    </div>

                                    <div className="flex gap-2 flex-1 justify-end max-w-md">
                                        <button
                                            onClick={() => handleSubmit('quote')}
                                            className="px-4 py-3 bg-white border border-gray-300 text-[#1a1a1a] font-bold rounded-lg hover:bg-gray-50 transition-colors text-sm whitespace-nowrap"
                                        >
                                            Offerte
                                        </button>
                                        <button
                                            onClick={() => handleSubmit('order')}
                                            className="flex-1 px-6 py-3 bg-black text-white font-bold rounded-lg hover:bg-[#333] transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                                        >
                                            Verdergaan <ArrowRight size={16} />
                                        </button>
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

export default VerandaConfigurator;
