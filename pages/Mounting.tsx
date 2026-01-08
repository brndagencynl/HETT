
import React from 'react';
import PageHeader from '../components/PageHeader';
import { FileText, Download, Youtube, Wrench, PlayCircle, Truck, ShieldCheck, CreditCard, Pen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Mounting: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { id: 'bezorgen', title: 'Bezorgen & Afhalen', icon: Truck, path: '/bezorging' },
        { id: 'garantie', title: 'Garantie & Service', icon: ShieldCheck, path: '/garantie-en-klachten' },
        { id: 'betalen', title: 'Bestellen & Betalen', icon: CreditCard, path: '/betaalmethoden' },
        { id: 'montage', title: 'Product & Montage', icon: Pen, path: '/montage-handleiding' },
    ];
    
  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title="Montage Handleidingen"
        subtitle="Support"
        description="Stap-voor-stap instructies en video's om uw HETT product vakkundig te monteren."
        image="https://picsum.photos/1200/600?random=mounting"
      />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Sidebar (Categorieën) */}
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Content */}
                            <div className="lg:col-span-2 space-y-12">
                
                {/* Intro */}
                <div>
                    <h2 className="text-3xl font-black text-hett-dark mb-4">Zelf aan de slag</h2>
                    <p className="text-gray-600 leading-relaxed text-lg">
                        Al onze producten zijn ontwikkeld als slim bouwpakket. Met een beetje technische kennis en de juiste gereedschappen kunt u uw veranda of schuifwand zelf monteren. Hieronder vindt u de officiële handleidingen.
                    </p>
                </div>

                {/* Manuals List */}
                <div>
                    <h3 className="text-xl font-bold text-hett-dark mb-6 flex items-center gap-2">
                        <FileText className="text-hett-brown" /> PDF Handleidingen
                    </h3>
                    <div className="space-y-4">
                        <ManualCard title="Montagehandleiding HETT Veranda" version="v2024.1" size="4.2 MB" />
                        <ManualCard title="Montagehandleiding Glazen Schuifwand" version="v2.0" size="1.8 MB" />
                    </div>
                </div>

                {/* Video Section */}
                <div>
                     <h3 className="text-xl font-bold text-hett-dark mb-6 flex items-center gap-2">
                        <Youtube className="text-red-600" /> Instructievideo's
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer">
                            <div className="aspect-video bg-gray-200 relative">
                                <img src="#" className="w-full h-full object-cover opacity-90" alt="Video thumb" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <PlayCircle size={48} className="text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
                                </div>
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-hett-dark">Stap 1: Het plaatsen van de staanders</h4>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer">
                            <div className="aspect-video bg-gray-200 relative">
                                <img src="#" className="w-full h-full object-cover opacity-90" alt="Video thumb" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <PlayCircle size={48} className="text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
                                </div>
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-hett-dark">Stap 2: Goot en liggers monteren</h4>
                            </div>
                        </div>
                    </div>
                </div>

              </div>

              {/* Gereedschap Sidebar */}
              <div>
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 sticky top-32">
                    <h3 className="font-bold text-hett-dark text-lg mb-4 flex items-center gap-2">
                        <Wrench size={20} /> Benodigd Gereedschap
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">Zorg dat u deze gereedschappen in huis heeft voordat u begint:</p>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex gap-2"><Checkmark /> Accuboormachine</li>
                        <li className="flex gap-2"><Checkmark /> Waterpas (min. 1 meter)</li>
                        <li className="flex gap-2"><Checkmark /> Rolmaat</li>
                        <li className="flex gap-2"><Checkmark /> Ladder / Trap</li>
                        <li className="flex gap-2"><Checkmark /> Kitpistool</li>
                        <li className="flex gap-2"><Checkmark /> Ring-steeksleutels (10, 13, 17)</li>
                        <li className="flex gap-2"><Checkmark /> Gatenzaag (voor spots)</li>
                    </ul>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <h4 className="font-bold text-hett-dark text-sm mb-2">Hulp nodig tijdens montage?</h4>
                        <p className="text-xs text-gray-500 mb-4">Onze technische dienst is bereikbaar voor korte vragen.</p>
                        <a href="tel:+31685406033" className="block w-full text-center bg-gray-50 text-hett-dark font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors text-sm">
                            Bel +31 (0)6 85 40 60 33
                        </a>
                    </div>
                </div>
                            </div>
                        </div>
                    </div>
                </div>
      </div>
    </div>
  );
};

const ManualCard = ({ title, version, size }: { title: string, version: string, size: string }) => (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 hover:border-hett-brown hover:shadow-sm transition-all group cursor-pointer">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText size={20} />
            </div>
            <div>
                <h4 className="font-bold text-hett-dark text-sm sm:text-base group-hover:text-hett-brown transition-colors">{title}</h4>
                <div className="flex gap-3 text-xs text-gray-400">
                    <span>{version}</span>
                    <span>•</span>
                    <span>{size}</span>
                </div>
            </div>
        </div>
        <Download size={20} className="text-gray-300 group-hover:text-hett-brown transition-colors" />
    </div>
);

const Checkmark = () => <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 text-xs">✓</div>;

export default Mounting;
