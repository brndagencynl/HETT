
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, MessageCircle, Truck, PenTool, Package } from 'lucide-react';
import PageHeader from '../components/PageHeader';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  items: FAQItem[];
}

const faqs: FAQCategory[] = [
  {
    id: 'producten',
    title: 'Producten & Techniek',
    icon: Package,
    items: [
      {
        question: 'Wat is de isolatiewaarde (Rd) van jullie panelen?',
        answer: 'De isolatiewaarde hangt af van de dikte van het paneel. Een 40mm paneel heeft een Rd-waarde van ongeveer 1.8, terwijl een 120mm paneel oploopt tot ruim 5.5. In onze configurator ziet u direct de exacte U-waarde en Rd-waarde bij de door u gekozen dikte.'
      },
      {
        question: 'Kunnen de panelen op maat gezaagd worden?',
        answer: 'Ja, wij zagen alle orders op de millimeter nauwkeurig in onze eigen zagerij. U betaalt alleen voor de lengte die u bestelt. De maximale lengte die wij kunnen leveren is 13 meter.'
      },
      {
        question: 'Zijn de panelen geschikt voor een serre of aanbouw?',
        answer: 'Absoluut. Onze Eco+ dakpanelen en Prof-Rib wandpanelen zijn speciaal ontwikkeld voor hoogwaardige toepassingen zoals serres, tuinkamers en aanbouwen aan woningen. Ze voldoen aan de strenge eisen voor thermische isolatie.'
      }
    ]
  },
  {
    id: 'levering',
    title: 'Bestellen & Levering',
    icon: Truck,
    items: [
      {
        question: 'Wat is de levertijd?',
        answer: 'Omdat wij leveren uit eigen voorraad, kunnen we vaak binnen 2 tot 5 werkdagen leveren in heel Nederland en België. Spoedlevering is in overleg mogelijk.'
      },
      {
        question: 'Wat zijn de bezorgkosten?',
        answer: 'Bij bestellingen boven de €1.500,- ex BTW leveren wij gratis. Daaronder rekenen wij een vast tarief voor transport, afhankelijk van uw locatie. Dit wordt berekend in de winkelwagen.'
      },
      {
        question: 'Kan ik mijn bestelling ook afhalen?',
        answer: 'Ja, afhalen is mogelijk bij ons magazijn in Eindhoven. Kies tijdens het afrekenen voor "Afhalen" en wij nemen contact op zodra uw order gereed staat (meestal binnen 24 uur).'
      }
    ]
  },
  {
    id: 'montage',
    title: 'Montage & Onderhoud',
    icon: PenTool,
    items: [
      {
        question: 'Heb ik speciaal gereedschap nodig voor montage?',
        answer: 'Voor het zagen van sandwichpanelen raden wij een cirkelzaag met een geschikt metaalblad aan (koudzagen). Gebruik nooit een haakse slijper, dit beschadigt de coating door de hitte. Voor bevestiging heeft u een schroefmachine nodig.'
      },
      {
        question: 'Verzorgen jullie ook de montage?',
        answer: 'HETT is een leverancier van materialen en wij voeren zelf geen montage uit. Wel hebben wij een netwerk van aangesloten dealers en montagepartners die wij kunnen aanbevelen voor uw project.'
      },
      {
        question: 'Hoe moet ik de panelen onderhouden?',
        answer: 'Onze panelen zijn onderhoudsarm. Eén keer per jaar schoonmaken met water en een zachte borstel is vaak voldoende. Gebruik geen agressieve schoonmaakmiddelen.'
      }
    ]
  }
];

const FAQ: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      
      {/* Header */}
      <PageHeader 
        title="Veelgestelde Vragen"
        subtitle="Klantenservice"
        description="Antwoorden op de meest voorkomende vragen over onze producten, levering en montage. Staat uw vraag er niet tussen?"
        image="https://picsum.photos/1200/800?random=6"
        action={{ label: "Contact opnemen", link: "/contact" }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-20">
        {faqs.map((category) => (
          <div key={category.id}>
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-white p-3 rounded-xl shadow-sm text-hett-brown border border-gray-100">
                    <category.icon size={24} />
                </div>
                <h2 className="text-2xl font-bold text-hett-dark">{category.title}</h2>
            </div>
            
            <div className="space-y-4">
              {category.items.map((item, index) => {
                const itemKey = `${category.id}-${index}`;
                const isOpen = openSection === itemKey;

                return (
                  <div 
                    key={index} 
                    className={`bg-white rounded-[24px] border transition-all duration-300 overflow-hidden ${
                        isOpen ? 'border-hett-brown shadow-md' : 'border-gray-100 shadow-sm hover:border-gray-300'
                    }`}
                  >
                    <button
                      onClick={() => toggleSection(itemKey)}
                      className="w-full px-8 py-6 flex justify-between items-center text-left focus:outline-none"
                    >
                      <span className={`font-bold text-lg ${isOpen ? 'text-hett-brown' : 'text-hett-dark'}`}>
                        {item.question}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="text-hett-brown flex-shrink-0 ml-4" size={20} />
                      ) : (
                        <ChevronDown className="text-gray-400 flex-shrink-0 ml-4" size={20} />
                      )}
                    </button>
                    
                    <div 
                        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                        }`}
                    >
                        <div className="overflow-hidden">
                            <div className="px-8 pb-8 pt-0 text-gray-600 leading-relaxed">
                                {item.answer}
                            </div>
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* CTA Block */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-hett-dark rounded-[32px] p-12 text-center relative overflow-hidden">
            {/* Abstract shape */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="relative z-10">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white">
                    <MessageCircle size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Niet gevonden wat u zocht?</h3>
                <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                    Ons team van experts staat klaar om u persoonlijk te helpen met uw specifieke project of technische vragen.
                </p>
                <Link 
                    to="/contact" 
                    className="inline-flex items-center bg-white text-hett-dark px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors"
                >
                    Neem contact op
                </Link>
            </div>
        </div>
      </div>

    </div>
  );
};

export default FAQ;
