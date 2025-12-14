
import React, { useState, useEffect } from 'react';
import { Check, Calculator, RefreshCw, Plus, Minus, Box, Building2, User, Phone, Mail, MapPin, Globe } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Link } from 'react-router-dom';

const Configurator: React.FC = () => {
  // Configuration State
  const [length, setLength] = useState<number>(2500);
  const [quantity, setQuantity] = useState<number>(1);
  const [color, setColor] = useState<{name: string, ral: string, hex: string}>({ name: 'Antraciet', ral: 'RAL 7016', hex: '#293133' });
  const [uProfileCount, setUProfileCount] = useState<number>(0);

  // Form State
  const [form, setForm] = useState({
    companyName: '',
    kvk: '',
    btw: '',
    website: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    zip: '',
    city: '',
    country: 'Nederland'
  });
  
  const [isFormValid, setIsFormValid] = useState(false);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Validation Logic
  useEffect(() => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    const isValid = 
        form.firstName.trim() !== '' &&
        form.lastName.trim() !== '' &&
        form.phone.trim() !== '' &&
        form.address.trim() !== '' &&
        form.zip.trim() !== '' &&
        form.city.trim() !== '' &&
        isValidEmail;
    
    setIsFormValid(isValid);
  }, [form]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const configData = {
        product: PRODUCT_NAME,
        width: FIXED_WIDTH,
        length,
        quantity,
        color: color.name,
        uProfiles: uProfileCount,
        totalSurface: ((FIXED_WIDTH * length * quantity) / 1000000).toFixed(2) + ' m²'
    };

    console.log('--- NIEUWE OFFERTE AANVRAAG ---');
    console.log('GEGEVENS:', form);
    console.log('CONFIGURATIE:', configData);
    
    alert('Bedankt! Uw aanvraag is verstuurd.');
  };

  return (
    <div className="min-h-screen bg-hett-light">
      
      {/* Header */}
      <PageHeader 
        title="Offerte Aanvragen"
        subtitle="Configurator"
        description="Stel uw order samen en vul uw gegevens in. U ontvangt binnen 24 uur een scherpe offerte op maat."
        image="https://picsum.photos/1200/800?random=8"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            
            {/* LEFT COLUMN: Configuration */}
            <div className="space-y-8">
                <h2 className="text-2xl font-black text-hett-dark mb-6">1. Configuratie</h2>

                {/* Product Selection */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-hett-dark mb-4">Product</h3>
                    <div className="p-5 rounded-2xl border-2 border-hett-brown bg-orange-50/50 flex items-center justify-between">
                        <div>
                            <span className="font-bold text-hett-dark capitalize text-lg block">{PRODUCT_NAME}</span>
                            <span className="text-sm text-gray-500">Hoogwaardig steenwol sandwichpaneel</span>
                        </div>
                        <Check size={24} className="text-hett-brown" />
                    </div>
                </div>

                {/* Dimensions & Quantity */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-hett-dark mb-6">Afmetingen & Aantal</h3>
                    
                    <div className="space-y-6">
                        {/* Width */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Werkende Breedte</label>
                            <div className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-500 font-bold">
                                {FIXED_WIDTH} mm (Standaard)
                            </div>
                        </div>

                        {/* Length Selection */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Kies Lengte (mm)</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {lengthOptions.map((opt) => (
                                    <button
                                        type="button"
                                        key={opt}
                                        onClick={() => setLength(opt)}
                                        className={`py-3 px-2 rounded-2xl font-bold text-sm transition-all border-2 ${
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

                        {/* Quantity */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Aantal Panelen</label>
                            <div className="inline-flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-200 w-full sm:w-auto">
                                <button 
                                    type="button"
                                    onClick={() => handleQuantityChange(-1)}
                                    className="w-12 h-12 flex items-center justify-center bg-white rounded-xl text-hett-dark hover:text-hett-brown shadow-sm transition-colors disabled:opacity-50"
                                    disabled={quantity <= 1}
                                >
                                    <Minus size={20} />
                                </button>
                                <div className="flex-grow sm:w-24 text-center font-bold text-xl text-hett-dark">
                                    {quantity}
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => handleQuantityChange(1)}
                                    className="w-12 h-12 flex items-center justify-center bg-white rounded-xl text-hett-dark hover:text-hett-brown shadow-sm transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Color */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-hett-dark mb-6">Kleur</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {colors.map((c) => (
                        <button
                            type="button"
                            key={c.ral}
                            onClick={() => setColor(c)}
                            className={`group relative p-1.5 rounded-2xl border-2 transition-all ${
                            color.ral === c.ral ? 'border-hett-brown' : 'border-transparent hover:bg-gray-50'
                            }`}
                        >
                            <div className="w-full h-16 rounded-2xl mb-2 shadow-inner relative overflow-hidden" style={{ backgroundColor: c.hex }}>
                                <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-white/10"></div>
                                {color.ral === c.ral && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-full shadow-sm">
                                            <Check className="text-white drop-shadow-md" size={16} strokeWidth={3} />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="text-center">
                                <span className="block text-xs font-bold text-gray-800">{c.name}</span>
                                <span className="block text-[10px] text-gray-400 font-medium">{c.ral}</span>
                            </div>
                        </button>
                        ))}
                    </div>
                </div>

                {/* Extras */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-hett-dark mb-6">Extra's</h3>
                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-hett-dark shadow-sm">
                                <Box size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-hett-dark">U-Profielen</h4>
                                <p className="text-xs text-gray-500">Per meter</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button 
                                type="button"
                                onClick={() => handleProfileChange(-1)}
                                className="w-8 h-8 flex items-center justify-center bg-white rounded-xl border border-gray-200 text-gray-500 hover:text-hett-dark hover:border-hett-dark transition-colors"
                                disabled={uProfileCount <= 0}
                            >
                                <Minus size={14} />
                            </button>
                            <div className="w-10 text-center font-bold text-base text-hett-dark">
                                {uProfileCount}
                            </div>
                            <button 
                                type="button"
                                onClick={() => handleProfileChange(1)}
                                className="w-8 h-8 flex items-center justify-center bg-white rounded-xl border border-gray-200 text-gray-500 hover:text-hett-dark hover:border-hett-dark transition-colors"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Contact Information */}
            <div className="space-y-8">
                <h2 className="text-2xl font-black text-hett-dark mb-6">2. Gegevens</h2>
                
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 h-full">
                    <div className="space-y-8">
                        
                        {/* Bedrijfsgegevens */}
                        <div>
                            <h3 className="text-sm font-bold text-hett-dark uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Bedrijfsgegevens</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Bedrijfsnaam</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" name="companyName" value={form.companyName} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm" placeholder="Optioneel" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">KvK Nummer</label>
                                        <input type="text" name="kvk" value={form.kvk} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm" placeholder="KvK" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">BTW Nummer</label>
                                        <input type="text" name="btw" value={form.btw} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm" placeholder="BTW" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Website</label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" name="website" value={form.website} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm" placeholder="www.uwbedrijf.nl" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contactpersoon */}
                        <div>
                            <h3 className="text-sm font-bold text-hett-dark uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Contactpersoon</h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Voornaam <span className="text-red-500">*</span></label>
                                    <input type="text" name="firstName" value={form.firstName} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm" placeholder="Voornaam" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Achternaam <span className="text-red-500">*</span></label>
                                    <input type="text" name="lastName" value={form.lastName} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm" placeholder="Achternaam" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Telefoon <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="tel" name="phone" value={form.phone} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm" placeholder="06 12345678" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">E-mailadres <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="email" name="email" value={form.email} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm" placeholder="naam@bedrijf.nl" required />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Adres */}
                        <div>
                            <h3 className="text-sm font-bold text-hett-dark uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Adres</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Straat + Huisnummer <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" name="address" value={form.address} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm" placeholder="Straatnaam 123" required />
                                    </div>
                                </div>
                                <div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Postcode <span className="text-red-500">*</span></label>
                                            <input type="text" name="zip" value={form.zip} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm" placeholder="1234 AB" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Plaats <span className="text-red-500">*</span></label>
                                            <input type="text" name="city" value={form.city} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm" placeholder="Plaats" required />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Land</label>
                                    <select name="country" value={form.country} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm appearance-none">
                                        <option>Nederland</option>
                                        <option>België</option>
                                        <option>Duitsland</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            </div>

            {/* BOTTOM: Full Width Summary & Submit */}
            <div className="bg-hett-dark rounded-[32px] text-white p-8 lg:p-12 shadow-2xl relative overflow-hidden">
                {/* Abstract decorative circles */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                
                <h2 className="text-3xl font-black mb-8 relative z-10">Uw Aanvraag</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 relative z-10 text-sm">
                    <div>
                        <span className="block text-gray-400 uppercase tracking-wider text-xs mb-1">Product</span>
                        <strong className="text-lg block">{PRODUCT_NAME}</strong>
                        <span className="text-gray-400">{color.name}</span>
                    </div>
                    <div>
                        <span className="block text-gray-400 uppercase tracking-wider text-xs mb-1">Afmeting</span>
                        <strong className="text-lg block">{quantity}x {length}mm</strong>
                        <span className="text-gray-400">Breedte: {FIXED_WIDTH}mm</span>
                    </div>
                    <div>
                        <span className="block text-gray-400 uppercase tracking-wider text-xs mb-1">Totalen</span>
                        <strong className="text-lg block">{((FIXED_WIDTH * length * quantity) / 1000000).toFixed(2)} m²</strong>
                        <span className="text-gray-400">{uProfileCount > 0 ? `${uProfileCount}m U-profiel` : 'Geen extra\'s'}</span>
                    </div>
                    <div className="flex flex-col justify-end">
                        <button 
                            type="submit"
                            disabled={!isFormValid}
                            className={`w-full bg-white text-hett-dark font-black uppercase tracking-wide py-4 rounded-full flex items-center justify-center gap-3 shadow-lg transition-all ${
                                isFormValid ? 'hover:bg-hett-brown hover:text-white cursor-pointer transform hover:-translate-y-1' : 'opacity-50 cursor-not-allowed'
                            }`}
                        >
                            <Calculator size={20} />
                            Offerte Aanvragen
                        </button>
                        {!isFormValid && (
                            <span className="text-xs text-red-300 mt-2 text-center block">Vul alle verplichte velden in</span>
                        )}
                    </div>
                </div>
                
                <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 relative z-10">
                    <p>Geen betalingsverplichting • U ontvangt binnen 24u een offerte</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <span className="flex items-center gap-1"><Check size={14} className="text-green-500" /> Veilig verzonden</span>
                        <span className="flex items-center gap-1"><Check size={14} className="text-green-500" /> Privacy gewaarborgd</span>
                    </div>
                </div>
            </div>

        </form>
      </div>
    </div>
  );
};

export default Configurator;
