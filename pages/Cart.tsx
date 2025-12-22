
import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, Plus, Minus, ShoppingBag } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const Cart: React.FC = () => {
  const { cart, removeFromCart, total } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#f6f8fa] font-sans">
        <PageHeader title="Winkelwagen" description="Uw winkelwagen is nog leeg." image="https://picsum.photos/1200/400?random=99" />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <ShoppingBag size={64} className="mx-auto mb-6 text-gray-300" />
            <h2 className="text-2xl font-bold text-hett-dark mb-4">Je winkelwagen is leeg</h2>
            <p className="text-gray-500 mb-8">Voeg producten toe om te beginnen met winkelen.</p>
            <Link to="/shop" className="inline-block bg-hett-primary text-white px-8 py-4 rounded-lg font-bold hover:bg-hett-dark transition-colors">
              Verder winkelen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader title="Winkelwagen" description="Controleer uw bestelling." image="https://picsum.photos/1200/400?random=99" />
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
                {cart.map((item, idx) => (
                    <div key={idx} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex gap-4">
                            {/* Image */}
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-hett-dark text-base md:text-lg pr-4">{item.title}</h3>
                                    <button 
                                        onClick={() => removeFromCart(idx)} 
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        title="Verwijderen"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                
                                {/* Configuration details */}
                                {item.details && item.details.length > 0 ? (
                                    <div className="text-xs text-gray-600 mt-2 space-y-1 bg-gray-50 p-3 rounded-md border border-gray-200">
                                        {item.details.map((detail, i) => (
                                            <div key={i} className="flex justify-between gap-4">
                                                <span className="font-medium text-gray-500">{detail.label}:</span>
                                                <span className="font-semibold text-gray-700">{detail.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500 space-y-0.5">
                                        {item.selectedSize && <p>Afmeting: {item.selectedSize}</p>}
                                        {item.selectedColor && <p>Kleur: {item.selectedColor}</p>}
                                        {item.selectedRoof && <p>Dak: {item.selectedRoof}</p>}
                                    </div>
                                )}

                                {/* Price and quantity */}
                                <div className="flex justify-between items-center mt-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">Aantal:</span>
                                        <span className="font-bold text-sm bg-gray-100 px-3 py-1 rounded">{item.quantity}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-lg text-hett-dark">€ {item.totalPrice.toLocaleString()},-</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 sticky top-32">
                    <h3 className="text-xl font-black text-hett-dark mb-6 pb-4 border-b border-gray-100">Overzicht</h3>
                    
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-gray-600">
                            <span className="font-medium">Subtotaal</span>
                            <span className="font-bold">€ {total.toLocaleString()},-</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span className="font-medium">Verzending</span>
                            <span className="text-green-600 font-bold">Gratis</span>
                        </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-100 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-700">Totaal</span>
                            <span className="text-2xl font-black text-hett-dark">€ {total.toLocaleString()},-</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Inclusief BTW</p>
                    </div>
                    
                    <div className="space-y-3">
                        <Link 
                            to="/afrekenen" 
                            className="block w-full bg-hett-primary text-white text-center font-bold py-4 rounded-lg hover:bg-hett-dark transition-colors shadow-lg flex items-center justify-center gap-2"
                        >
                            Naar afrekenen <ArrowRight size={20} />
                        </Link>
                        <Link 
                            to="/shop" 
                            className="block w-full bg-white border-2 border-gray-200 text-gray-700 text-center font-bold py-3 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            Verder winkelen
                        </Link>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;
