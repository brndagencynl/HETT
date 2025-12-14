
import React from 'react';
import PageHeader from '../components/PageHeader';
import { MapPin, Clock, Package } from 'lucide-react';

const Pickup: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title="Afhalen"
        subtitle="Service"
        description="Bespaar op verzendkosten door uw bestelling af te halen in ons magazijn in Eindhoven."
        image="https://picsum.photos/1200/600?random=pickup"
      />

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-gray-100">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <h2 className="text-2xl font-black text-hett-dark mb-6">Hoe werkt het?</h2>
                    <ol className="space-y-6">
                        <li className="flex gap-4">
                            <div className="w-8 h-8 bg-hett-dark text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                            <div>
                                <strong className="block text-gray-900 mb-1">Plaats uw bestelling</strong>
                                <p className="text-sm text-gray-600">Kies tijdens het afrekenen voor de optie 'Afhalen in Eindhoven'. De verzendkosten vervallen direct.</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <div className="w-8 h-8 bg-hett-dark text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                            <div>
                                <strong className="block text-gray-900 mb-1">Wacht op bevestiging</strong>
                                <p className="text-sm text-gray-600">Wij zetten uw order klaar. Voorraadproducten liggen vaak binnen 24 uur klaar. U ontvangt een e-mail zodra u kunt komen.</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <div className="w-8 h-8 bg-hett-dark text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                            <div>
                                <strong className="block text-gray-900 mb-1">Afhalen</strong>
                                <p className="text-sm text-gray-600">Meld u bij de balie met uw ordernummer. Wij helpen u met laden (heftruck aanwezig).</p>
                            </div>
                        </li>
                    </ol>
                </div>

                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-hett-dark text-xl mb-6">Locatie & Tijden</h3>
                    
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <MapPin className="text-hett-brown mt-1" />
                            <div>
                                <strong className="block text-gray-900">Magazijn HETT B.V.</strong>
                                <span className="text-gray-600 block">Industrieweg 45</span>
                                <span className="text-gray-600 block">5600 AA Eindhoven</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <Clock className="text-hett-brown mt-1" />
                            <div>
                                <strong className="block text-gray-900">Openingstijden Afhaal</strong>
                                <div className="grid grid-cols-2 gap-x-8 text-sm text-gray-600 mt-1">
                                    <span>Maandag:</span> <span>08:30 - 16:30</span>
                                    <span>Dinsdag:</span> <span>08:30 - 16:30</span>
                                    <span>Woensdag:</span> <span>08:30 - 16:30</span>
                                    <span>Donderdag:</span> <span>08:30 - 16:30</span>
                                    <span>Vrijdag:</span> <span>08:30 - 16:00</span>
                                    <span>Zaterdag:</span> <span>Op afspraak</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <a 
                            href="https://maps.google.com/?q=Industrieweg+45+Eindhoven" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block w-full text-center bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            Route plannen
                        </a>
                    </div>
                </div>
            </div>

            <div className="mt-12 bg-yellow-50 p-6 rounded-2xl border border-yellow-100 flex gap-4">
                <Package className="text-yellow-600 flex-shrink-0" size={24} />
                <div>
                    <h4 className="font-bold text-yellow-800 text-sm mb-1">Vervoer</h4>
                    <p className="text-sm text-yellow-700/80">
                        Houd rekening met de lengte van de materialen! Veel profielen en panelen zijn 3 tot 7 meter lang. Kom met geschikt vervoer (aanhanger of bus). Wij zijn niet aansprakelijk voor schade ontstaan tijdens het zelf vervoeren van de goederen.
                    </p>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Pickup;
