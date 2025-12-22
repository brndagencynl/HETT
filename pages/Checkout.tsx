
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const Checkout: React.FC = () => {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();

  const handleFinishOrder = () => {
    // Simulate order processing
    setTimeout(() => {
        clearCart();
        navigate('/order-received');
    }, 1000);
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader title="Afrekenen" description="Rond uw bestelling veilig af." image="https://picsum.photos/1200/400?random=98" />
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Customer Form */}
            <div className="lg:col-span-2">
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-black text-hett-dark mb-6 pb-4 border-b border-gray-100">Klantgegevens</h2>
                    
                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleFinishOrder(); }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Voornaam</label>
                                <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-hett-primary focus:border-transparent transition-all" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Achternaam</label>
                                <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-hett-primary focus:border-transparent transition-all" required />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">E-mailadres</label>
                            <input type="email" className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-hett-primary focus:border-transparent transition-all" required />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Telefoonnummer</label>
                            <input type="tel" className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-hett-primary focus:border-transparent transition-all" required />
                        </div>
                        
                        <h3 className="text-xl font-black text-hett-dark mt-8 mb-4 pt-6 border-t border-gray-100">Adresgegevens</h3>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Straat</label>
                            <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-hett-primary focus:border-transparent transition-all" required />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Huisnummer</label>
                                <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-hett-primary focus:border-transparent transition-all" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Postcode</label>
                                <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-hett-primary focus:border-transparent transition-all" required />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Plaats</label>
                            <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-hett-primary focus:border-transparent transition-all" required />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Land</label>
                            <select className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-hett-primary focus:border-transparent transition-all" required>
                                <option value="NL">Nederland</option>
                                <option value="BE">België</option>
                                <option value="DE">Duitsland</option>
                            </select>
                        </div>

                        {/* Submit button - mobile only */}
                        <div className="pt-6 lg:hidden">
                            <button type="submit" className="w-full bg-hett-primary text-white font-bold py-4 rounded-lg hover:bg-hett-dark transition-colors shadow-lg">
                                Bestelling plaatsen
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Order Overview */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 sticky top-32">
                    <h3 className="text-xl font-black text-hett-dark mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
                        <Package size={20} />
                        Uw bestelling
                    </h3>
                    
                    {/* Cart Items */}
                    <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                        {cart.map((item, idx) => (
                            <div key={idx} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                                <div className="w-16 h-16 bg-gray-50 rounded-md overflow-hidden flex-shrink-0 border border-gray-100">
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-gray-800 mb-1">{item.title}</h4>
                                    {item.details && item.details.length > 0 ? (
                                        <div className="text-xs text-gray-500 space-y-0.5">
                                            {item.details.slice(0, 2).map((detail, i) => (
                                                <div key={i}>{detail.label}: {detail.value}</div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-gray-500">
                                            {item.selectedSize && <div>Afmeting: {item.selectedSize}</div>}
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-xs text-gray-500">Aantal: {item.quantity}</span>
                                        <span className="font-bold text-sm text-hett-dark">€ {item.totalPrice.toLocaleString()},-</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Price Summary */}
                    <div className="space-y-3 mb-6 pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-gray-600 text-sm">
                            <span className="font-medium">Subtotaal</span>
                            <span className="font-bold">€ {total.toLocaleString()},-</span>
                        </div>
                        <div className="flex justify-between text-gray-600 text-sm">
                            <span className="font-medium">Verzending</span>
                            <span className="text-green-600 font-bold">Gratis</span>
                        </div>
                        <div className="flex justify-between text-gray-600 text-sm">
                            <span className="font-medium">BTW (21%)</span>
                            <span className="font-bold">Inclusief</span>
                        </div>
                    </div>
                    
                    {/* Total */}
                    <div className="pt-4 border-t-2 border-gray-200 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-700">Totaal</span>
                            <span className="text-2xl font-black text-hett-dark">€ {total.toLocaleString()},-</span>
                        </div>
                    </div>
                    
                    {/* Submit button - desktop only */}
                    <button 
                        onClick={handleFinishOrder}
                        className="hidden lg:block w-full bg-hett-primary text-white font-bold py-4 rounded-lg hover:bg-hett-dark transition-colors shadow-lg"
                    >
                        Bestelling plaatsen
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
