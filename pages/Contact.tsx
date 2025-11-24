
import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-hett-light">
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
          <div className="bg-white p-8 shadow-sm border border-gray-200 rounded-sm">
            <h2 className="text-2xl font-bold text-hett-dark mb-6">Offerteformulier</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Voornaam</label>
                  <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:border-hett-brown focus:ring-1 focus:ring-hett-brown outline-none transition-colors bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Achternaam</label>
                  <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:border-hett-brown focus:ring-1 focus:ring-hett-brown outline-none transition-colors bg-gray-50" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Bedrijfsnaam</label>
                <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:border-hett-brown focus:ring-1 focus:ring-hett-brown outline-none transition-colors bg-gray-50" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">E-mailadres</label>
                  <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:border-hett-brown focus:ring-1 focus:ring-hett-brown outline-none transition-colors bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Telefoonnummer</label>
                  <input type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:border-hett-brown focus:ring-1 focus:ring-hett-brown outline-none transition-colors bg-gray-50" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Uw bericht / Aanvraag</label>
                <textarea rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:border-hett-brown focus:ring-1 focus:ring-hett-brown outline-none transition-colors bg-gray-50"></textarea>
              </div>

              <button type="button" className="w-full bg-hett-brown text-white font-bold uppercase tracking-wide py-4 rounded-sm hover:bg-hett-dark transition-colors">
                Verstuur Aanvraag
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white p-8 shadow-sm border border-gray-200 rounded-sm">
              <h3 className="text-xl font-bold text-hett-dark mb-6">Contactgegevens</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 text-hett-brown flex items-center justify-center rounded-sm flex-shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <strong className="block text-hett-dark mb-1">Bezoekadres</strong>
                    <span className="text-gray-600">Industrieweg 45<br />5600 AA Eindhoven</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 text-hett-brown flex items-center justify-center rounded-sm flex-shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <strong className="block text-hett-dark mb-1">Telefoon</strong>
                    <span className="text-gray-600">+31 (0)40 123 4567</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 text-hett-brown flex items-center justify-center rounded-sm flex-shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <strong className="block text-hett-dark mb-1">E-mail</strong>
                    <span className="text-gray-600">info@hett.nl</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 text-hett-brown flex items-center justify-center rounded-sm flex-shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <strong className="block text-hett-dark mb-1">Openingstijden</strong>
                    <span className="text-gray-600">Ma - Vr: 07:30 - 17:00<br />Za: Op afspraak</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Google Maps Placeholder */}
            <div className="h-64 bg-gray-200 rounded-sm overflow-hidden relative">
               <img src="https://picsum.photos/800/600?random=99" alt="Map location" className="w-full h-full object-cover opacity-50 grayscale" />
               <div className="absolute inset-0 flex items-center justify-center">
                   <button className="bg-white px-6 py-2 rounded shadow-md font-bold text-hett-dark hover:bg-gray-50">
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
