import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, MessageCircle, Truck, PenTool, Package, ShieldCheck, CreditCard, ShoppingBag, Pen, MapPin } from 'lucide-react';
import PageHeader from '../components/PageHeader';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  path?: string;
}

// 25 FAQ items as specified
const FAQ_ITEMS: FAQItem[] = [
  // Bestellen & configureren (1-5)
  { id: '1', category: 'bestellen', question: 'Hoe bestel ik een veranda bij HETT Veranda\'s?', answer: 'U bestelt eenvoudig via onze webshop. Kies een standaard veranda of stel uw veranda samen via de configurator. Na afronden van de configuratie kunt u direct bestellen of een offerte aanvragen.' },
  { id: '2', category: 'bestellen', question: 'Kan ik een veranda volledig op maat laten maken?', answer: 'Ja. Naast onze standaardafmetingen bieden wij maatwerk veranda\'s. U kiest zelf de exacte breedte en diepte tot op de centimeter nauwkeurig.' },
  { id: '3', category: 'bestellen', question: 'Wat is het verschil tussen standaard en maatwerk veranda\'s?', answer: 'Standaard veranda\'s hebben vaste afmetingen en zijn sneller leverbaar. Maatwerk veranda\'s worden exact op uw gewenste maat gemaakt en hebben een maatwerktoeslag.' },
  { id: '4', category: 'bestellen', question: 'Kan ik mijn bestelling later nog aanpassen?', answer: 'Aanpassingen zijn mogelijk zolang de bestelling nog niet in productie is genomen. Neem zo snel mogelijk contact op met onze klantenservice.' },
  { id: '5', category: 'bestellen', question: 'Ontvang ik een bevestiging na mijn bestelling?', answer: 'Ja. Na het plaatsen van uw bestelling ontvangt u direct een orderbevestiging per e-mail met alle details van uw bestelling.' },
  // Bezorging & afhalen (6-10)
  { id: '6', category: 'bezorgen', question: 'Wat zijn de bezorgkosten?', answer: 'Nederland: gratis bezorging. België & Duitsland: bezorgkosten worden berekend op basis van afstand (per kilometer). De exacte kosten ziet u tijdens het afrekenen.' },
  { id: '7', category: 'bezorgen', question: 'Wat is de gemiddelde levertijd?', answer: 'De gemiddelde levertijd bedraagt 5 tot 10 werkdagen. Bij maatwerk of specifieke configuraties kan dit iets afwijken.' },
  { id: '8', category: 'bezorgen', question: 'Wordt mijn bestelling in één keer geleverd?', answer: 'Ja, wij leveren uw bestelling compleet in één levering, tenzij anders afgesproken.' },
  { id: '9', category: 'bezorgen', question: 'Kan ik mijn bestelling ook afhalen?', answer: 'Ja, afhalen is mogelijk en altijd gratis. Na bestelling nemen wij contact met u op om een afhaalmoment in te plannen.' },
  { id: '10', category: 'bezorgen', question: 'Word ik vooraf geïnformeerd over de levering?', answer: 'Ja. U ontvangt vooraf bericht over de geplande leverdatum en het tijdvak.' },
  // Betalen (11-13)
  { id: '11', category: 'betalen', question: 'Welke betaalmethoden accepteren jullie?', answer: 'Wij accepteren onder andere iDEAL, creditcard, Bancontact, Sofort en Shopify Payments.' },
  { id: '12', category: 'betalen', question: 'Is online betalen veilig?', answer: 'Ja. Alle betalingen verlopen via beveiligde betaalomgevingen en voldoen aan de geldende veiligheidsnormen.' },
  { id: '13', category: 'betalen', question: 'Kan ik achteraf betalen?', answer: 'Achteraf betalen is op dit moment niet standaard mogelijk. Voor zakelijke bestellingen of grotere projecten kunt u contact opnemen.' },
  // Producten & montage (14-18)
  { id: '14', category: 'montage', question: 'Zijn de producten geschikt voor zelfmontage?', answer: 'Ja. Onze veranda\'s en sandwichpanelen zijn ontworpen voor eenvoudige zelfmontage. U ontvangt een duidelijke montagehandleiding.' },
  { id: '15', category: 'montage', question: 'Bieden jullie ook montage aan?', answer: 'Ja, montage door ons professionele team is mogelijk op aanvraag. Neem hiervoor contact met ons op.' },
  { id: '16', category: 'montage', question: 'Welke materialen worden gebruikt?', answer: 'Onze producten zijn vervaardigd uit hoogwaardig aluminium, veiligheidsglas en duurzame isolatiepanelen, geschikt voor langdurig buitengebruik.' },
  { id: '17', category: 'montage', question: 'Kan ik accessoires los bestellen?', answer: 'Ja. Accessoires zoals LED-verlichting en profielen zijn los te bestellen via de webshop.' },
  { id: '18', category: 'montage', question: 'Zijn de producten onderhoudsvriendelijk?', answer: 'Ja. Aluminium en glas vereisen minimaal onderhoud en zijn eenvoudig schoon te houden.' },
  // Garantie & service (19-22)
  { id: '19', category: 'garantie', question: 'Welke garantie krijg ik op mijn veranda?', answer: 'Wij bieden standaard 5 jaar garantie op constructie en systeem, mits correct gemonteerd.' },
  { id: '20', category: 'garantie', question: 'Wat valt er onder de garantie?', answer: 'De garantie dekt fabricage- en constructiefouten. Slijtage door verkeerd gebruik of onjuiste montage valt hier niet onder.' },
  { id: '21', category: 'garantie', question: 'Hoe meld ik een service- of garantieaanvraag?', answer: 'U kunt eenvoudig contact opnemen via onze contactpagina of per e-mail. Voeg indien mogelijk foto\'s en uw ordernummer toe.' },
  { id: '22', category: 'garantie', question: 'Bieden jullie ondersteuning na aankoop?', answer: 'Ja. Ook na uw aankoop staan wij klaar voor vragen over montage, onderhoud en gebruik.' },
  // Showroom & advies (23-25)
  { id: '23', category: 'showroom', question: 'Kan ik de producten in het echt bekijken?', answer: 'Ja. In onze showroom kunt u verschillende veranda\'s, sandwichpanelen en afwerkingen bekijken.' },
  { id: '24', category: 'showroom', question: 'Kan ik advies krijgen bij het kiezen van een product?', answer: 'Zeker. Ons team denkt graag met u mee en helpt bij het kiezen van de juiste oplossing voor uw situatie.' },
  { id: '25', category: 'showroom', question: 'Voor wie zijn jullie producten geschikt?', answer: 'Onze producten zijn geschikt voor zowel particulieren als professionals, zoals aannemers en installateurs.' },
];

const FAQ_CATEGORIES: FAQCategory[] = [
  { id: 'bestellen', title: 'Bestellen & configureren', icon: ShoppingBag },
  { id: 'bezorgen', title: 'Bezorging & afhalen', icon: Truck, path: '/bezorging' },
  { id: 'betalen', title: 'Betalen', icon: CreditCard, path: '/betaalmethoden' },
  { id: 'montage', title: 'Producten & montage', icon: Pen, path: '/montage-handleiding' },
  { id: 'garantie', title: 'Garantie & service', icon: ShieldCheck, path: '/garantie-en-klachten' },
  { id: 'showroom', title: 'Showroom & advies', icon: MapPin, path: '/showroom' },
];

const FAQ: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const location = useLocation();

  // Set document title on mount
  useEffect(() => {
    document.title = "Veelgestelde vragen | HETT Veranda's";
  }, []);

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  // Get items for a category
  const getItemsForCategory = (categoryId: string) => {
    return FAQ_ITEMS.filter(item => item.category === categoryId);
  };

  return (
    <div className="min-h-screen bg-[#eff6ff] font-sans">
      <PageHeader />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-3">
                <div className="sticky top-48">
                    <h3 className="sidebar-nav-title uppercase tracking-tight">Categorieën</h3>
                    <nav className="flex flex-col gap-1">
                        {FAQ_CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            const isActive = location.hash === `#${cat.id}` || (location.hash === '' && cat.id === 'bestellen');
                            return (
                                <a 
                                    key={cat.id} 
                                    href={`#${cat.id}`}
                                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                                >
                                    <Icon size={22} className="sidebar-nav-icon" />
                                    <span>{cat.title}</span>
                                </a>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Content */}
            <div className="lg:col-span-9">
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-black text-hett-dark mb-4">Veelgestelde Vragen</h1>
                    <p className="text-gray-500 max-w-2xl">Antwoorden op de meest gestelde vragen. Staat uw vraag er niet tussen? Neem dan gerust contact op.</p>
                </div>

                <div className="space-y-16">
                    {FAQ_CATEGORIES.map((category) => {
                      const categoryItems = getItemsForCategory(category.id);
                      return (
                        <div key={category.id} id={category.id} className="scroll-mt-32">
                          <div className="flex items-center gap-4 mb-6 border-b border-gray-200 pb-4">
                              <h2 className="text-2xl font-black text-hett-dark">{category.title}</h2>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-3">
                            {categoryItems.map((item) => {
                              const isOpen = openSection === item.id;

                              return (
                                <div 
                                  key={item.id} 
                                  className="bg-white rounded-lg shadow-soft border border-gray-200 overflow-hidden"
                                >
                                  <button
                                    onClick={() => toggleSection(item.id)}
                                    aria-expanded={isOpen}
                                    aria-controls={`faq-answer-${item.id}`}
                                    className="w-full flex justify-between items-center p-5 text-left font-bold text-hett-dark hover:bg-gray-50 transition-colors"
                                  >
                                    <span>{item.question}</span>
                                    {isOpen ? <ChevronUp size={20} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />}
                                  </button>
                                  
                                  <div 
                                    id={`faq-answer-${item.id}`}
                                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
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
                      );
                    })}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;