import React from 'react';
import PageHeader from '../components/PageHeader';
import { Truck, MapPin, Clock, AlertTriangle, ShieldCheck, CreditCard, Pen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Delivery: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { id: 'bezorgen', title: t('delivery.tabs.delivery'), icon: Truck, path: '/bezorging' },
    { id: 'garantie', title: t('delivery.tabs.warranty'), icon: ShieldCheck, path: '/garantie-en-klachten' },
    { id: 'betalen', title: t('delivery.tabs.payment'), icon: CreditCard, path: '/betaalmethoden' },
    { id: 'montage', title: 'Product & Montage', icon: Pen, path: '/montage-handleiding' },
  ];

  return (
        <div className="min-h-screen bg-[#eff6ff] font-sans">
      <PageHeader />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Sidebar (Screenshot Match) */}
            <aside className="lg:col-span-3">
                <div className="sticky top-48">
                    <h3 className="sidebar-nav-title uppercase tracking-tight">Categorieën</h3>
                    <nav className="flex flex-col gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link 
                                    key={item.id} 
                                    to={item.path} 
                                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                                >
                                    <Icon size={22} className="sidebar-nav-icon" />
                                    <span>{item.title}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-9">
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-black text-hett-dark mb-4">{t('delivery.title')}</h1>
                    <p className="text-gray-500 max-w-2xl">{t('delivery.description')}</p>
                </div>

                <div className="bg-white p-8 md:p-12 rounded-lg shadow-soft border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                        <div>
                            <h2 className="text-2xl font-black text-hett-dark mb-4">{t('delivery.leadTimes')}</h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Wij streven ernaar om voorraadproducten binnen <strong>1 tot 2 weken</strong> te leveren in heel Nederland en België.
                            </p>
                            <div className="flex items-center gap-3 text-sm font-bold text-hett-brown bg-orange-50 p-4 rounded-lg border border-orange-100">
                                <Clock size={20} />
                                <span>Actuele levertijd: 5-10 werkdagen</span>
                            </div>
                        </div>
                        <div>
                             <h2 className="text-2xl font-black text-hett-dark mb-4">{t('delivery.shippingCosts')}</h2>
                             <ul className="space-y-3">
                                <li className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <span className="text-gray-600">Afhalen in Eindhoven</span>
                                    <span className="font-bold text-green-600">Gratis</span>
                                </li>
                                <li className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <span className="text-gray-600">Veranda (≤ 300 km)</span>
                                    <span className="font-bold text-green-600">Gratis</span>
                                </li>
                                <li className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <span className="text-gray-600">Veranda (&gt; 300 km)</span>
                                    <span className="font-bold text-hett-dark">€ 299,99 vast tarief</span>
                                </li>
                                <li className="flex justify-between items-center pb-2">
                                    <span className="text-gray-600">Alleen accessoires</span>
                                    <span className="font-bold text-hett-dark">€ 29,99 vast tarief</span>
                                </li>
                             </ul>
                             <p className="mt-4 text-xs text-gray-500">
                                Bij gecombineerde bestellingen (veranda + accessoires) gelden de verandaregels. Levering op de Waddeneilanden is niet mogelijk.
                             </p>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-hett-dark mb-4 flex items-center gap-2">
                        <Truck size={22} className="text-hett-primary" />
                        {t('delivery.homeDelivery')}
                    </h3>
                    <div className="prose prose-slate max-w-none text-gray-600 text-sm leading-relaxed mb-10">
                        <p>Onze producten worden geleverd met speciaal transport. Het lossen geschiedt naast de vrachtwagen ('aan de stoeprand'). Afstanden worden berekend vanaf Eindhoven.</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg flex items-start gap-4">
                        <AlertTriangle className="text-blue-500 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-blue-800 text-sm mb-1">{t('delivery.checkDelivery')}</h4>
                            <p className="text-sm text-blue-700/80">
                                Controleer de levering direct op beschadigingen en meldt dit direct bij de chauffeur op de vrachtbrief.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Delivery;