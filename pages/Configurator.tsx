
import React, { useState, useEffect } from 'react';
import { Check, Calculator, RefreshCw, Plus, Minus, Box, Building2, User, Phone, Mail, MapPin, Globe } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Configurator: React.FC = () => {
  const { t } = useTranslation();

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
    
    alert(t('configuratorPage.thankYou'));
  };

  return (
    <div className="min-h-screen bg-hett-light">
      
      {/* Header */}
      <PageHeader 
        title={t('configuratorPage.title')}
        subtitle="Configurator"
        description={t('configuratorPage.description')}
        image="https://picsum.photos/1200/800?random=8"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            
            {/* LEFT COLUMN: Configuration */}
            <div className="space-y-8">
                <h2 className="text-2xl font-black text-hett-dark mb-6">{t('configuratorPage.step1')}</h2>

                {/* Product Selection */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-hett-dark mb-4">{t('configuratorPage.product')}</h3>
                    <div className="p-5 rounded-lg border-2 border-hett-brown bg-orange-50/50 flex items-center justify-between">
                        <div>
                            <span className="font-bold text-hett-dark capitalize text-lg block">{PRODUCT_NAME}</span>
                            <span className="text-sm text-gray-500">{t('configuratorPage.sandwichDesc')}</span>
                        </div>
                        <Check size={24} className="text-hett-brown" />
                    </div>
                </div>

                {/* Dimensions & Quantity */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-hett-dark mb-6">{t('configuratorPage.dimensionsAndQuantity')}</h3>
                    
                    <div className="space-y-6">
                        {/* Width */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('configuratorPage.workingWidth')}</label>
                            <div className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 font-bold">
                                {FIXED_WIDTH} mm {t('configuratorPage.standard')}
                            </div>
                        </div>

                        {/* Length Selection */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('configuratorPage.chooseLength')}</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {lengthOptions.map((opt) => (
                                    <button
                                        type="button"
                                        key={opt}
                                        onClick={() => setLength(opt)}
                                        className={`py-3 px-2 rounded-lg font-bold text-sm transition-all border-2 ${
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
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('configuratorPage.panelQuantity')}</label>
                            <div className="inline-flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200 w-full sm:w-auto">
                                <button 
                                    type="button"
                                    onClick={() => handleQuantityChange(-1)}
                                    className="w-12 h-12 flex items-center justify-center bg-white rounded-md text-hett-dark hover:text-hett-brown shadow-sm transition-colors disabled:opacity-50"
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
                                    className="w-12 h-12 flex items-center justify-center bg-white rounded-md text-hett-dark hover:text-hett-brown shadow-sm transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Color */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-hett-dark mb-6">{t('configuratorPage.color')}</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {colors.map((c) => (
                        <button
                            type="button"
                            key={c.ral}
                            onClick={() => setColor(c)}
                            className={`group relative p-1.5 rounded-lg border-2 transition-all ${
                            color.ral === c.ral ? 'border-hett-brown' : 'border-transparent hover:bg-gray-50'
                            }`}
                        >
                            <div className="w-full h-16 rounded-md mb-2 shadow-inner relative overflow-hidden" style={{ backgroundColor: c.hex }}>
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
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-hett-dark mb-6">{t('configuratorPage.extras')}</h3>
                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center text-hett-dark shadow-sm">
                                <Box size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-hett-dark">{t('configuratorPage.uProfiles')}</h4>
                                <p className="text-xs text-gray-500">{t('configuratorPage.perMeter')}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button 
                                type="button"
                                onClick={() => handleProfileChange(-1)}
                                className="w-8 h-8 flex items-center justify-center bg-white rounded-md border border-gray-200 text-gray-500 hover:text-hett-dark hover:border-hett-dark transition-colors"
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
                                className="w-8 h-8 flex items-center justify-center bg-white rounded-md border border-gray-200 text-gray-500 hover:text-hett-dark hover:border-hett-dark transition-colors"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Contact Information */}
            <div className="space-y-8">
                <h2 className="text-2xl font-black text-hett-dark mb-6">{t('configuratorPage.step2')}</h2>
                
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-full">
                    <div className="space-y-8">
                        
                        {/* Bedrijfsgegevens */}
                        <div>
                            <h3 className="text-sm font-bold text-hett-dark uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">{t('configuratorPage.companyDetails')}</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">{t('configuratorPage.companyName')}</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" name="companyName" value={form.companyName} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm" placeholder={t('configuratorPage.optional')} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">{t('configuratorPage.kvkNumber')}</label>
                                        <input type="text" name="kvk" value={form.kvk} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm" placeholder={t('configuratorPage.kvkPlaceholder')} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">{t('configuratorPage.vatNumber')}</label>
                                        <input type="text" name="btw" value={form.btw} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm" placeholder={t('configuratorPage.btwPlaceholder')} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">{t('configuratorPage.website')}</label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" name="website" value={form.website} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm" placeholder={t('configuratorPage.websitePlaceholder')} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contactpersoon */}
                        <div>
                            <h3 className="text-sm font-bold text-hett-dark uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">{t('configuratorPage.contactPerson')}</h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">{t('configuratorPage.firstName')} <span className="text-red-500">*</span></label>
                                    <input type="text" name="firstName" value={form.firstName} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm" placeholder={t('configuratorPage.firstName')} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">{t('configuratorPage.lastName')} <span className="text-red-500">*</span></label>
                                    <input type="text" name="lastName" value={form.lastName} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm" placeholder={t('configuratorPage.lastName')} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">{t('configuratorPage.phone')} <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="tel" name="phone" value={form.phone} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm" placeholder={t('configuratorPage.phonePlaceholder')} required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">{t('configuratorPage.email')} <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="email" name="email" value={form.email} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm" placeholder={t('configuratorPage.emailPlaceholder')} required />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Adres */}
                        <div>
                            <h3 className="text-sm font-bold text-hett-dark uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">{t('configuratorPage.address')}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">{t('configuratorPage.streetNumber')} <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" name="address" value={form.address} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm" placeholder={t('configuratorPage.streetPlaceholder')} required />
                                    </div>
                                </div>
                                <div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">{t('configuratorPage.postalCode')} <span className="text-red-500">*</span></label>
                                            <input type="text" name="zip" value={form.zip} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm" placeholder={t('configuratorPage.postalCodePlaceholder')} required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">{t('configuratorPage.city')} <span className="text-red-500">*</span></label>
                                            <input type="text" name="city" value={form.city} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm" placeholder={t('configuratorPage.city')} required />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">{t('configuratorPage.country')}</label>
                                    <select name="country" value={form.country} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-hett-brown outline-none bg-gray-50 hover:bg-white text-sm appearance-none">
                                        <option value="Nederland">{t('configuratorPage.countries.nl')}</option>
                                        <option value="België">{t('configuratorPage.countries.be')}</option>
                                        <option value="Duitsland">{t('configuratorPage.countries.de')}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            </div>

            {/* BOTTOM: Full Width Summary & Submit */}
            <div className="bg-hett-dark rounded-xl text-white p-8 lg:p-12 shadow-xl relative overflow-hidden">
                {/* Abstract decorative circles */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                
                <h2 className="text-3xl font-black mb-8 relative z-10">{t('configuratorPage.yourRequest')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 relative z-10 text-sm">
                    <div>
                        <span className="block text-gray-400 uppercase tracking-wider text-xs mb-1">{t('configuratorPage.product')}</span>
                        <strong className="text-lg block">{PRODUCT_NAME}</strong>
                        <span className="text-gray-400">{color.name}</span>
                    </div>
                    <div>
                        <span className="block text-gray-400 uppercase tracking-wider text-xs mb-1">{t('configuratorPage.dimension')}</span>
                        <strong className="text-lg block">{quantity}x {length}mm</strong>
                        <span className="text-gray-400">{t('configuratorPage.widthLabel')} {FIXED_WIDTH}mm</span>
                    </div>
                    <div>
                        <span className="block text-gray-400 uppercase tracking-wider text-xs mb-1">{t('configuratorPage.totals')}</span>
                        <strong className="text-lg block">{((FIXED_WIDTH * length * quantity) / 1000000).toFixed(2)} m²</strong>
                        <span className="text-gray-400">{uProfileCount > 0 ? t('configuratorPage.uProfileSummary', { count: uProfileCount }) : t('configuratorPage.noExtras')}</span>
                    </div>
                    <div className="flex flex-col justify-end">
                        <button 
                            type="submit"
                            disabled={!isFormValid}
                            className={`w-full bg-white text-hett-dark font-black uppercase tracking-wide py-4 rounded-lg flex items-center justify-center gap-3 shadow-lg transition-all ${
                                isFormValid ? 'hover:bg-hett-brown hover:text-white cursor-pointer transform hover:-translate-y-1' : 'opacity-50 cursor-not-allowed'
                            }`}
                        >
                            <Calculator size={20} />
                            {t('configuratorPage.submitQuote')}
                        </button>
                        {!isFormValid && (
                            <span className="text-xs text-red-300 mt-2 text-center block">{t('configuratorPage.fillRequired')}</span>
                        )}
                    </div>
                </div>
                
                <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 relative z-10">
                    <p>{t('configuratorPage.noPaymentObligation')}</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <span className="flex items-center gap-1"><Check size={14} className="text-green-500" /> {t('configuratorPage.secureSend')}</span>
                        <span className="flex items-center gap-1"><Check size={14} className="text-green-500" /> {t('configuratorPage.privacyGuaranteed')}</span>
                    </div>
                </div>
            </div>

        </form>
      </div>
    </div>
  );
};

export default Configurator;
