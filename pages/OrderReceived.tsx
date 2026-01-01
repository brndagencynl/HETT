
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Download } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const OrderReceived: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title="Bestelling Ontvangen"
        subtitle="Bevestiging"
        description="Bedankt voor uw bestelling. We gaan direct voor u aan de slag."
        image="https://picsum.photos/1200/600?random=order"
      />

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Success Card */}
        <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 overflow-hidden text-center p-12">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
                <CheckCircle size={40} strokeWidth={3} />
            </div>
            
            <h2 className="text-3xl font-black text-hett-dark mb-4">Bedankt voor uw bestelling!</h2>
            <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto">
                Uw bestelling <span className="font-bold text-hett-dark">#12345</span> is succesvol ontvangen en wordt verwerkt. We hebben een bevestiging gestuurd naar <span className="font-bold text-hett-dark">jan@example.com</span>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
                <div className="bg-gray-50 p-6 rounded-2xl">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Ordernummer</span>
                    <span className="font-bold text-lg text-hett-dark">#12345</span>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Datum</span>
                    <span className="font-bold text-lg text-hett-dark">26 Mei 2024</span>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Totaal</span>
                    <span className="font-bold text-lg text-hett-dark">€ 2.244,00</span>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row gap-4 justify-center">
                <Link to="/my-account" className="inline-flex items-center justify-center gap-2 bg-white border-2 border-hett-dark text-hett-dark px-8 py-4 rounded-full font-bold hover:bg-gray-50 transition-colors">
                    <Package size={20} /> Bekijk bestelling
                </Link>
                <Link to="/" className="inline-flex items-center justify-center gap-2 bg-hett-dark text-white px-8 py-4 rounded-full font-bold hover:bg-hett-brown transition-colors shadow-lg">
                    Verder winkelen <ArrowRight size={20} />
                </Link>
            </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
            Heeft u vragen? Neem contact op via <a href="tel:0401234567" className="text-hett-dark font-bold hover:underline">040 - 123 4567</a> of <a href="mailto:info@hett.nl" className="text-hett-dark font-bold hover:underline">info@hett.nl</a>
        </p>

      </div>
    </div>
  );
};

export default OrderReceived;
