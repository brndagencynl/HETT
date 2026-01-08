
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Box, TrendingUp, Check, Phone } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const Dealers: React.FC = () => {
  return (
    <div className="min-h-screen bg-hett-light">
      
      {/* Header */}
      <PageHeader 
        title="Zakelijk & Partners"
        subtitle="Samenwerken"
        description="Profiteer van onze zakelijke voordelen, staffelkortingen en snelle levering. Speciaal voor montagebedrijven en wederverkopers."
        image="https://picsum.photos/1200/800?random=2"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* CTA Column (Replaces Login) */}
            <div className="lg:col-span-5 order-2 lg:order-1">
                <div className="bg-white p-8 rounded-[24px] shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="text-hett-dark" size={24} />
                        <h2 className="text-2xl font-bold text-gray-900">Partner worden?</h2>
                    </div>
                    
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Bent u actief als verandabouwer, aannemer of zzp'er in de buitenleven branche? 
                        Meld u aan als HETT-partner en profiteer direct van onze zakelijke condities.
                    </p>
                    
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3">
                             <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                                <Check size={14} strokeWidth={3} />
                             </div>
                             <span className="text-gray-700 font-medium">Directe inkoopkorting</span>
                        </li>
                        <li className="flex items-center gap-3">
                             <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                                <Check size={14} strokeWidth={3} />
                             </div>
                             <span className="text-gray-700 font-medium">Op rekening betalen</span>
                        </li>
                        <li className="flex items-center gap-3">
                             <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                                <Check size={14} strokeWidth={3} />
                             </div>
                             <span className="text-gray-700 font-medium">Prioriteit bij levering</span>
                        </li>
                        <li className="flex items-center gap-3">
                             <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                                <Check size={14} strokeWidth={3} />
                             </div>
                             <span className="text-gray-700 font-medium">Technische ondersteuning</span>
                        </li>
                    </ul>

                    <Link to="/contact" className="block w-full bg-hett-dark text-white text-center font-bold uppercase tracking-wide py-4 rounded-xl hover:bg-hett-brown transition-colors shadow-md">
                        Contact opnemen
                    </Link>
                    
                    <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-sm">
                        <Phone size={16} />
                        <span>Of bel direct:</span>
                        <a href="tel:+31685406033" className="font-bold text-hett-dark hover:underline">+31 (0)6 85 40 60 33</a>
                    </div>
                </div>
            </div>

            {/* Info Column */}
            <div className="lg:col-span-7 order-1 lg:order-2">
                <h3 className="text-2xl font-bold text-hett-dark mb-8">Waarom HETT Dealer worden?</h3>
                
                <div className="grid gap-8">
                    <div className="flex gap-4 group">
                        <div className="w-12 h-12 bg-white text-hett-brown border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:border-hett-brown transition-colors shadow-sm">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Scherpe inkoopcondities</h4>
                            <p className="text-gray-600 leading-relaxed">
                                Als geregistreerde partner profiteert u van staffelkortingen en vaste prijsafspraken. Hoe meer u afneemt, hoe hoger uw marge.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 group">
                        <div className="w-12 h-12 bg-white text-hett-brown border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:border-hett-brown transition-colors shadow-sm">
                            <Box size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Voorraad & Logistiek</h4>
                            <p className="text-gray-600 leading-relaxed">
                                Wij houden voorraad zodat u dat niet hoeft te doen. Vandaag besteld voor 12:00 uur, vaak binnen 48 uur op de bouwplaats geleverd door heel Nederland.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 group">
                        <div className="w-12 h-12 bg-white text-hett-brown border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:border-hett-brown transition-colors shadow-sm">
                            <Users size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Technische Support</h4>
                            <p className="text-gray-600 leading-relaxed">
                                Twijfelt u over een constructie of berekening? Ons technisch team kijkt met u mee. Van U-waarde berekeningen tot overspanningsadvies.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 bg-white p-8 border border-gray-200 rounded-[24px] shadow-sm">
                    <h4 className="font-bold text-hett-dark mb-2 text-lg">Heeft u vragen?</h4>
                    <p className="text-gray-700 mb-4">Wilt u meer weten over de mogelijkheden voor uw bedrijf? Wij komen graag bij u langs voor een kennismaking.</p>
                    <Link to="/contact" className="inline-flex items-center text-hett-brown font-bold hover:underline">
                        Maak een afspraak
                    </Link>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Dealers;
