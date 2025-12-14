
import React from 'react';
import PageHeader from '../components/PageHeader';
import { RefreshCw, XCircle, CheckCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Returns: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title="Retourneren"
        subtitle="Service"
        description="Informatie over het herroepingsrecht, retourvoorwaarden en uitzonderingen voor maatwerk."
        image="https://picsum.photos/1200/600?random=return"
      />

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-gray-100">
            
            <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-2xl mb-8">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">Belangrijk: Maatwerk uitzondering</h3>
                <p className="text-sm text-yellow-700 leading-relaxed">
                    Veel producten van HETT (zoals complete veranda's, op maat gezaagde panelen en glazen schuifwanden) worden specifiek voor u op maat geproduceerd. 
                    Voor deze <strong>maatwerkproducten geldt geen herroepingsrecht</strong>. U kunt deze producten niet retourneren, tenzij er sprake is van een productiefout.
                </p>
            </div>

            <h2 className="text-2xl font-black text-hett-dark mb-4">Standaard producten retourneren</h2>
            <p className="text-gray-600 mb-6">
                Voor standaard voorraadartikelen (zoals losse accessoires, standaard LED-sets, schoonmaakmiddelen) geldt een zichttermijn van 14 dagen.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <CheckCircle size={20} className="text-green-500" />
                        Wel retourneren
                    </h3>
                    <ul className="list-disc list-inside text-sm text-gray-600 pl-2">
                        <li>Standaard accessoires (ongebruikt)</li>
                        <li>LED verlichting sets (in originele doos)</li>
                        <li>Standaard betonpoeren</li>
                        <li>Producten in originele, onbeschadigde verpakking</li>
                    </ul>
                </div>
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <XCircle size={20} className="text-red-500" />
                        Niet retourneren
                    </h3>
                    <ul className="list-disc list-inside text-sm text-gray-600 pl-2">
                        <li>Op maat gezaagde profielen</li>
                        <li>Complete veranda bouwpakketten (maatwerk)</li>
                        <li>Speciaal bestelde glasplaten</li>
                        <li>Producten die reeds gemonteerd zijn geweest</li>
                        <li>Beschadigde of gebruikte artikelen</li>
                    </ul>
                </div>
            </div>

            <h3 className="text-xl font-bold text-hett-dark mb-4">Retourproces</h3>
            <ol className="space-y-4 mb-8">
                <li className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center flex-shrink-0">1</span>
                    <div>
                        <strong className="block text-gray-900">Aanmelden</strong>
                        <p className="text-sm text-gray-600">Meld uw retour binnen 14 dagen na ontvangst aan via <a href="mailto:retour@hett.nl" className="text-hett-brown underline">retour@hett.nl</a>. Vermeld uw ordernummer en om welke artikelen het gaat.</p>
                    </div>
                </li>
                <li className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center flex-shrink-0">2</span>
                    <div>
                        <strong className="block text-gray-900">Verpakken & Verzenden</strong>
                        <p className="text-sm text-gray-600">
                            U bent zelf verantwoordelijk voor het veilig retourneren van de producten. De kosten voor retourzending zijn voor eigen rekening. 
                            Zorg voor een degelijke verpakking.
                        </p>
                    </div>
                </li>
                <li className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center flex-shrink-0">3</span>
                    <div>
                        <strong className="block text-gray-900">Terugbetaling</strong>
                        <p className="text-sm text-gray-600">Na ontvangst en controle van de goederen storten wij het aankoopbedrag binnen 14 dagen terug op uw rekening.</p>
                    </div>
                </li>
            </ol>

            <div className="border-t border-gray-100 pt-8 mt-8">
                <h4 className="font-bold text-gray-900 mb-2">Retouradres</h4>
                <address className="not-italic text-gray-600 text-sm">
                    HETT B.V.<br/>
                    T.a.v. Retouren<br/>
                    Industrieweg 45<br/>
                    5600 AA Eindhoven
                </address>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Returns;
