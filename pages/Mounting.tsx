import React from 'react';
import PageHeader from '../components/PageHeader';
import { FileText, Download, Youtube, Wrench, PlayCircle, Truck, ShieldCheck, CreditCard, Pen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import MontageStepsSection from '../components/ui/MontageStepsSection';
import MontagePartnerSection from '../components/ui/MontagePartnerSection';
import { useTranslation } from 'react-i18next';

const Mounting: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();

    const navItems = [
        { id: 'bezorgen', title: t('mounting.tabs.delivery'), icon: Truck, path: '/bezorging' },
        { id: 'garantie', title: t('mounting.tabs.warranty'), icon: ShieldCheck, path: '/garantie-en-klachten' },
        { id: 'betalen', title: t('mounting.tabs.ordering'), icon: CreditCard, path: '/betaalmethoden' },
        { id: 'montage', title: 'Product & Montage', icon: Pen, path: '/montage-handleiding' },
    ];
    
  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title={t('mounting.title')}
        subtitle="Support"
        description={t('mounting.description')}
        image="https://picsum.photos/1200/600?random=mounting"
      />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Sidebar (Categorieën) */}
                    <aside className="lg:col-span-3">
                        <div className="sticky top-48">
                            <h3 className="sidebar-nav-title uppercase tracking-tight">{t('mounting.categories')}</h3>
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
                    <h2 className="text-3xl font-black text-hett-dark mb-4">{t('mounting.diyTitle')}</h2>
                    <p className="text-gray-600 leading-relaxed text-lg">
                        {t('mounting.diyDesc')}
                    </p>
                </div>

                {/* Manuals List */}
                <div>
                    <h3 className="text-xl font-bold text-hett-dark mb-6 flex items-center gap-2">
                        <FileText className="text-hett-brown" /> {t('mounting.pdfGuides')}
                    </h3>
                    <div className="space-y-4">
                        <ManualCard
                            title={t('mounting.guideTitle')}
                            version="v2024.1"
                            size="4.2 MB"
                            href="/assets/manuals/montagehandleiding-hett-veranda.pdf"
                        />
                    </div>
                </div>

                {/* Video Section */}
                <div>
                     <h3 className="text-xl font-bold text-hett-dark mb-6 flex items-center gap-2">
                        <Youtube className="text-red-600" /> Instructievideo's
                    </h3>
                    <a
                        href="https://youtu.be/wA4XeNEzMnA"
                        target="_blank"
                        rel="noreferrer"
                        className="block bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group"
                    >
                        <div className="aspect-video bg-gray-200 relative">
                            <img
                                src="https://img.youtube.com/vi/wA4XeNEzMnA/hqdefault.jpg"
                                className="w-full h-full object-cover opacity-90"
                                alt="Instructievideo montagehandleiding"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <PlayCircle size={56} className="text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
                            </div>
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-hett-dark">{t('mounting.guideTitle')}</h4>
                        </div>
                    </a>
                </div>

              </div>

              {/* Gereedschap Sidebar */}
              <div>
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 sticky top-32">
                    <h3 className="font-bold text-hett-dark text-lg mb-4 flex items-center gap-2">
                        <Wrench size={20} /> {t('mounting.tools')}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">{t('mounting.toolsDesc')}</p>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex gap-2"><Checkmark /> {t('mounting.toolsList.drill')}</li>
                        <li className="flex gap-2"><Checkmark /> {t('mounting.toolsList.level')}</li>
                        <li className="flex gap-2"><Checkmark /> {t('mounting.toolsList.tape')}</li>
                        <li className="flex gap-2"><Checkmark /> {t('mounting.toolsList.ladder')}</li>
                        <li className="flex gap-2"><Checkmark /> {t('mounting.toolsList.caulk')}</li>
                        <li className="flex gap-2"><Checkmark /> {t('mounting.toolsList.wrenches')}</li>
                        <li className="flex gap-2"><Checkmark /> {t('mounting.toolsList.holeSaw')}</li>
                    </ul>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <h4 className="font-bold text-hett-dark text-sm mb-2">Hulp nodig tijdens montage?</h4>
                        <p className="text-xs text-gray-500 mb-4">{t('mounting.supportNote')}</p>
                        <a href="tel:+31685406033" className="block w-full text-center bg-gray-50 text-hett-dark font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors text-sm">
                            {t('mounting.callSupport')}
                        </a>
                    </div>
                </div>
                            </div>
                        </div>

                        {/* Stepper Section */}
                        <MontageStepsSection />

                        {/* Partner CTA Section */}
                        <MontagePartnerSection />
                    </div>
                </div>
      </div>
    </div>
  );
};

const ManualCard = ({ title, version, size, href }: { title: string, version: string, size: string, href: string }) => (
    <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 hover:border-hett-brown hover:shadow-sm transition-all group"
    >
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
    </a>
);

const Checkmark = () => <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 text-xs">✓</div>;

export default Mounting;
