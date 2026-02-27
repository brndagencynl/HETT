
import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Check, Minus, Plus } from 'lucide-react';
import { formatEUR, mulCents, toCents } from '../src/utils/money';
import { useTranslation } from 'react-i18next';

interface ProductConfiguratorProps {
  product: Product;
}

const ProductConfigurator: React.FC<ProductConfiguratorProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  
  // Initialize state with first option if available
  const [selectedColor, setSelectedColor] = useState(product.options?.colors?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(product.options?.sizes?.[0] || '');
  const [selectedRoof, setSelectedRoof] = useState(product.options?.roofTypes?.[0] || '');

  const handleAddToCart = () => {
    addToCart(product, quantity, {
      color: selectedColor,
      size: selectedSize,
      roof: selectedRoof
    });
    // Optional: Show feedback could go here, but context handles state.
    alert('Product toegevoegd aan winkelwagen!');
  };

  return (
    <div className="bg-white p-8 rounded-[32px] shadow-lg border border-gray-100 sticky top-32">
        <h3 className="text-2xl font-black text-hett-dark mb-6">{t('configurator.title')}</h3>

        {/* Price Display */}
        <div className="flex items-end gap-2 mb-8 pb-8 border-b border-gray-100">
                        <span className="text-4xl font-black text-hett-dark">
                            {formatEUR(mulCents(product.priceCents ?? toCents(product.price), quantity), 'cents')}
                        </span>
            <span className="text-gray-400 font-medium mb-2">{t('configurator.exclAssembly')}</span>
        </div>

        <div className="space-y-6 mb-8">
            
            {/* Dimensions */}
            {product.options?.sizes && (
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t('configurator.dimension')}</label>
                    <select 
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-hett-dark focus:border-hett-brown outline-none appearance-none"
                    >
                        {product.options.sizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Colors */}
            {product.options?.colors && (
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t('configurator.colorProfiles')}</label>
                    <div className="grid grid-cols-3 gap-3">
                        {product.options.colors.map(color => (
                            <button
                                key={color}
                                onClick={() => setSelectedColor(color)}
                                className={`py-3 px-2 rounded-xl text-sm font-bold border-2 transition-all ${
                                    selectedColor === color 
                                    ? 'border-hett-brown bg-hett-brown text-white' 
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                {color}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Roof Type */}
            {product.options?.roofTypes && (
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t('configurator.roofType')}</label>
                    <div className="space-y-2">
                        {product.options.roofTypes.map(roof => (
                            <button
                                key={roof}
                                onClick={() => setSelectedRoof(roof)}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                                    selectedRoof === roof
                                    ? 'border-hett-brown bg-orange-50/50'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            >
                                <span className={`font-bold ${selectedRoof === roof ? 'text-hett-dark' : 'text-gray-600'}`}>{roof}</span>
                                {selectedRoof === roof && <Check size={20} className="text-hett-brown" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Quantity */}
            <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t('common.quantity')}</label>
                 <div className="flex items-center gap-4">
                    <div className="inline-flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200">
                        <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-12 h-12 flex items-center justify-center bg-white rounded-lg text-hett-dark shadow-sm hover:text-hett-brown transition-colors"
                        >
                            <Minus size={20} />
                        </button>
                        <div className="w-16 text-center font-bold text-xl text-hett-dark">
                            {quantity}
                        </div>
                        <button 
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-12 h-12 flex items-center justify-center bg-white rounded-lg text-hett-dark shadow-sm hover:text-hett-brown transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                 </div>
            </div>

        </div>

        <button 
            onClick={handleAddToCart}
            className="w-full bg-hett-dark text-white font-black uppercase tracking-wide py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:bg-hett-brown transition-all transform hover:-translate-y-1"
        >
            <ShoppingBag size={20} />
            {t('configurator.addToCart')}
        </button>
        
        <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
                {t('configurator.deliveryNote')}
            </p>
        </div>
    </div>
  );
};

export default ProductConfigurator;
