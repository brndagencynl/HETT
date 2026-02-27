import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, MessageCircle, Truck, PenTool, Package, ShieldCheck, CreditCard, ShoppingBag, Pen, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/PageHeader';

interface FAQItem {
  id: string;
  category: string;
}

interface FAQCategory {
  id: string;
  icon: React.ElementType;
  path?: string;
}

// 25 FAQ items — text comes from i18n keys faq.items.{id}.q / .a
const FAQ_ITEMS: FAQItem[] = [
  // Bestellen & configureren (1-5)
  { id: '1', category: 'bestellen' },
  { id: '2', category: 'bestellen' },
  { id: '3', category: 'bestellen' },
  { id: '4', category: 'bestellen' },
  { id: '5', category: 'bestellen' },
  // Bezorging & afhalen (6-10)
  { id: '6', category: 'bezorgen' },
  { id: '7', category: 'bezorgen' },
  { id: '8', category: 'bezorgen' },
  { id: '9', category: 'bezorgen' },
  { id: '10', category: 'bezorgen' },
  // Betalen (11-13)
  { id: '11', category: 'betalen' },
  { id: '12', category: 'betalen' },
  { id: '13', category: 'betalen' },
  // Producten & montage (14-18)
  { id: '14', category: 'montage' },
  { id: '15', category: 'montage' },
  { id: '16', category: 'montage' },
  { id: '17', category: 'montage' },
  { id: '18', category: 'montage' },
  // Garantie & service (19-22)
  { id: '19', category: 'garantie' },
  { id: '20', category: 'garantie' },
  { id: '21', category: 'garantie' },
  { id: '22', category: 'garantie' },
  // Showroom & advies (23-25)
  { id: '23', category: 'showroom' },
  { id: '24', category: 'showroom' },
  { id: '25', category: 'showroom' },
];

// Category labels come from i18n keys faq.categories.{id}
const FAQ_CATEGORIES: FAQCategory[] = [
  { id: 'bestellen', icon: ShoppingBag },
  { id: 'bezorgen', icon: Truck, path: '/bezorging' },
  { id: 'betalen', icon: CreditCard, path: '/betaalmethoden' },
  { id: 'montage', icon: Pen, path: '/montage' },
  { id: 'garantie', icon: ShieldCheck, path: '/garantie-en-klachten' },
  { id: 'showroom', icon: MapPin, path: '/showroom' },
];

const FAQ: React.FC = () => {
  const { t } = useTranslation();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const location = useLocation();

  // Set document title on mount
  useEffect(() => {
    document.title = t('faq.pageTitle');
  }, [t]);

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
                    <h3 className="sidebar-nav-title uppercase tracking-tight">{t('faq.categories.all')}</h3>
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
                                    <span>{t(`faq.categories.${cat.id}`)}</span>
                                </a>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Content */}
            <div className="lg:col-span-9">
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-black text-hett-dark mb-4">{t('faq.title')}</h1>
                    <p className="text-gray-500 max-w-2xl">{t('faq.description')}</p>
                </div>

                <div className="space-y-16">
                    {FAQ_CATEGORIES.map((category) => {
                      const categoryItems = getItemsForCategory(category.id);
                      return (
                        <div key={category.id} id={category.id} className="scroll-mt-32">
                          <div className="flex items-center gap-4 mb-6 border-b border-gray-200 pb-4">
                              <h2 className="text-2xl font-black text-hett-dark">{t(`faq.categories.${category.id}`)}</h2>
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
                                    <span>{t(`faq.items.${item.id}.q`)}</span>
                                    {isOpen ? <ChevronUp size={20} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />}
                                  </button>
                                  
                                  <div 
                                    id={`faq-answer-${item.id}`}
                                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                                  >
                                      <div className="overflow-hidden">
                                          <div className="p-5 pt-0 text-sm text-gray-600 leading-relaxed border-t border-gray-50">
                                              {t(`faq.items.${item.id}.a`)}
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