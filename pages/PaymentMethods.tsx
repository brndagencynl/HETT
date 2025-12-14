
import React from 'react';
import PageHeader from '../components/PageHeader';
import { CreditCard, ShieldCheck } from 'lucide-react';

const PaymentMethods: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title="Betaalmethoden"
        subtitle="Service"
        description="Veilig en vertrouwd betalen. Wij bieden diverse betaalopties voor zowel particuliere als zakelijke klanten."
        image="https://picsum.photos/1200/600?random=payment"
      />

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-gray-100">
            
            <p className="text-gray-600 text-lg mb-12 max-w-2xl">
                Bij HETT vinden we veiligheid belangrijk. Daarom werken wij samen met Mollie, een van de grootste betalingsproviders van Europa, om uw betaling in een beveiligde omgeving te verwerken.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <PaymentCard 
                    title="iDEAL" 
                    desc="De meest gebruikte betaalmethode in Nederland. U betaalt veilig en snel via de vertrouwde omgeving van uw eigen bank."
                    badge="Gratis"
                />
                <PaymentCard 
                    title="Bancontact" 
                    desc="Voor onze Belgische klanten. Direct en veilig betalen via uw eigen bankomgeving."
                    badge="Gratis"
                />
                <PaymentCard 
                    title="Creditcard" 
                    desc="Wij accepteren VISA, Mastercard en American Express. Uw aankoop is vaak verzekerd via uw creditcardmaatschappij."
                    badge="Gratis"
                />
                <PaymentCard 
                    title="Klarna Achteraf Betalen" 
                    desc="Eerst zien, dan betalen. U betaalt de factuur binnen 30 dagen na levering aan Klarna."
                    badge="+ €2,95"
                />
                <PaymentCard 
                    title="Bankoverschrijving" 
                    desc="U maakt het bedrag handmatig over. Let op: de levering vindt pas plaats nadat de betaling is ontvangen (duurt 1-2 werkdagen langer)."
                    badge="Gratis"
                />
                <PaymentCard 
                    title="Op Rekening (Zakelijk)" 
                    desc="Voor geregistreerde dealers en vaste zakelijke partners bieden wij de mogelijkheid om op rekening te bestellen."
                    badge="Op aanvraag"
                />

            </div>

            <div className="mt-12 p-8 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-green-500 shadow-sm flex-shrink-0">
                    <ShieldCheck size={32} />
                </div>
                <div>
                    <h3 className="font-bold text-green-800 text-lg mb-1">Veilig Betalen Garantie</h3>
                    <p className="text-green-700/80">
                        Onze website is beveiligd met een SSL-certificaat (het slotje in de browserbalk). Uw bankgegevens worden versleuteld verstuurd en nooit door ons opgeslagen.
                    </p>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

const PaymentCard = ({ title, desc, badge }: { title: string, desc: string, badge: string }) => (
    <div className="p-6 border border-gray-200 rounded-2xl hover:border-hett-brown transition-colors group">
        <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-hett-dark text-lg group-hover:text-hett-brown">{title}</h3>
            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">{badge}</span>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
);

export default PaymentMethods;
