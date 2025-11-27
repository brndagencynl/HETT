
import React, { useState } from 'react';
import { Check, Calculator, RefreshCw, Plus, Minus, Box } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Link } from 'react-router-dom';

const Configurator: React.FC = () => {
  // State for the Offer Request
  const [length, setLength] = useState<number>(2500); // Default to first option
  const [quantity, setQuantity] = useState<number>(1);
  const [color, setColor] = useState<{name: string, ral: string, hex: string}>({ name: 'Antraciet', ral: 'RAL 7016', hex: '#293133' });
  const [uProfileCount, setUProfileCount] = useState<number>(0);

  // Constants
  const PRODUCT_NAME = "K-Roc KS1000 RH Gevelpaneel";
  const FIXED_WIDTH = 1000; // mm
  
  const lengthOptions = [2500, 3000, 3500, 4000, 4500, 5000];
  
  const colors = [
    { name: 'Antraciet', ral: 'RAL 7016', hex: '#293133' },
    { name: 'Crèmewit', ral: 'RAL 9001', hex: '#FDF4E3' },
    { name: 'Gitzwart', ral: 'RAL 9005', hex: '#0E0E10' }
  ];

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const handleProfileChange = (delta: number) => {
    setUProfileCount(prev => Math.max(0, prev + delta));
  };

  return (
    <div className="min-h-screen bg-hett-light">
      
      {/* Header */}
      <PageHeader 
        title="Offerte Aanvragen"
        subtitle="Configurator"
        description="Stel uw order samen en ontvang binnen 24 uur een scherpe offerte op maat. Geen directe prijzen, volledig vrijblijvend."
        image="https://picsum.photos/1200/800?random=8"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Section */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* STEP 1: Product Selection */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-hett-dark mb-6 flex items-center">
                <span className="w-10 h-10 bg-hett-brown text-white rounded-full flex items-center justify-center text-base font-bold mr-4">1</span>
                Productkeuze
              </h2>
              
              <div className="p-5 rounded-2xl border-2 border-hett-brown bg-orange-50/50 flex items-center justify-between">
                <div>
                    <span className="font-bold text-hett-dark capitalize text-lg block">{PRODUCT_NAME}</span>
                    <span className="text-sm text-gray-500">Hoogwaardig steenwol sandwichpaneel</span>
                </div>
                <Check size={24} className="text-hett-brown" />
              </div>
            </div>

            {/* STEP 2: Dimensions & Quantity */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-hett-dark mb-6 flex items-center">
                <span className="w-10 h-10 bg-hett-brown text-white rounded-full flex items-center justify-center text-base font-bold mr-4">2</span>
                Afmetingen & Aantal
              </h2>
              
              <div className="space-y-8">
                  {/* Width (Fixed) */}
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Werkende Breedte</label>
                      <div className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-bold">
                          {FIXED_WIDTH} mm (Standaard)
                      </div>
                  </div>

                  {/* Length Selection */}
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Kies Lengte (mm)</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {lengthOptions.map((opt) => (
                              <button
                                key={opt}
                                onClick={() => setLength(opt)}
                                className={`py-3 px-4 rounded-xl font-bold text-sm transition-all border-2 ${
                                    length === opt 
                                    ? 'border-hett-brown bg-hett-brown text-white shadow-md' 
                                    : 'border-gray-100 bg-white text-gray-700 hover:border-gray-300'
                                }`}
                              >
                                  {opt} mm
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Quantity Counter */}
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Aantal Panelen</label>
                      <div className="inline-flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200">
                          <button 
                            onClick={() => handleQuantityChange(-1)}
                            className="w-12 h-12 flex items-center justify-center bg-white rounded-lg text-hett-dark hover:text-hett-brown shadow-sm transition-colors disabled:opacity-50"
                            disabled={quantity <= 1}
                          >
                              <Minus size={20} />
                          </button>
                          <div className="w-20 text-center font-bold text-xl text-hett-dark">
                              {quantity}
                          </div>
                          <button 
                            onClick={() => handleQuantityChange(1)}
                            className="w-12 h-12 flex items-center justify-center bg-white rounded-lg text-hett-dark hover:text-hett-brown shadow-sm transition-colors"
                          >
                              <Plus size={20} />
                          </button>
                      </div>
                  </div>
              </div>
            </div>

            {/* STEP 3: Color */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-hett-dark mb-6 flex items-center">
                <span className="w-10 h-10 bg-hett-brown text-white rounded-full flex items-center justify-center text-base font-bold mr-4">3</span>
                Kleur
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {colors.map((c) => (
                  <button
                    key={c.ral}
                    onClick={() => setColor(c)}
                    className={`group relative p-1.5 rounded-2xl border-2 transition-all ${
                      color.ral === c.ral ? 'border-hett-brown' : 'border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-full h-24 rounded-xl mb-3 shadow-inner relative overflow-hidden" style={{ backgroundColor: c.hex }}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-white/10"></div>
                        {color.ral === c.ral && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/20 backdrop-blur-md p-2 rounded-full shadow-sm">
                                    <Check className="text-white drop-shadow-md" size={24} strokeWidth={3} />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="text-center">
                        <span className="block text-sm font-bold text-gray-800">{c.name}</span>
                        <span className="block text-xs text-gray-400 font-medium">{c.ral}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 4: Extras */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-hett-dark mb-6 flex items-center">
                <span className="w-10 h-10 bg-hett-brown text-white rounded-full flex items-center justify-center text-base font-bold mr-4">4</span>
                Extra's
              </h2>
              
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-hett-dark shadow-sm">
                          <Box size={24} />
                      </div>
                      <div>
                          <h4 className="font-bold text-hett-dark">U-Profielen</h4>
                          <p className="text-xs text-gray-500">Afwerkprofiel voor montage (per meter)</p>
                      </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleProfileChange(-1)}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-gray-200 text-gray-500 hover:text-hett-dark hover:border-hett-dark transition-colors"
                        disabled={uProfileCount <= 0}
                      >
                          <Minus size={16} />
                      </button>
                      <div className="w-12 text-center font-bold text-lg text-hett-dark">
                          {uProfileCount}
                      </div>
                      <button 
                        onClick={() => handleProfileChange(1)}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-gray-200 text-gray-500 hover:text-hett-dark hover:border-hett-dark transition-colors"
                      >
                          <Plus size={16} />
                      </button>
                  </div>
              </div>
            </div>

          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
                
                {/* Summary Card */}
                <div className="bg-hett-dark text-white rounded-[32px] shadow-2xl overflow-hidden p-8 border border-gray-800">
                        <h3 className="text-2xl font-bold mb-6">Uw Aanvraag</h3>
                        
                        <div className="space-y-4 mb-8">
                            <div>
                                <span className="text-xs text-gray-400 block uppercase tracking-wider mb-1">Product</span>
                                <span className="font-bold text-lg text-white">{PRODUCT_NAME}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-gray-400 block uppercase tracking-wider mb-1">Kleur</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: color.hex }}></div>
                                        <span className="font-bold text-sm text-white">{color.name}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 block uppercase tracking-wider mb-1">Afmeting</span>
                                    <span className="font-bold text-sm text-white">{FIXED_WIDTH} x {length}mm</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400 text-sm">Aantal panelen</span>
                                    <span className="font-bold text-white text-lg">{quantity}x</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Totaal oppervlak</span>
                                    <span className="font-bold text-hett-brown text-lg">{((FIXED_WIDTH * length * quantity) / 1000000).toFixed(2)} m²</span>
                                </div>
                            </div>

                            {uProfileCount > 0 && (
                                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">U-Profielen</span>
                                    <span className="font-bold text-white">{uProfileCount} meter</span>
                                </div>
                            )}
                        </div>

                        <Link to="/contact" className="block w-full bg-white text-hett-dark font-black uppercase tracking-wide py-5 rounded-2xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-lg mb-4 text-center">
                            <Calculator size={20} className="text-hett-brown" />
                            Offerte Aanvragen
                        </Link>
                        
                        <p className="text-center text-xs text-gray-500">
                            Geen betalingsverplichting • Antwoord binnen 24u
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
                            Twijfelt u over de aantallen of afmetingen? Onze specialisten kijken graag met u mee.
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
