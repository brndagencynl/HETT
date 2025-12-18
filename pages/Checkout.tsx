
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

const Checkout: React.FC = () => {
  const { total, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleFinishOrder = () => {
    // Simulate order processing
    setTimeout(() => {
        clearCart();
        navigate('/order-received');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader title="Afrekenen" description="Rond uw bestelling veilig af." image="https://picsum.photos/1200/400?random=98" />
      
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-100">
            
            <div className="flex mb-12 border-b border-gray-100 pb-6">
                <div className={`mr-8 font-bold ${step >= 1 ? 'text-hett-brown' : 'text-gray-300'}`}>1. Gegevens</div>
                <div className={`mr-8 font-bold ${step >= 2 ? 'text-hett-brown' : 'text-gray-300'}`}>2. Verzending</div>
                <div className={`font-bold ${step >= 3 ? 'text-hett-brown' : 'text-gray-300'}`}>3. Betaling</div>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleFinishOrder(); }}>
                <div className="grid grid-cols-2 gap-6">
                    <input type="text" placeholder="Voornaam" className="w-full px-5 py-4 border border-gray-200 rounded-lg bg-gray-50" required />
                    <input type="text" placeholder="Achternaam" className="w-full px-5 py-4 border border-gray-200 rounded-lg bg-gray-50" required />
                </div>
                <input type="email" placeholder="E-mailadres" className="w-full px-5 py-4 border border-gray-200 rounded-lg bg-gray-50" required />
                <input type="text" placeholder="Straat + Huisnummer" className="w-full px-5 py-4 border border-gray-200 rounded-lg bg-gray-50" required />
                <div className="grid grid-cols-2 gap-6">
                    <input type="text" placeholder="Postcode" className="w-full px-5 py-4 border border-gray-200 rounded-lg bg-gray-50" required />
                    <input type="text" placeholder="Plaats" className="w-full px-5 py-4 border border-gray-200 rounded-lg bg-gray-50" required />
                </div>

                <div className="pt-8 mt-8 border-t border-gray-100">
                    <button type="submit" className="w-full bg-hett-dark text-white font-bold py-5 rounded-lg hover:bg-hett-brown transition-colors">
                        Bestelling afronden (€{total},-)
                    </button>
                </div>
            </form>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
