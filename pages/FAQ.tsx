import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, MessageCircle, Truck, PenTool, Package, ShieldCheck, CreditCard, ShoppingBag, Pen } from 'lucide-react';
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
  path?: string;
}

const infoCategories: FAQCategory[] = [
  {
    id: 'bezorgen',
    title: 'Bezorgen & Afhalen',
    icon: Truck,
    path: '/bezorging',
    items: [
      {
        question: 'Wat is de levertijd?',
        answer: 'Omdat wij leveren uit eigen voorraad, kunnen we vaak binnen 1 tot 2 weken leveren in heel Nederland en België. U ontvangt een bericht zodra de exacte leverdatum bekend is.'
      },
      {
        question: 'Wat zijn de bezorgkosten?',
        answer: 'Bij bestellingen boven de €2.500,- leveren wij gratis in Nederland en België. Daaronder rekenen wij een vast tarief voor transport (€75,- NL / €95,- BE) vanwege de lengte en het gewicht van de pakketten.'
      }
    ]
  },
  {
    id: 'garantie',
    title: 'Garantie & Service',
    icon: ShieldCheck,
    path: '/garantie-en-klachten',
    items: [
      {
        question: 'Hoe lang heb ik garantie?',
        answer: 'Wij bieden standaard 10 jaar fabrieksgarantie op de aluminium constructie en de kleurvastheid van de poedercoating.'
      }
    ]
  },
  {
    id: 'betalen',
    title: 'Bestellen & Betalen',
    icon: CreditCard,
    path: '/betaalmethoden',
    items: [
      {
        question: 'Welke betaalmethoden accepteren jullie?',
        answer: 'U kunt veilig betalen via iDEAL, Bancontact, Creditcard, Klarna of handmatige bankoverschrijving.'
      }
    ]
  },
  {
    id: 'montage',
    title: 'Product & Montage',
    icon: Pen,
    path: '/montage-handleiding',
    items: [
      {
        question: 'Is montage moeilijk?',
        answer: 'Onze systemen zijn ontworpen als slimme bouwpakketten voor de handige doe-het-zelver.'
      }
    ]
  }
];

const FAQ: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const location = useLocation();

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans">
      <PageHeader />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Sidebar Navigation (EXACT MATCH TO SCREENSHOT) */}
            <aside className="lg:col-span-3">
                <div className="sticky top-48">
                    <h3 className="sidebar-nav-title uppercase tracking-tight">Categorieën</h3>
                    <nav className="flex flex-col gap-1">
                        {infoCategories.map((cat) => {
                            const Icon = cat.icon;
                            const isActive = location.pathname === cat.path || (location.pathname === '/veelgestelde-vragen' && cat.id === 'bezorgen');
                            return (
                                <Link 
                                    key={cat.id} 
                                    to={cat.path || '#'} 
                                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                                >
                                    <Icon size={22} className="sidebar-nav-icon" />
                                    <span>{cat.title}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Content */}
            <div className="lg:col-span-9">
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-black text-hett-dark mb-4">Veelgestelde Vragen</h1>
                    <p className="text-gray-500 max-w-2xl">Zoek hieronder uw vraag per categorie. Staat uw vraag er niet tussen? Neem dan gerust contact op.</p>
                </div>

                <div className="space-y-16">
                    {infoCategories.map((category) => (
                      <div key={category.id} id={category.id} className="scroll-mt-32">
                        <div className="flex items-center gap-4 mb-6 border-b border-gray-200 pb-4">
                            <h2 className="text-2xl font-black text-hett-dark">{category.title}</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          {category.items.map((item, index) => {
                            const itemKey = `${category.id}-${index}`;
                            const isOpen = openSection === itemKey;

                            return (
                              <div 
                                key={index} 
                                className="bg-white rounded-lg shadow-soft border border-gray-200 overflow-hidden"
                              >
                                <button
                                  onClick={() => toggleSection(itemKey)}
                                  className="w-full flex justify-between items-center p-5 text-left font-bold text-hett-dark hover:bg-gray-50 transition-colors"
                                >
                                  <span>{item.question}</span>
                                  {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                </button>
                                
                                <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
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
      </div>
    </div>
  );
};

export default FAQ;