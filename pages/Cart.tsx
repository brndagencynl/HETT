
import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const Cart: React.FC = () => {
  const { cart, removeFromCart, total } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#f6f8fa] font-sans">
        <PageHeader title="Winkelwagen" description="Uw winkelwagen is nog leeg." image="https://picsum.photos/1200/400?random=99" />
        <div className="text-center py-20">
            <Link to="/" className="inline-block bg-hett-dark text-white px-8 py-4 rounded-full font-bold">Verder winkelen</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader title="Winkelwagen" description="Controleer uw bestelling." image="https://picsum.photos/1200/400?random=99" />
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            <div className="lg:col-span-2 space-y-6">
                {cart.map((item, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start">
                        <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow w-full">
                            <h3 className="font-bold text-hett-dark text-lg">{item.title}</h3>
                            
                            {item.details ? (
                                <div className="text-xs text-gray-500 mt-2 space-y-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    {item.details.map((detail, i) => (
                                        <div key={i} className="flex justify-between border-b border-gray-200 last:border-0 pb-1 last:pb-0">
                                            <span className="font-medium">{detail.label}:</span>
                                            <span>{detail.value}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500 mt-1 space-y-1">
                                    <p>Afmeting: {item.selectedSize}</p>
                                    <p>Kleur: {item.selectedColor}</p>
                                    {item.selectedRoof && <p>Dak: {item.selectedRoof}</p>}
                                </div>
                            )}
                        </div>
                        <div className="text-right flex md:flex-col justify-between w-full md:w-auto items-end">
                            <div className="font-bold text-lg mb-2">€{item.totalPrice},-</div>
                            <button onClick={() => removeFromCart(idx)} className="text-red-400 hover:text-red-600 p-2">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 h-fit sticky top-32">
                <h3 className="text-xl font-bold text-hett-dark mb-6">Overzicht</h3>
                <div className="space-y-4 mb-8 border-b border-gray-100 pb-8">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotaal</span>
                        <span>€{total},-</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Verzending</span>
                        <span className="text-green-600 font-bold">Gratis</span>
                    </div>
                </div>
                <div className="flex justify-between text-xl font-black text-hett-dark mb-8">
                    <span>Totaal</span>
                    <span>€{total},-</span>
                </div>
                <Link to="/checkout" className="block w-full bg-hett-dark text-white text-center font-bold py-4 rounded-2xl hover:bg-hett-brown transition-colors shadow-lg">
                    Naar bestellen
                </Link>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;
