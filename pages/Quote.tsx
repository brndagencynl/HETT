
import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, Send } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const Quote: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const config = location.state as any; // Retrieve passed config

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    comments: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to send quote request to API would go here
    console.log("Sending quote:", { config, contact: form });
    alert("Uw offerteaanvraag is succesvol verzonden! We nemen binnen 24 uur contact op.");
    navigate('/');
  };

  if (!config) {
    return (
        <div className="min-h-screen bg-[#f6f8fa] flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Geen configuratie gevonden</h2>
                <Link to="/" className="text-hett-brown underline font-bold">Terug naar home</Link>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title="Offerte Aanvragen" 
        subtitle="Stap 2/2" 
        description="Vul uw gegevens in om uw persoonlijke offerte te ontvangen." 
        image="https://picsum.photos/1200/500?random=quote"
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-hett-dark mb-8 text-sm font-medium">
            <ArrowLeft size={16} className="mr-2" /> Terug
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left: Configuration Summary */}
            <div>
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 sticky top-32">
                    <h2 className="text-2xl font-black text-hett-dark mb-6">Uw Configuratie</h2>
                    
                    <div className="space-y-4 mb-8">
                        <SummaryRow label="Breedte" value={`${config.widthCm} cm`} />
                        <SummaryRow label="Diepte" value={`${config.depthCm} cm`} />
                        <SummaryRow label="Kleur" value={config.kleur || config.profileColor} />
                        <SummaryRow label="Daktype" value={config.roofType || config.daktype} />
                        <SummaryRow label="Zijwand Links" value={config.wallLeft === 'none' || config.wallLeft === 'geen' ? 'Geen' : (config.wallLeft || config.zijwand_links)} />
                        <SummaryRow label="Zijwand Rechts" value={config.wallRight === 'none' || config.wallRight === 'geen' ? 'Geen' : (config.wallRight || config.zijwand_rechts)} />
                        <SummaryRow label="Voorzijde" value={config.front === 'open' || config.front === 'geen' ? 'Volledig open' : (config.front || config.voorzijde)} />
                        <SummaryRow label="Verlichting" value={config.lighting || config.verlichting ? 'LED Set (6 spots)' : 'Geen'} />
                    </div>

                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                        <div className="flex items-start gap-3">
                            <Check className="text-blue-600 mt-1" size={20} />
                            <div>
                                <strong className="block text-blue-900 text-sm mb-1">Inclusief persoonlijk advies</strong>
                                <p className="text-xs text-blue-800/80">
                                    Een van onze specialisten kijkt uw configuratie na om zeker te zijn dat alles klopt voor uw situatie.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Contact Form */}
            <div>
                <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-[32px] shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-black text-hett-dark mb-8">Contactgegevens</h2>
                    
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Voornaam</label>
                            <input required type="text" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-hett-brown outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Achternaam</label>
                            <input required type="text" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-hett-brown outline-none transition-all" />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">E-mailadres</label>
                        <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-hett-brown outline-none transition-all" />
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Telefoonnummer</label>
                        <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-hett-brown outline-none transition-all" />
                    </div>

                    <div className="mb-8">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Opmerkingen (Optioneel)</label>
                        <textarea rows={4} value={form.comments} onChange={e => setForm({...form, comments: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-hett-brown outline-none transition-all resize-none"></textarea>
                    </div>

                    <button type="submit" className="w-full bg-hett-dark text-white font-black text-lg py-5 rounded-2xl hover:bg-hett-brown transition-all shadow-lg flex items-center justify-center gap-3">
                        <Send size={20} /> Aanvraag versturen
                    </button>
                    
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Uw gegevens worden veilig verwerkt conform ons privacybeleid.
                    </p>
                </form>
            </div>

        </div>
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value }: { label: string, value: string }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
        <span className="text-gray-500 font-medium text-sm">{label}</span>
        <span className="text-hett-dark font-bold text-sm text-right">{value}</span>
    </div>
);

export default Quote;
