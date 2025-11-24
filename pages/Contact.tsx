
import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      {/* Header */}
      <PageHeader 
        title="Neem contact op"
        subtitle="Contact"
        description="Heeft u vragen over onze panelen of wilt u een offerte op maat? Ons team staat voor u klaar."
        image="https://picsum.photos/1200/800?random=4"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Form */}
          <div className="bg-white p-8 md:p-10 shadow-sm border border-gray-100 rounded-[32px]">
            <h2 className="text-3xl font-black text-hett-dark mb-8">Offerteformulier</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Voornaam</label>
                  <input type="text" className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-hett-brown focus:ring-1 focus:ring-hett-brown outline-none transition-all bg-gray-50 hover:bg-white" placeholder="Bijv. Jan" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Achternaam</label>
                  <input type="text" className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-hett-brown focus:ring-1 focus:ring-hett-brown outline-none transition-all bg-gray-50 hover:bg-white" placeholder="Bijv. Jansen" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bedrijfsnaam</label>
                <input type="text" className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-hett-brown focus:ring-1 focus:ring-hett-brown outline-none transition-all bg-gray-50 hover:bg-white" placeholder="Optioneel" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">E-mailadres</label>
                  <input type="email" className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-hett-brown focus:ring-1 focus:ring-hett-brown outline-none transition-all bg-gray-50 hover:bg-white" placeholder="naam@bedrijf.nl" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Telefoonnummer</label>
                  <input type="tel" className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-hett-brown focus:ring-1 focus:ring-hett-brown outline-none transition-all bg-gray-50 hover:bg-white" placeholder="06 12345678" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Uw bericht / Aanvraag</label>
                <textarea rows={5} className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-hett-brown focus:ring-1 focus:ring-hett-brown outline-none transition-all bg-gray-50 hover:bg-white resize-none" placeholder="Waar kunnen we u mee helpen?"></textarea>
              </div>

              <button type="button" className="w-full bg-hett-dark text-white font-bold text-lg py-5 rounded-full hover:bg-hett-brown transition-all shadow-lg transform hover:-translate-y-1">
                Verstuur Aanvraag
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white p-8 md:p-10 shadow-sm border border-gray-100 rounded-[32px]">
              <h3 className="text-2xl font-bold text-hett-dark mb-8">Contactgegevens</h3>
              <ul className="space-y-8">
                <li className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-[#fdf6d3] text-hett-brown flex items-center justify-center rounded-2xl flex-shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <strong className="block text-hett-dark text-lg mb-1">Bezoekadres</strong>
                    <span className="text-gray-600 leading-relaxed">Industrieweg 45<br />5600 AA Eindhoven</span>
                  </div>
                </li>
                <li className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-[#fdf6d3] text-hett-brown flex items-center justify-center rounded-2xl flex-shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <strong className="block text-hett-dark text-lg mb-1">Telefoon</strong>
                    <span className="text-gray-600 block mb-1">+31 (0)40 123 4567</span>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded inline-block">Nu bereikbaar</span>
                  </div>
                </li>
                <li className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-[#fdf6d3] text-hett-brown flex items-center justify-center rounded-2xl flex-shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <strong className="block text-hett-dark text-lg mb-1">E-mail</strong>
                    <a href="mailto:info@hett.nl" className="text-gray-600 hover:text-hett-brown transition-colors">info@hett.nl</a>
                  </div>
                </li>
                <li className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-[#fdf6d3] text-hett-brown flex items-center justify-center rounded-2xl flex-shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <strong className="block text-hett-dark text-lg mb-1">Openingstijden</strong>
                    <div className="text-gray-600 space-y-1">
                        <div className="flex justify-between w-40"><span className="font-medium">Ma - Vr:</span> <span>07:30 - 17:00</span></div>
                        <div className="flex justify-between w-40"><span className="font-medium">Za:</span> <span>Op afspraak</span></div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Google Maps Placeholder */}
            <div className="h-80 bg-gray-200 rounded-[32px] overflow-hidden relative shadow-sm border border-gray-100 group">
               <img src="https://picsum.photos/800/600?random=99" alt="Map location" className="w-full h-full object-cover opacity-60 grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" />
               <div className="absolute inset-0 flex items-center justify-center">
                   <button className="bg-white px-8 py-4 rounded-full shadow-xl font-bold text-hett-dark hover:bg-gray-50 transition-all hover:scale-105 flex items-center gap-2">
                       <MapPin size={20} />
                       Google Maps Openen
                   </button>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
