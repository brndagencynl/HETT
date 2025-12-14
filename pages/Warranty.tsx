
import React from 'react';
import PageHeader from '../components/PageHeader';
import { ShieldCheck, AlertTriangle, FileText, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Warranty: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title="Garantie & Klachten"
        subtitle="Service"
        description="Wij staan achter de kwaliteit van onze producten. Lees hier alles over onze garantievoorwaarden en klachtenprocedure."
        image="https://picsum.photos/1200/600?random=warranty"
      />

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Warranty Section */}
        <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-gray-100 mb-12">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                    <ShieldCheck size={28} />
                </div>
                <h2 className="text-3xl font-black text-hett-dark">Garantie</h2>
            </div>

            <p className="text-gray-600 text-lg mb-8">
                Bij HETT koopt u kwaliteit. Mocht er onverhoopt toch iets mis zijn, dan kunt u rekenen op onze uitgebreide garantieregeling.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="border border-gray-100 p-6 rounded-2xl bg-gray-50">
                    <h3 className="font-bold text-hett-dark text-xl mb-2">10 Jaar Garantie</h3>
                    <p className="text-sm text-gray-500 mb-4">Op aluminium profielen & coating</p>
                    <p className="text-gray-600 text-sm">
                        Wij garanderen dat de aluminium profielen niet zullen doorroesten en dat de poedercoating niet zal afbladderen of overmatig verkleuren onder normale weersomstandigheden.
                    </p>
                </div>
                <div className="border border-gray-100 p-6 rounded-2xl bg-gray-50">
                    <h3 className="font-bold text-hett-dark text-xl mb-2">5 Jaar Garantie</h3>
                    <p className="text-sm text-gray-500 mb-4">Op bewegende delen & panelen</p>
                    <p className="text-gray-600 text-sm">
                        Garantie op de werking van wielen in schuifwanden, scharnieren en de thermische eigenschappen van polycarbonaat- en sandwichpanelen.
                    </p>
                </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-2">Uitsluitingen</h4>
                <ul className="list-disc list-inside text-sm text-blue-800/80 space-y-1">
                    <li>Schade door storm, hagel of andere extreme weersomstandigheden (vaak gedekt door uw opstalverzekering).</li>
                    <li>Schade ontstaan door onjuiste montage die niet conform de handleiding is uitgevoerd.</li>
                    <li>Normale slijtage en kleine krasjes die geen invloed hebben op de constructieve veiligheid.</li>
                    <li>Thermische breuk in glas (dit is geen productiefout, maar gevolg van temperatuurspanningen).</li>
                </ul>
            </div>
        </div>

        {/* Complaints Section */}
        <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                    <AlertTriangle size={28} />
                </div>
                <h2 className="text-3xl font-black text-hett-dark">Klachtenprocedure</h2>
            </div>

            <p className="text-gray-600 mb-6">
                Heeft u een klacht over een product of onze dienstverlening? Dat vinden wij heel vervelend en we lossen het graag samen met u op.
            </p>

            <h3 className="font-bold text-hett-dark text-lg mb-4">Stappenplan</h3>
            <ol className="space-y-4 mb-8 relative border-l-2 border-gray-100 ml-3 pl-8">
                <li className="relative">
                    <span className="absolute -left-[39px] top-0 w-6 h-6 bg-hett-brown text-white text-xs font-bold rounded-full flex items-center justify-center">1</span>
                    <strong className="block text-gray-900">Meld uw klacht</strong>
                    <p className="text-sm text-gray-600">Stuur een e-mail naar <a href="mailto:service@hett.nl" className="text-hett-brown underline">service@hett.nl</a> onder vermelding van uw ordernummer.</p>
                </li>
                <li className="relative">
                    <span className="absolute -left-[39px] top-0 w-6 h-6 bg-hett-brown text-white text-xs font-bold rounded-full flex items-center justify-center">2</span>
                    <strong className="block text-gray-900">Stuur foto's mee</strong>
                    <p className="text-sm text-gray-600">Om uw klacht goed te kunnen beoordelen, vragen wij u duidelijke foto's van het defect of de situatie mee te sturen.</p>
                </li>
                <li className="relative">
                    <span className="absolute -left-[39px] top-0 w-6 h-6 bg-hett-brown text-white text-xs font-bold rounded-full flex items-center justify-center">3</span>
                    <strong className="block text-gray-900">Reactie binnen 2 werkdagen</strong>
                    <p className="text-sm text-gray-600">U ontvangt van ons een ontvangstbevestiging en wij streven ernaar om binnen 48 uur met een inhoudelijke reactie of oplossing te komen.</p>
                </li>
            </ol>

            <div className="bg-gray-50 p-6 rounded-2xl flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h4 className="font-bold text-gray-900">Niet tevreden met de oplossing?</h4>
                    <p className="text-sm text-gray-500">
                        Als zakelijke klant of consument kunt u het geschil voorleggen aan de Geschillencommissie Webshop Keurmerk.
                    </p>
                </div>
                <Link to="/contact" className="bg-hett-dark text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-hett-brown transition-colors">
                    Neem contact op
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Warranty;
