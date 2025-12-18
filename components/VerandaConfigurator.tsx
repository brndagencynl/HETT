
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { X, ChevronDown, ChevronUp, Check, Info, ChevronLeft, ChevronRight, Truck, ShieldCheck, ArrowRight, Ruler, Lightbulb, LayoutTemplate, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---

export type VerandaConfig = {
  profileColor: 'Antraciet (RAL7016)' | 'Crèmewit (RAL9001)' | 'Zwart (RAL9005)';
  widthCm: number;
  depthCm: number;
  roofType: 'Polycarbonaat Opaal' | 'Polycarbonaat Helder' | 'Glas Helder' | 'Glas Melk';
  wallLeft: string;
  wallRight: string;
  front: string;
  lighting: boolean;
};

export interface VerandaConfiguratorRef {
  open: (initialConfig?: Partial<VerandaConfig>) => void;
  close: () => void;
}

interface VerandaConfiguratorProps {
  productTitle?: string;
  basePrice?: number;
  onSubmit?: (config: VerandaConfig, mode: 'order' | 'quote', price: number, details: { label: string, value: string }[]) => void;
}

// --- Mock Data ---

const IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop", // Exterior
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop", // Interior
  "https://images.unsplash.com/photo-1595846519845-68e298c2edd8?q=80&w=1960&auto=format&fit=crop"  // Detail
];

const WALL_OPTIONS = [
  { id: 'none', label: 'Geen (Open)', price: 0, icon: LayoutTemplate, description: 'De zijkant blijft volledig open.' },
  { id: 'poly', label: 'Polycarbonaat wand', price: 450, icon: LayoutTemplate, description: 'Een vaste wand met lichtdoorlatend polycarbonaat.' },
  { id: 'spie', label: 'Glazen spie (driehoek)', price: 250, icon: LayoutTemplate, description: 'Dicht de driehoek boven een schutting of wand met glas.' },
  { id: 'glass_sliding', label: 'Glazen schuifwand', price: 895, icon: LayoutTemplate, description: 'Glazen panelen die u open en dicht kunt schuiven.' },
  { id: 'rabat', label: 'Dicht (Rabatdelen)', price: 650, icon: LayoutTemplate, description: 'Volledig dichte wand van aluminium rabatdelen.' },
];

const FRONT_OPTIONS = [
  { id: 'open', label: 'Volledig open', price: 0, icon: LayoutTemplate, description: 'De voorzijde blijft volledig open.' },
  { id: 'glass_sliding', label: 'Glazen schuifwanden', price: 1450, icon: LayoutTemplate, description: 'Glazen panelen over de gehele breedte.' },
];

const ROOF_OPTIONS = [
    { 
        id: 'Polycarbonaat Opaal', 
        label: 'Polycarbonaat opaal', 
        price: 0, 
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=400&auto=format&fit=crop',
        description: 'Melkwit polycarbonaat. Laat licht door maar weert directe hitte en fel zonlicht. Meest gekozen optie.'
    },
    { 
        id: 'Polycarbonaat Helder', 
        label: 'Polycarbonaat helder', 
        price: 0, 
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop',
        description: 'Helder polycarbonaat met kanaalstructuur. Maximale lichtinval, maar minder hittewerend.'
    },
    { 
        id: 'Glas Helder', 
        label: 'Helder glas', 
        price: 320, 
        image: 'https://images.unsplash.com/photo-1510627489930-0c1b0bfb6785?q=80&w=400&auto=format&fit=crop',
        description: '44.2 Gelaagd veiligheidsglas. Luxe uitstraling, geluiddempend bij regen en maximaal doorzicht.'
    },
    { 
        id: 'Glas Melk', 
        label: 'Melk glas', 
        price: 450, 
        image: 'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?q=80&w=400&auto=format&fit=crop',
        description: '44.2 Gelaagd veiligheidsglas met matte folie. Privacy en luxe uitstraling gecombineerd.'
    }
];

// --- Component ---

const VerandaConfigurator = forwardRef<VerandaConfiguratorRef, VerandaConfiguratorProps>(({ productTitle = "HETT Premium Veranda", basePrice = 1250, onSubmit }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('dimensions'); 
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [infoModal, setInfoModal] = useState<{ title: string, text: string } | null>(null);

  // Configuration State
  const [config, setConfig] = useState<VerandaConfig>({
    profileColor: 'Antraciet (RAL7016)',
    widthCm: 500,
    depthCm: 300,
    roofType: 'Polycarbonaat Opaal',
    wallLeft: 'none',
    wallRight: 'none',
    front: 'open',
    lighting: false,
  });

  // Dynamic Price Calculation
  const calculatePrice = () => {
    let price = basePrice;
    
    // Dimensions factor (simple mock formula)
    const area = (config.widthCm / 100) * (config.depthCm / 100);
    price += area * 150; 

    // Roof surcharge
    const roofOpt = ROOF_OPTIONS.find(r => r.id === config.roofType);
    if (roofOpt) price += roofOpt.price;

    // Walls
    const leftWallPrice = WALL_OPTIONS.find(w => w.id === config.wallLeft)?.price || 0;
    const rightWallPrice = WALL_OPTIONS.find(w => w.id === config.wallRight)?.price || 0;
    const frontPrice = FRONT_OPTIONS.find(f => f.id === config.front)?.price || 0;
    
    price += leftWallPrice + rightWallPrice + frontPrice;

    // Lighting
    if (config.lighting) price += 249;

    return Math.round(price);
  };

  const currentPrice = calculatePrice();

  const getLabel = (options: any[], id: string) => options.find(o => o.id === id)?.label || id;

  const generateDetails = () => {
    return [
      { label: 'Afmeting', value: `${config.widthCm} x ${config.depthCm} cm` },
      { label: 'Kleur', value: config.profileColor },
      { label: 'Daktype', value: getLabel(ROOF_OPTIONS, config.roofType) },
      { label: 'Zijwand Links', value: getLabel(WALL_OPTIONS, config.wallLeft) },
      { label: 'Zijwand Rechts', value: getLabel(WALL_OPTIONS, config.wallRight) },
      { label: 'Voorzijde', value: getLabel(FRONT_OPTIONS, config.front) },
      { label: 'Verlichting', value: config.lighting ? 'LED Set (6 spots)' : 'Geen' }
    ];
  };

  useImperativeHandle(ref, () => ({
    open: (initialConfig) => {
      if (initialConfig) {
        setConfig(prev => ({ ...prev, ...initialConfig }));
      }
      setIsOpen(true);
      document.body.style.overflow = 'hidden';
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

  // --- Helpers ---
  const Badge = ({ text }: { text: string }) => (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ml-2 bg-gray-100 text-gray-600">
      {text}
    </span>
  );

  const WallOptionCard = ({ option, selected, onClick, onInfo }: any) => (
      <div 
        onClick={onClick}
        className={`flex items-center p-4 rounded-lg border transition-all cursor-pointer group ${selected ? 'border-hett-brown bg-white shadow-sm ring-1 ring-hett-brown' : 'border-gray-200 bg-white hover:border-gray-300'}`}
      >
          <div className={`w-10 h-10 rounded-md flex items-center justify-center mr-4 transition-colors ${selected ? 'bg-hett-brown text-white' : 'bg-gray-100 text-gray-400 group-hover:text-gray-600'}`}>
              <option.icon size={20} />
          </div>
          <div className="flex-grow">
              <span className={`block font-bold text-sm ${selected ? 'text-hett-dark' : 'text-gray-700'}`}>{option.label}</span>
              {option.price > 0 && <span className="text-xs text-gray-500 font-medium">+ €{option.price}</span>}
          </div>
          {/* Info Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); onInfo(option); }}
            className="p-2 text-gray-300 hover:text-hett-brown transition-colors"
          >
              <Info size={18} />
          </button>
      </div>
  );

  const handleSubmit = (mode: 'order' | 'quote') => {
      if (onSubmit) {
          onSubmit(config, mode, currentPrice, generateDetails());
      }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
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
          <motion.div 
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
                <img 
                    src={IMAGES[currentImageIdx]} 
                    alt="Configurator View" 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100"><ChevronLeft size={20} /></button>
                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100"><ChevronRight size={20} /></button>
                
                <div className="absolute bottom-6 left-6 flex">
                    <span className="px-4 py-2 rounded-md text-xs font-bold bg-white/90 shadow-sm text-gray-600">Visualisatie</span>
                </div>
            </div>

            {/* --- RIGHT COLUMN: OPTIONS --- */}
            <div className="w-full md:w-[55%] h-[65vh] md:h-full bg-white flex flex-col border-l border-gray-100">
                
                <div className="p-6 md:p-8 border-b border-gray-100 bg-white z-10">
                    <h2 className="text-2xl font-black text-[#1a1a1a] leading-tight mb-1">{productTitle}</h2>
                    <p className="text-gray-500 text-sm">Configureer uw droomveranda.</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 pb-28 custom-scrollbar">
                    
                    {/* 1. Kleur */}
                    <div className="border-b border-gray-100 pb-6">
                        <button onClick={() => toggleSection('color')} className="w-full flex justify-between items-center mb-2 group">
                            <h3 className="text-lg font-bold text-[#1a1a1a] flex items-center">
                                Kleur profiel. {activeSection !== 'color' && <Badge text={config.profileColor.split(' ')[0]} />}
                            </h3>
                            {activeSection === 'color' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        <AnimatePresence>
                            {activeSection === 'color' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-2">
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { label: 'Antraciet (RAL7016)', hex: '#293133' },
                                            { label: 'Crèmewit (RAL9001)', hex: '#FDF4E3' },
                                            { label: 'Zwart (RAL9005)', hex: '#0E0E10' }
                                        ].map((opt) => (
                                            <label key={opt.label} className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-all ${config.profileColor === opt.label ? 'border-hett-brown bg-orange-50/20 ring-1 ring-hett-brown' : 'border-gray-200'}`}>
                                                <div className="w-8 h-8 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: opt.hex }}></div>
                                                <span className="font-bold text-gray-800 text-sm flex-grow">{opt.label}</span>
                                                <input type="radio" name="color" className="accent-hett-brown w-5 h-5" checked={config.profileColor === opt.label} onChange={() => setConfig(prev => ({ ...prev, profileColor: opt.label as any }))} />
                                            </label>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 2. Afmetingen (Inputs) */}
                    <div className="border-b border-gray-100 pb-6">
                        <button onClick={() => toggleSection('dimensions')} className="w-full flex justify-between items-center mb-2 group">
                            <h3 className="text-lg font-bold text-[#1a1a1a] flex items-center">
                                Afmetingen. {activeSection !== 'dimensions' && <Badge text={`${config.widthCm}x${config.depthCm}cm`} />}
                            </h3>
                            {activeSection === 'dimensions' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        <AnimatePresence>
                            {activeSection === 'dimensions' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Breedte (cm)</label>
                                            <div className="relative">
                                                <Ruler size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input 
                                                    type="number" 
                                                    value={config.widthCm}
                                                    onChange={(e) => setConfig(prev => ({...prev, widthCm: Number(e.target.value)}))}
                                                    className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-lg font-bold bg-white text-gray-900 focus:border-hett-brown outline-none"
                                                    min={200} max={1200} step={10}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Diepte (cm)</label>
                                            <div className="relative">
                                                <Ruler size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input 
                                                    type="number" 
                                                    value={config.depthCm}
                                                    onChange={(e) => setConfig(prev => ({...prev, depthCm: Number(e.target.value)}))}
                                                    className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-lg font-bold bg-white text-gray-900 focus:border-hett-brown outline-none"
                                                    min={200} max={500} step={10}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-3 flex items-center gap-1"><Info size={12}/> Vul de exacte maten in centimeters in.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 3. Dakbedekking (Image Cards) */}
                    <div className="border-b border-gray-100 pb-6">
                        <button onClick={() => toggleSection('roof')} className="w-full flex justify-between items-center mb-2 group">
                            <h3 className="text-lg font-bold text-[#1a1a1a] flex items-center">
                                Dakbedekking. {activeSection !== 'roof' && <Badge text={config.roofType} />}
                            </h3>
                            {activeSection === 'roof' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        <AnimatePresence>
                            {activeSection === 'roof' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-2">
                                     <div className="grid grid-cols-2 gap-4">
                                        {ROOF_OPTIONS.map((option) => (
                                            <div 
                                                key={option.id}
                                                onClick={() => setConfig(prev => ({ ...prev, roofType: option.id as any }))}
                                                className={`relative rounded-lg overflow-hidden cursor-pointer transition-all border group ${config.roofType === option.id ? 'border-hett-brown ring-1 ring-hett-brown shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                                            >
                                                {/* Selected Overlay */}
                                                {config.roofType === option.id && (
                                                    <div className="absolute top-2 left-2 z-10 w-6 h-6 bg-hett-brown rounded-full flex items-center justify-center text-white shadow-sm">
                                                        <Check size={14} strokeWidth={3} />
                                                    </div>
                                                )}
                                                
                                                {/* Info Button */}
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setInfoModal({ title: option.label, text: option.description })}}
                                                    className="absolute top-2 right-2 z-10 w-6 h-6 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-hett-brown shadow-sm transition-colors"
                                                >
                                                    <Info size={14} />
                                                </button>

                                                {/* Image */}
                                                <div className="aspect-[4/3] bg-gray-100">
                                                    <img src={option.image} alt={option.label} className="w-full h-full object-cover" />
                                                </div>

                                                {/* Label & Price */}
                                                <div className="p-3 bg-white">
                                                    <span className="block text-sm font-bold text-hett-dark mb-1">{option.label}</span>
                                                    {option.price > 0 && (
                                                        <span className="inline-block bg-gray-100 text-hett-dark text-xs font-bold px-2 py-0.5 rounded">
                                                            + {option.price},-
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                     </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 4. Wanden (Links/Rechts/Voor) - Card List Style */}
                    <div className="border-b border-gray-100 pb-6">
                        <button onClick={() => toggleSection('walls')} className="w-full flex justify-between items-center mb-2 group">
                            <h3 className="text-lg font-bold text-[#1a1a1a] flex items-center">
                                Wanden & Voorzijde. {activeSection !== 'walls' && <Badge text="Opties" />}
                            </h3>
                            {activeSection === 'walls' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        <AnimatePresence>
                            {activeSection === 'walls' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-2 space-y-6">
                                    
                                    {/* Left Wall */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-3 ml-1">ZIJWAND LINKS</label>
                                        <div className="space-y-3">
                                            {WALL_OPTIONS.map(opt => (
                                                <WallOptionCard 
                                                    key={opt.id}
                                                    option={opt}
                                                    selected={config.wallLeft === opt.id}
                                                    onClick={() => setConfig(prev => ({...prev, wallLeft: opt.id}))}
                                                    onInfo={(opt: any) => setInfoModal({ title: opt.label, text: opt.description })}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right Wall */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-3 ml-1">ZIJWAND RECHTS</label>
                                        <div className="space-y-3">
                                            {WALL_OPTIONS.map(opt => (
                                                <WallOptionCard 
                                                    key={opt.id}
                                                    option={opt}
                                                    selected={config.wallRight === opt.id}
                                                    onClick={() => setConfig(prev => ({...prev, wallRight: opt.id}))}
                                                    onInfo={(opt: any) => setInfoModal({ title: opt.label, text: opt.description })}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Front */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-3 ml-1">VOORZIJDE</label>
                                        <div className="space-y-3">
                                            {FRONT_OPTIONS.map(opt => (
                                                <WallOptionCard 
                                                    key={opt.id}
                                                    option={opt}
                                                    selected={config.front === opt.id}
                                                    onClick={() => setConfig(prev => ({...prev, front: opt.id}))}
                                                    onInfo={(opt: any) => setInfoModal({ title: opt.label, text: opt.description })}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 5. Verlichting */}
                    <div>
                         <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center text-yellow-50 shadow-sm border border-gray-100">
                                     <Lightbulb size={20} fill={config.lighting ? "currentColor" : "none"} />
                                 </div>
                                 <div>
                                     <span className="font-bold text-hett-dark text-sm block">LED Verlichting Set</span>
                                     <span className="text-xs text-gray-500">6 Dimbare spots (+€249)</span>
                                 </div>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={config.lighting} onChange={(e) => setConfig(prev => ({...prev, lighting: e.target.checked}))} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hett-brown"></div>
                             </label>
                         </div>
                    </div>
                    
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

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default VerandaConfigurator;
