import React from 'react';
import PageHeader from '../components/PageHeader';
import { Truck, MapPin, Clock, AlertTriangle, ShieldCheck, CreditCard, Pen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Delivery: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { id: 'bezorgen', title: 'Bezorgen & Afhalen', icon: Truck, path: '/bezorging' },
    { id: 'garantie', title: 'Garantie & Service', icon: ShieldCheck, path: '/garantie-en-klachten' },
    { id: 'betalen', title: 'Bestellen & Betalen', icon: CreditCard, path: '/betaalmethoden' },
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
                    <h1 className="text-3xl md:text-4xl font-black text-hett-dark mb-4">Bezorgen & Afhalen</h1>
                    <p className="text-gray-500 max-w-2xl">Alles over onze leveringen, transportkosten en wat u kunt verwachten.</p>
                </div>

                <div className="bg-white p-8 md:p-12 rounded-lg shadow-soft border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                        <div>
                            <h2 className="text-2xl font-black text-hett-dark mb-4">Levertijden</h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Wij streven ernaar om voorraadproducten binnen <strong>1 tot 2 weken</strong> te leveren in heel Nederland en België.
                            </p>
                            <div className="flex items-center gap-3 text-sm font-bold text-hett-brown bg-orange-50 p-4 rounded-lg border border-orange-100">
                                <Clock size={20} />
                                <span>Actuele levertijd: 5-10 werkdagen</span>
                            </div>
                        </div>
                        <div>
                             <h2 className="text-2xl font-black text-hett-dark mb-4">Verzendkosten</h2>
                             <ul className="space-y-3">
                                <li className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <span className="text-gray-600">Bestellingen &gt; € 2.500,00</span>
                                    <span className="font-bold text-green-600">Gratis</span>
                                </li>
                                <li className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <span className="text-gray-600">Nederland (standaard)</span>
                                    <span className="font-bold text-hett-dark">€ 75,00</span>
                                </li>
                                <li className="flex justify-between items-center pb-2">
                                    <span className="text-gray-600">België (standaard)</span>
                                    <span className="font-bold text-hett-dark">€ 95,00</span>
                                </li>
                             </ul>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-hett-dark mb-4 flex items-center gap-2">
                        <Truck size={22} className="text-hett-primary" />
                        Levering aan huis
                    </h3>
                    <div className="prose prose-slate max-w-none text-gray-600 text-sm leading-relaxed mb-10">
                        <p>Onze producten worden geleverd met speciaal transport. Het lossen geschiedt naast de vrachtwagen ('aan de stoeprand').</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg flex items-start gap-4">
                        <AlertTriangle className="text-blue-500 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-blue-800 text-sm mb-1">Let op: Controle bij ontvangst</h4>
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