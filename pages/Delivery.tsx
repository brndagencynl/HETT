
import React from 'react';
import PageHeader from '../components/PageHeader';
import { Truck, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Delivery: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title="Bezorging"
        subtitle="Service"
        description="Alles over onze leveringen, transportkosten en wat u kunt verwachten op de dag van levering."
        image="https://picsum.photos/1200/600?random=delivery"
      />

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-gray-100">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                <div>
                    <h2 className="text-2xl font-black text-hett-dark mb-4">Levertijden</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        Wij streven ernaar om voorraadproducten binnen <strong>1 tot 2 weken</strong> te leveren in heel Nederland en België. Voor maatwerkproducten of specifieke coatingkleuren kan de levertijd oplopen tot 3-4 weken.
                    </p>
                    <div className="flex items-center gap-3 text-sm font-bold text-hett-brown bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <Clock size={20} />
                        <span>Actuele levertijd: 5-10 werkdagen</span>
                    </div>
                </div>
                <div>
                     <h2 className="text-2xl font-black text-hett-dark mb-4">Verzendkosten</h2>
                     <ul className="space-y-4">
                        <li className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="text-gray-600">Bestellingen > €2.500,-</span>
                            <span className="font-bold text-green-600">Gratis</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="text-gray-600">Nederland (standaard)</span>
                            <span className="font-bold text-hett-dark">€ 75,00</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="text-gray-600">België (standaard)</span>
                            <span className="font-bold text-hett-dark">€ 95,00</span>
                        </li>
                        <li className="flex justify-between items-center pb-2">
                            <span className="text-gray-600">Waddeneilanden</span>
                            <span className="font-bold text-hett-dark">Op aanvraag</span>
                        </li>
                     </ul>
                </div>
            </div>

            <h3 className="text-xl font-bold text-hett-dark mb-6 flex items-center gap-2">
                <Truck size={24} className="text-hett-brown" />
                Levering aan huis
            </h3>
            <div className="prose prose-slate max-w-none text-gray-600">
                <p>
                    Onze producten worden geleverd met speciaal transport. Omdat het vaak gaat om lange pakketten (tot wel 7 meter), maken wij gebruik van vrachtwagens met een kooiaap of kraan.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Lossen:</strong> De levering vindt plaats 'aan de stoeprand' of op de dichtstbijzijnde goed bereikbare plaats. De chauffeur bepaalt ter plekke wat veilig en mogelijk is.</li>
                    <li><strong>Aanwezigheid:</strong> Er dient iemand aanwezig te zijn om de bestelling in ontvangst te nemen en te controleren op eventuele transportschade.</li>
                    <li><strong>Bereikbaarheid:</strong> Uw adres moet bereikbaar zijn voor een vrachtwagen van 18 meter. Is dit niet het geval? Neem dan vooraf contact op.</li>
                </ul>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-start gap-4">
                <AlertTriangle className="text-blue-500 flex-shrink-0 mt-1" />
                <div>
                    <h4 className="font-bold text-blue-800 text-sm mb-1">Let op: Controle bij ontvangst</h4>
                    <p className="text-sm text-blue-700/80">
                        Controleer de levering direct op compleetheid en eventuele beschadigingen. Meldt dit direct bij de chauffeur en noteer het op de vrachtbrief. Latere reclamaties van zichtbare schade kunnen wij helaas niet in behandeling nemen.
                    </p>
                </div>
            </div>

            <div className="mt-8 text-center">
                <Link to="/afhalen" className="text-hett-brown font-bold hover:underline">
                    Wilt u liever afhalen? Bekijk de mogelijkheden.
                </Link>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Delivery;
