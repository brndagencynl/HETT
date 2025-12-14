
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, MessageCircle, Truck, PenTool, Package, ShieldCheck, CreditCard, ShoppingBag } from 'lucide-react';
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
    id: 'bezorgen',
    title: 'Bezorgen & Afhalen',
    icon: Truck,
    items: [
      {
        question: 'Wat is de levertijd?',
        answer: 'Omdat wij leveren uit eigen voorraad, kunnen we vaak binnen 1 tot 2 weken leveren in heel Nederland en België. U ontvangt een bericht zodra de exacte leverdatum bekend is.'
      },
      {
        question: 'Wat zijn de bezorgkosten?',
        answer: 'Bij bestellingen boven de €2.500,- leveren wij gratis in Nederland en België. Daaronder rekenen wij een vast tarief voor transport (€75,- NL / €95,- BE) vanwege de lengte en het gewicht van de pakketten.'
      },
      {
        question: 'Kan ik mijn bestelling ook afhalen?',
        answer: 'Ja, afhalen is mogelijk bij ons magazijn in Eindhoven (Industrieweg 45). Kies tijdens het afrekenen voor "Afhalen". Wij nemen contact op zodra uw order gereed staat (vaak binnen 24 uur).'
      },
      {
        question: 'Hoe wordt er geleverd?',
        answer: 'Wij leveren met een vrachtwagen (tot 18 meter) die is uitgerust met een kooiaap of kraan. De levering vindt plaats aan de stoeprand of op een goed bereikbare plaats.'
      }
    ]
  },
  {
    id: 'garantie',
    title: 'Garantie & Service',
    icon: ShieldCheck,
    items: [
      {
        question: 'Hoe lang heb ik garantie?',
        answer: 'Wij bieden standaard 10 jaar fabrieksgarantie op de aluminium constructie en de kleurvastheid van de poedercoating. Op bewegende delen en polycarbonaat platen geldt een garantie van 5 jaar.'
      },
      {
        question: 'Wat moet ik doen bij schade?',
        answer: 'Meld zichtbare transportschade direct bij de chauffeur op de vrachtbrief. Voor overige klachten kunt u binnen 48 uur een e-mail sturen naar service@hett.nl met duidelijke foto\'s.'
      },
      {
        question: 'Kan ik onderdelen retourneren?',
        answer: 'Standaard voorraadartikelen kunnen binnen 14 dagen geretourneerd worden. Let op: maatwerkproducten (zoals op maat gezaagde panelen of complete veranda sets) zijn uitgesloten van het herroepingsrecht.'
      }
    ]
  },
  {
    id: 'betalen',
    title: 'Bestellen & Betalen',
    icon: CreditCard,
    items: [
      {
        question: 'Welke betaalmethoden accepteren jullie?',
        answer: 'U kunt veilig betalen via iDEAL, Bancontact, Creditcard (VISA/Mastercard), Klarna (achteraf betalen) of via handmatige bankoverschrijving.'
      },
      {
        question: 'Kan ik zakelijk op rekening bestellen?',
        answer: 'Voor geregistreerde partners en dealers is kopen op rekening mogelijk na goedkeuring. Neem hiervoor contact op met onze verkoopafdeling.'
      },
      {
        question: 'Krijg ik een BTW-factuur?',
        answer: 'Ja, na uw bestelling ontvangt u automatisch een gespecificeerde BTW-factuur per e-mail. Deze heeft u ook nodig voor uw garantie.'
      }
    ]
  },
  {
    id: 'montage',
    title: 'Product & Montage',
    icon: PenTool,
    items: [
      {
        question: 'Is montage moeilijk?',
        answer: 'Onze systemen zijn ontworpen als slimme bouwpakketten voor de handige doe-het-zelver. Alle profielen zijn voorbewerkt. Met onze uitgebreide handleiding en video\'s is montage goed te doen.'
      },
      {
        question: 'Heb ik speciaal gereedschap nodig?',
        answer: 'Een goede accuboormachine, waterpas, rolmaat en ringsteeksleutels zijn de basis. Voor het inkorten van panelen adviseren wij een cirkelzaag met een geschikt zaagblad voor metaal/kunststof.'
      },
      {
        question: 'Verzorgen jullie de montage?',
        answer: 'HETT levert de materialen. Voor montage werken wij samen met een netwerk van zelfstandige montagepartners die wij u kunnen aanbevelen.'
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
        description="Zoek hieronder uw vraag per categorie. Staat uw vraag er niet tussen? Neem dan gerust contact op."
        image="https://picsum.photos/1200/800?random=6"
        action={{ label: "Contact opnemen", link: "/contact" }}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Sidebar Navigation (Optional / Sticky) */}
            <div className="lg:col-span-3 hidden lg:block">
                <div className="sticky top-32 space-y-2">
                    <h3 className="font-bold text-hett-dark text-lg mb-4 px-4">Categorieën</h3>
                    {faqs.map(cat => (
                        <a 
                            key={cat.id} 
                            href={`#${cat.id}`} 
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white hover:shadow-sm text-gray-600 hover:text-hett-brown transition-all font-medium"
                        >
                            <cat.icon size={18} />
                            {cat.title}
                        </a>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-9 space-y-16">
                {faqs.map((category) => (
                  <div key={category.id} id={category.id} className="scroll-mt-32">
                    <div className="flex items-center gap-4 mb-6 border-b border-gray-200 pb-4">
                        <div className="bg-hett-brown text-white p-3 rounded-xl shadow-sm">
                            <category.icon size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-hett-dark">{category.title}</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {category.items.map((item, index) => {
                        const itemKey = `${category.id}-${index}`;
                        const isOpen = openSection === itemKey;

                        return (
                          <div 
                            key={index} 
                            className="bg-white rounded-[16px] shadow-sm overflow-hidden border border-transparent hover:border-gray-100 transition-all"
                          >
                            <button
                              onClick={() => toggleSection(itemKey)}
                              className="w-full flex justify-between items-center p-5 text-left font-bold text-hett-dark hover:bg-gray-50 transition-colors text-sm md:text-base"
                            >
                              <span>{item.question}</span>
                              {isOpen ? (
                                <ChevronUp className="text-gray-400" size={20} />
                              ) : (
                                <ChevronDown className="text-gray-400" size={20} />
                              )}
                            </button>
                            
                            <div 
                                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                                }`}
                            >
                                <div className="overflow-hidden">
                                    <div className="p-5 pt-0 text-sm text-gray-600 leading-relaxed border-t border-gray-50">
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
        </div>
      </div>

      {/* CTA Block */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-hett-dark rounded-[32px] p-12 text-center relative overflow-hidden">
            {/* Abstract shape */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="relative z-10">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white">
                    <MessageCircle size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Staat uw vraag er niet tussen?</h3>
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
