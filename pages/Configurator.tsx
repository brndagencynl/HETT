
import React, { useState, useEffect } from 'react';
import { PanelConfig } from '../types';
import { Check, Calculator, RefreshCw } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const Configurator: React.FC = () => {
  const [config, setConfig] = useState<PanelConfig>({
    type: 'dak',
    thickness: 40,
    color: 'Anthracite',
    finish: 'Trapezium',
    length: 300 // Corresponds to Diepte (Depth)
  });

  const [width, setWidth] = useState(500); // Corresponds to Breedte (Width) in cm

  // Calculated Values Simulation
  const [stats, setStats] = useState({ uValue: '0.58', weight: '11.2', priceIndex: 100 });

  useEffect(() => {
    // Simulate calculation logic based on thickness
    const baseU = 0.58;
    const uVal = Math.max(0.2, baseU - ((config.thickness - 40) * 0.005)).toFixed(2);
    const weight = (10 + (config.thickness / 10)).toFixed(1);
    
    setStats({
      uValue: uVal,
      weight: weight,
      priceIndex: 100 + (config.thickness - 40) + (config.length / 10)
    });
  }, [config]);

  const colors = [
    { name: 'Anthracite', hex: '#293133', label: 'RAL 7016' },
    { name: 'White', hex: '#fbfbfb', label: 'RAL 9010' },
    { name: 'Silver', hex: '#a5a5a5', label: 'RAL 9006' },
    { name: 'Black', hex: '#1a1a1a', label: 'RAL 9005' }
  ];

  return (
    <div className="min-h-screen bg-hett-light">
      
      {/* Header */}
      <PageHeader 
        title="Product Configurator"
        subtitle="Interactieve Tool"
        description="Stel uw ideale sandwichpaneel samen. Kies product, kleur en afmetingen voor een directe prijsindicatie."
        image="https://picsum.photos/1200/800?random=8"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Section */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* STEP 1: Product Selection (Type only) */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-hett-dark mb-6 flex items-center">
                <span className="w-10 h-10 bg-hett-brown text-white rounded-full flex items-center justify-center text-base font-bold mr-4">1</span>
                Product Selectie
              </h2>
              
              <div className="space-y-6">
                 {/* Type */}
                 <div>
                    <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Type Paneel</label>
                    <div className="grid grid-cols-1">
                        <button
                            className="p-5 rounded-2xl border-2 border-hett-brown bg-orange-50/50 transition-all text-left flex items-center justify-between"
                        >
                            <span className="font-bold text-hett-dark capitalize text-lg">Sandwichpanelen</span>
                            <Check size={20} className="text-hett-brown" />
                        </button>
                    </div>
                 </div>
              </div>
            </div>

            {/* STEP 2: Color */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-hett-dark mb-6 flex items-center">
                <span className="w-10 h-10 bg-hett-brown text-white rounded-full flex items-center justify-center text-base font-bold mr-4">2</span>
                Kleur
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setConfig({ ...config, color: c.name })}
                    className={`group relative p-1.5 rounded-2xl border-2 transition-all ${
                      config.color === c.name ? 'border-hett-brown' : 'border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-full h-24 rounded-xl mb-3 shadow-inner relative overflow-hidden" style={{ backgroundColor: c.hex }}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-white/20"></div>
                        {config.color === c.name && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/20 backdrop-blur-md p-2 rounded-full shadow-sm">
                                    <Check className="text-white drop-shadow-md" size={24} strokeWidth={3} />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="text-center">
                        <span className="block text-sm font-bold text-gray-800">{c.name}</span>
                        <span className="block text-xs text-gray-400 font-medium">{c.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 3: Width (Breedte) */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-hett-dark mb-6 flex items-center">
                <span className="w-10 h-10 bg-hett-brown text-white rounded-full flex items-center justify-center text-base font-bold mr-4">3</span>
                Breedte
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="flex-grow w-full">
                    <input 
                        type="range" 
                        min="100" 
                        max="2000" 
                        step="10"
                        value={width}
                        onChange={(e) => setWidth(parseInt(e.target.value))}
                        className="w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer accent-hett-brown hover:bg-gray-200 transition-colors"
                    />
                    <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium px-1">
                        <span>100 cm</span>
                        <span>2000 cm</span>
                    </div>
                </div>
                <div className="flex-shrink-0 w-full sm:w-auto">
                    <div className="flex items-center border-2 border-gray-100 rounded-2xl px-4 py-3 bg-white focus-within:border-hett-brown transition-colors">
                        <input 
                            type="number"
                            value={width}
                            onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
                            className="w-20 text-xl font-bold text-hett-dark outline-none bg-transparent"
                        />
                        <span className="text-gray-400 font-bold ml-2">cm</span>
                    </div>
                </div>
              </div>
            </div>

            {/* STEP 4: Depth (Diepte) */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-hett-dark mb-6 flex items-center">
                <span className="w-10 h-10 bg-hett-brown text-white rounded-full flex items-center justify-center text-base font-bold mr-4">4</span>
                Diepte (Uitval)
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="flex-grow w-full">
                    <input 
                        type="range" 
                        min="100" 
                        max="1300" 
                        step="10"
                        value={config.length}
                        onChange={(e) => setConfig({...config, length: parseInt(e.target.value)})}
                        className="w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer accent-hett-brown hover:bg-gray-200 transition-colors"
                    />
                    <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium px-1">
                        <span>100 cm</span>
                        <span>1300 cm</span>
                    </div>
                </div>
                <div className="flex-shrink-0 w-full sm:w-auto">
                    <div className="flex items-center border-2 border-gray-100 rounded-2xl px-4 py-3 bg-white focus-within:border-hett-brown transition-colors">
                        <input 
                            type="number"
                            value={config.length}
                            onChange={(e) => setConfig({...config, length: parseInt(e.target.value) || 0})}
                            className="w-20 text-xl font-bold text-hett-dark outline-none bg-transparent"
                        />
                        <span className="text-gray-400 font-bold ml-2">cm</span>
                    </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4">Wij zagen panelen op de millimeter nauwkeurig. Max lengte 13m.</p>
            </div>

          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
                
                {/* Summary Card */}
                <div className="bg-hett-dark text-white rounded-[32px] shadow-2xl overflow-hidden p-8 border border-gray-800">
                        <h3 className="text-2xl font-bold mb-1">HETT Sandwichpaneel</h3>
                        <div className="flex items-center gap-2 mb-8 opacity-60">
                             <span className="text-sm font-medium">{config.thickness}mm</span>
                             <span>•</span>
                             <span className="text-sm font-medium">{config.color}</span>
                        </div>

                        <div className="space-y-5 mb-10 border-t border-white/10 pt-8">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm font-medium">Breedte</span>
                                <span className="font-bold text-xl">{width} <span className="text-sm font-normal text-gray-500">cm</span></span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm font-medium">Diepte</span>
                                <span className="font-bold text-xl">{config.length} <span className="text-sm font-normal text-gray-500">cm</span></span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm font-medium">Totaal oppervlak</span>
                                <span className="font-bold text-xl text-hett-brown">{((width * config.length) / 10000).toFixed(2)} <span className="text-sm font-normal text-gray-500">m²</span></span>
                            </div>
                            
                            <div className="h-px bg-white/10 my-2"></div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-xs">U-Waarde</span>
                                <span className="font-bold text-sm">{stats.uValue} W/m²K</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-xs">Gewicht</span>
                                <span className="font-bold text-sm">{stats.weight} kg/m²</span>
                            </div>
                        </div>

                        <button className="w-full bg-white text-hett-dark font-black uppercase tracking-wide py-5 rounded-2xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-lg mb-4">
                            <Calculator size={20} className="text-hett-brown" />
                            Offerte Aanvragen
                        </button>
                        
                        <p className="text-center text-xs text-gray-500">
                            Vrijblijvende prijsopgave binnen 24u
                        </p>
                </div>

                {/* Assistance Box */}
                <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm flex items-start gap-4">
                    <div className="bg-hett-brown/10 p-3 rounded-full text-hett-brown flex-shrink-0">
                        <RefreshCw size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-hett-dark text-sm mb-1">Hulp nodig?</h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Onze engineers helpen u graag met de berekening voor uw specifieke situatie.
                        </p>
                    </div>
                </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Configurator;
