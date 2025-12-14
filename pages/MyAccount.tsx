
import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { User, Package, MapPin, LogOut, Settings } from 'lucide-react';

const MyAccount: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f6f8fa] font-sans">
        <PageHeader 
            title="Mijn Account" 
            subtitle="Login" 
            description="Beheer uw bestellingen en accountgegevens." 
            image="https://picsum.photos/1200/400?random=account"
        />
        
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                
                {/* Login */}
                <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-black text-hett-dark mb-6">Inloggen</h2>
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }}>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">E-mailadres</label>
                            <input type="email" className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white transition-all" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Wachtwoord</label>
                            <input type="password" className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white transition-all" required />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded text-hett-brown" /> Onthoud mij
                            </label>
                            <a href="#" className="text-hett-brown hover:underline">Wachtwoord vergeten?</a>
                        </div>
                        <button className="w-full bg-hett-dark text-white font-bold py-4 rounded-2xl hover:bg-hett-brown transition-colors">Inloggen</button>
                    </form>
                </div>

                {/* Register */}
                <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-black text-hett-dark mb-6">Registreren</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Maak een account aan om uw bestellingen te volgen, sneller af te rekenen en toegang te krijgen tot exclusieve aanbiedingen.
                    </p>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">E-mailadres</label>
                            <input type="email" className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white transition-all" />
                        </div>
                        <button className="w-full bg-white border-2 border-hett-dark text-hett-dark font-bold py-4 rounded-2xl hover:bg-hett-dark hover:text-white transition-colors">Account aanmaken</button>
                    </form>
                </div>

            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title="Welkom terug, Jan" 
        subtitle="Mijn Account" 
        description="Beheer hier uw bestellingen en persoonlijke gegevens." 
        image="https://picsum.photos/1200/400?random=dashboard"
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
                <nav className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 space-y-2 sticky top-32">
                    <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={User}>Dashboard</NavButton>
                    <NavButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={Package}>Bestellingen</NavButton>
                    <NavButton active={activeTab === 'addresses'} onClick={() => setActiveTab('addresses')} icon={MapPin}>Adressen</NavButton>
                    <NavButton active={activeTab === 'details'} onClick={() => setActiveTab('details')} icon={Settings}>Accountgegevens</NavButton>
                    <div className="border-t border-gray-100 my-2 pt-2">
                        <button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold text-red-500 hover:bg-red-50 transition-colors">
                            <LogOut size={20} /> Uitloggen
                        </button>
                    </div>
                </nav>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
                {activeTab === 'dashboard' && (
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-black text-hett-dark mb-4">Dashboard</h2>
                        <p className="text-gray-600 mb-8">
                            Hallo <strong>Jan</strong> (niet Jan? <button onClick={() => setIsLoggedIn(false)} className="text-hett-brown underline">Log uit</button>).
                            Vanaf uw account dashboard kunt u uw recente bestellingen bekijken, uw verzend- en factuuradressen beheren en uw wachtwoord en accountgegevens bewerken.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                <div className="text-3xl font-black text-blue-600 mb-1">2</div>
                                <div className="text-sm font-bold text-blue-800">Lopende bestellingen</div>
                            </div>
                            <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                                <div className="text-3xl font-black text-green-600 mb-1">14</div>
                                <div className="text-sm font-bold text-green-800">Voltooide orders</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-black text-hett-dark mb-6">Bestellingen</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold">
                                    <tr>
                                        <th className="p-4 rounded-l-xl">Order</th>
                                        <th className="p-4">Datum</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Totaal</th>
                                        <th className="p-4 rounded-r-xl">Actie</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <td className="p-4 font-bold text-hett-dark">#12345</td>
                                        <td className="p-4 text-gray-500">10 Mei 2024</td>
                                        <td className="p-4"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Voltooid</span></td>
                                        <td className="p-4 font-bold">€1.895,-</td>
                                        <td className="p-4"><button className="text-hett-brown font-bold hover:underline">Bekijken</button></td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-bold text-hett-dark">#12346</td>
                                        <td className="p-4 text-gray-500">22 Mei 2024</td>
                                        <td className="p-4"><span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">In behandeling</span></td>
                                        <td className="p-4 font-bold">€349,-</td>
                                        <td className="p-4"><button className="text-hett-brown font-bold hover:underline">Bekijken</button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'addresses' && (
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-black text-hett-dark mb-6">Adressen</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-bold text-lg mb-4">Factuuradres</h3>
                                <address className="not-italic text-gray-600 leading-relaxed">
                                    Jan Jansen<br/>
                                    HETT B.V.<br/>
                                    Industrieweg 45<br/>
                                    5600 AA Eindhoven<br/>
                                    Nederland
                                </address>
                                <button className="text-hett-brown font-bold text-sm mt-4 hover:underline">Bewerken</button>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-4">Verzendadres</h3>
                                <address className="not-italic text-gray-600 leading-relaxed">
                                    Jan Jansen<br/>
                                    HETT B.V.<br/>
                                    Industrieweg 45<br/>
                                    5600 AA Eindhoven<br/>
                                    Nederland
                                </address>
                                <button className="text-hett-brown font-bold text-sm mt-4 hover:underline">Bewerken</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, children, icon: Icon }: any) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold transition-all ${
            active ? 'bg-hett-dark text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
        }`}
    >
        <Icon size={20} />
        {children}
    </button>
);

export default MyAccount;
