import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Mail, Check, Star } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-hett-dark pt-20 border-t border-gray-100 font-sans">
      
      {/* Top Section: Contact CTA */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <h2 className="text-4xl font-bold">Contact?</h2>
            
            <div className="flex flex-col md:flex-row gap-8 md:gap-16">
                <div className="flex gap-4 items-start">
                    <div className="mt-1">
                        <Phone size={28} strokeWidth={1.5} />
                    </div>
                    <div>
                        <div className="font-bold text-lg">Bel ons</div>
                        <div className="text-sm text-green-600 font-medium">09:00 - 17:30</div>
                        <a href="tel:+310401234567" className="text-xs text-gray-400 hover:text-hett-brown">+31 (0)40 123 4567</a>
                    </div>
                </div>
                <div className="flex gap-4 items-start">
                    <div className="mt-1">
                        <MessageCircle size={28} strokeWidth={1.5} />
                    </div>
                    <div>
                        <div className="font-bold text-lg">Chatten met HETT</div>
                        <div className="text-sm text-green-600 font-medium">09:00 - 17:30</div>
                        <span className="text-xs text-gray-400">Direct antwoord</span>
                    </div>
                </div>
                <div className="flex gap-4 items-start">
                    <div className="mt-1">
                        <Mail size={28} strokeWidth={1.5} />
                    </div>
                    <div>
                        <div className="font-bold text-lg">Whatsapp</div>
                        <div className="text-sm text-green-600 font-medium">Direct antwoord op werkdagen</div>
                        <a href="mailto:info@hett.nl" className="text-xs text-gray-400 hover:text-hett-brown">info@hett.nl</a>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* USP Bar */}
      <div className="border-y border-gray-100 bg-[#f9fafb] py-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4 text-sm font-bold text-hett-dark">
                    <span className="flex items-center gap-2"><Check size={20} strokeWidth={3} className="text-hett-dark" /> 20+ jaar ervaring</span>
                    <span className="flex items-center gap-2"><Check size={20} strokeWidth={3} className="text-hett-dark" /> Eigen fabriek</span>
                    <span className="flex items-center gap-2"><Check size={20} strokeWidth={3} className="text-hett-dark" /> Ervaren personeel</span>
                    <span className="flex items-center gap-2"><Check size={20} strokeWidth={3} className="text-hett-dark" /> Snelle levering</span>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex text-orange-400 gap-1">
                        <Star size={20} fill="currentColor" strokeWidth={0} />
                        <Star size={20} fill="currentColor" strokeWidth={0} />
                        <Star size={20} fill="currentColor" strokeWidth={0} />
                        <Star size={20} fill="currentColor" strokeWidth={0} />
                        <Star size={20} fill="currentColor" strokeWidth={0} />
                    </div>
                    <span className="font-bold text-sm text-slate-600">Klanten waarderen ons met een 9.4</span>
                </div>
            </div>
        </div>
      </div>

      {/* Main Links Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24">
          
          {/* Col 1: Company Info */}
          <div className="space-y-8">
            <div>
                <Link to="/" className="block mb-6">
                    <img src="/logo.png" alt="HETT Panelen & Profielen" className="h-14 w-auto object-contain" />
                </Link>
                <p className="text-gray-500 text-sm leading-relaxed">
                HETT is marktleider in de groothandel van sandwichpanelen, veranda's en buitenverblijven. Professionele kwaliteit direct uit voorraad.
                </p>
            </div>
            
            <div>
                <h4 className="font-bold text-hett-dark text-lg mb-4">Bedrijfsinformatie</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                    <li>Telefoonnummer</li>
                    <li>E-mailadres</li>
                    <li>Adres</li>
                </ul>
            </div>
          </div>

          {/* Col 2: Over HETT */}
          <div>
            <h4 className="font-bold text-hett-dark text-lg mb-6">Over HETT</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/veelgestelde-vragen" className="text-gray-500 hover:text-hett-dark transition-colors">Veelgestelde vragen</Link></li>
              <li><Link to="/over-ons" className="text-gray-500 hover:text-hett-dark transition-colors">Het team</Link></li>
              <li><Link to="/over-ons" className="text-gray-500 hover:text-hett-dark transition-colors">Over ons</Link></li>
              <li><Link to="/nieuws" className="text-gray-500 hover:text-hett-dark transition-colors">Blog</Link></li>
              <li><Link to="/projecten" className="text-gray-500 hover:text-hett-dark transition-colors">Projecten</Link></li>
            </ul>
          </div>

          {/* Col 3: Producten */}
          <div>
            <h4 className="font-bold text-hett-dark text-lg mb-6">Producten</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/producten" className="text-gray-500 hover:text-hett-dark transition-colors">Producten</Link></li>
              <li><Link to="/configurator" className="text-gray-500 hover:text-hett-dark transition-colors">Configurator</Link></li>
              <li><Link to="/dealers" className="text-gray-500 hover:text-hett-dark transition-colors">Zakelijk</Link></li>
            </ul>
          </div>

          {/* Col 4: Klantenservice */}
          <div>
            <h4 className="font-bold text-hett-dark text-lg mb-6">Klantenservice</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/veelgestelde-vragen" className="text-gray-500 hover:text-hett-dark transition-colors">Veelgestelde vragen</Link></li>
              <li><Link to="/contact" className="text-gray-500 hover:text-hett-dark transition-colors">Contact</Link></li>
              <li><Link to="/downloads" className="text-gray-500 hover:text-hett-dark transition-colors">Downloads</Link></li>
              <li><Link to="/downloads" className="text-gray-500 hover:text-hett-dark transition-colors">Garantievoorwaarden</Link></li>
              <li><Link to="/downloads" className="text-gray-500 hover:text-hett-dark transition-colors">Klachtenregeling</Link></li>
              <li><Link to="/contact" className="text-gray-500 hover:text-hett-dark transition-colors">Ervaring met klanten</Link></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100 py-10 text-center md:text-left">
         <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-sm text-gray-500">
            <p>&copy; 2024 Hettbv.com | <a href="#" className="hover:text-hett-dark">Privacybeleid & Cookie informatie</a> | <a href="#" className="hover:text-hett-dark">Algemene voorwaarden</a></p>
         </div>
      </div>
    </footer>
  );
};

export default Footer;