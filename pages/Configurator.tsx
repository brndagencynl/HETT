
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PanelConfig } from '../types';
import { Check, Info, Calculator, RefreshCw } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const Configurator: React.FC = () => {
  const [config, setConfig] = useState<PanelConfig>({
    type: 'dak',
    thickness: 40,
    color: 'Anthracite',
    finish: 'Trapezium',
    length: 300
  });

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

  const thicknesses = [40, 60, 80, 100, 120];

  return (
    <div className="min-h-screen bg-hett-light">
      
      {/* Header */}
      <PageHeader 
        title="Product Configurator"
        subtitle="Interactieve Tool"
        description="Stel uw ideale sandwichpaneel samen, bekijk direct de specificaties en bereken de isolatiewaarde."
        image="https://picsum.photos/1200/800?random=8"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Section */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Type Selection */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-hett-dark mb-6 flex items-center">
                <span className="w-8 h-8 bg-hett-brown text-white rounded-full flex items-center justify-center text-sm mr-3">1</span>
                Toepassing & Type
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {['dak', 'wand'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setConfig({ ...config, type: type as 'dak' | 'wand' })}
                    className={`p-6 rounded-2xl border-2 transition-all text-left ${
                      config.type === type 
                        ? 'border-hett-brown bg-orange-50/30' 
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <span className="block font-bold text-hett-dark capitalize mb-1 text-lg">{type}paneel</span>
                    <span className="text-sm text-gray-500">
                      {type === 'dak' ? 'Voor overkappingen en daken' : 'Voor gevels en wanden'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Thickness Selection */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-hett-dark mb-6 flex items-center">
                <span className="w-8 h-8 bg-hett-brown text-white rounded-full flex items-center justify-center text-sm mr-3">2</span>
                Dikte (Isolatiewaarde)
              </h2>
              <div className="flex flex-wrap gap-3">
                {thicknesses.map((t) => (
                  <button
                    key={t}
                    onClick={() => setConfig({ ...config, thickness: t })}
                    className={`px-6 py-3 rounded-full font-bold transition-all ${
                      config.thickness === t
                        ? 'bg-hett-dark text-white shadow-md transform scale-105'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t}mm
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4 flex items-center gap-2 bg-blue-50 p-3 rounded-xl border border-blue-100 text-blue-800">
                <Info size={16} /> Hoe dikker het paneel, hoe hoger de isolatiewaarde (Rd).
              </p>
            </div>

            {/* Color Selection */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-hett-dark mb-6 flex items-center">
                <span className="w-8 h-8 bg-hett-brown text-white rounded-full flex items-center justify-center text-sm mr-3">3</span>
                Kleur (Buitenzijde)
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setConfig({ ...config, color: c.name })}
                    className={`group relative p-1 rounded-2xl border-2 transition-all ${
                      config.color === c.name ? 'border-hett-brown' : 'border-transparent'
                    }`}
                  >
                    <div className="w-full h-20 rounded-xl bg-slate-200 mb-3 shadow-inner" style={{ backgroundColor: c.hex }}>
                        {config.color === c.name && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                                    <Check className="text-white" size={20} />
                                </div>
                            </div>
                        )}
                    </div>
                    <span className="block text-center text-sm font-bold text-gray-700">{c.name}</span>
                    <span className="block text-center text-xs text-gray-400">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Length Slider */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-hett-dark mb-6 flex items-center">
                <span className="w-8 h-8 bg-hett-brown text-white rounded-full flex items-center justify-center text-sm mr-3">4</span>
                Lengte (cm)
              </h2>
              <div className="flex items-center gap-8">
                <input 
                    type="range" 
                    min="100" 
                    max="1300" 
                    step="10"
                    value={config.length}
                    onChange={(e) => setConfig({...config, length: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-hett-brown"
                />
                <div className="w-32 px-4 py-3 bg-gray-50 rounded-xl text-center font-bold text-hett-dark border border-gray-200 text-lg">
                    {config.length} cm
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">Wij zagen panelen op de millimeter nauwkeurig. Max lengte 13m.</p>
            </div>

          </div>

          {/* Preview & Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
                
                {/* Visual Preview */}
                <div className="bg-white rounded-[32px] shadow-lg overflow-hidden border border-gray-200">
                    <div className="bg-gray-100 h-56 flex items-center justify-center relative p-8">
                        {/* Simulated Panel Visual */}
                        <div 
                            className="w-full h-16 shadow-2xl transform rotate-[-2deg] transition-all duration-500 relative"
                            style={{ 
                                backgroundColor: colors.find(c => c.name === config.color)?.hex,
                                height: `${config.thickness}px`
                            }}
                        >
                            {/* Gloss effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50"></div>
                            {/* Ribbing effect for dak */}
                            {config.type === 'dak' && (
                                <div className="absolute inset-0 flex justify-around">
                                    <div className="w-6 h-full bg-black/10"></div>
                                    <div className="w-6 h-full bg-black/10"></div>
                                    <div className="w-6 h-full bg-black/10"></div>
                                </div>
                            )}
                            {/* Side edge showing foam */}
                            <div className="absolute -right-3 top-1 bottom-1 w-3 bg-yellow-50 border-l border-gray-400 skew-y-[45deg]"></div>
                        </div>
                        <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-mono uppercase tracking-widest">
                            HETT Preview
                        </div>
                    </div>
                    
                    <div className="p-8 bg-hett-dark text-white">
                        <h3 className="text-2xl font-bold mb-2">{config.type === 'dak' ? 'HETT Dakpaneel' : 'HETT Wandpaneel'}</h3>
                        <p className="text-gray-400 text-sm mb-8 border-b border-gray-700 pb-4">{config.thickness}mm • {config.color} • {config.finish}</p>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">U-Waarde (Isolatie)</span>
                                <span className="font-bold text-lg">{stats.uValue} W/m²K</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Gewicht per m²</span>
                                <span className="font-bold text-lg">{stats.weight} kg</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Lengte</span>
                                <span className="font-bold text-lg">{config.length} cm</span>
                            </div>
                        </div>

                        <button className="w-full bg-hett-brown text-white font-bold uppercase tracking-wide py-4 rounded-full hover:bg-white hover:text-hett-brown transition-colors flex items-center justify-center gap-2 mb-4 shadow-lg">
                            <Calculator size={18} />
                            Offerte Aanvragen
                        </button>
                    </div>
                </div>

                {/* Assistance Box */}
                <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm flex items-start gap-4">
                    <div className="bg-hett-brown/10 p-3 rounded-full text-hett-brown">
                        <RefreshCw size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-hett-dark text-sm mb-1">Technische hulp nodig?</h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Onze engineers berekenen graag de maximale overspanning voor uw project. Neem contact op voor een gratis advies.
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
