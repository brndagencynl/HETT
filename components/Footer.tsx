import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Mail, Check, Star } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#f6f8fa] font-sans">
      
      {/* --- PRE-FOOTER: Contact Section (Preserved) --- */}
      <div className="bg-white pt-20 pb-16 border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                <h2 className="text-4xl font-bold text-hett-dark">Contact?</h2>
                
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
      </div>

      {/* --- PRE-FOOTER: USP Bar (Preserved) --- */}
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

      {/* --- NEW FOOTER DESIGN (Card Style) --- */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="bg-white rounded-[32px] p-8 md:p-12 lg:p-16 shadow-sm border border-gray-100">
            
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 xl:gap-24 mb-16">
                
                {/* Left: Newsletter */}
                <div className="xl:col-span-4 flex flex-col items-start">
                    <Link to="/" className="block mb-8">
                        <img src="/logo.png" alt="HETT" className="h-10 w-auto object-contain" />
                    </Link>
                    
                    <h3 className="text-xl font-bold text-hett-dark mb-6">Schrijf je in voor updates.</h3>
                    
                    <div className="relative w-full mb-6">
                        <input 
                            type="email" 
                            placeholder="Jouw e-mailadres" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-6 pr-36 outline-none focus:border-hett-brown focus:bg-white transition-all"
                        />
                        <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-hett-dark text-white rounded-full px-6 text-sm font-bold hover:bg-hett-brown transition-colors shadow-sm">
                            Inschrijven
                        </button>
                    </div>
                    
                    <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                        Door je in te schrijven ga je akkoord met ons <Link to="#" className="underline hover:text-hett-dark">Privacybeleid</Link> en geef je toestemming voor het ontvangen van updates van HETT.
                    </p>
                </div>

                {/* Right: Navigation Links */}
                <div className="xl:col-span-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                    
                    <div>
                        <h4 className="font-bold text-hett-dark mb-6">Producten</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link to="/producten" className="hover:text-hett-brown transition-colors">Dakpanelen</Link></li>
                            <li><Link to="/producten" className="hover:text-hett-brown transition-colors">Wandpanelen</Link></li>
                            <li><Link to="/producten" className="hover:text-hett-brown transition-colors">Profielen</Link></li>
                            <li><Link to="/configurator" className="hover:text-hett-brown transition-colors">Configurator</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-hett-dark mb-6">Inspiratie</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link to="/projecten" className="hover:text-hett-brown transition-colors">Projecten</Link></li>
                            <li><Link to="/nieuws" className="hover:text-hett-brown transition-colors">Blog</Link></li>
                            <li><Link to="/dealers" className="hover:text-hett-brown transition-colors">Zakelijk</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-hett-dark mb-6">Over HETT</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link to="/over-ons" className="hover:text-hett-brown transition-colors">Het Team</Link></li>
                            <li><Link to="/over-ons" className="hover:text-hett-brown transition-colors">Over ons</Link></li>
                            <li><Link to="/contact" className="hover:text-hett-brown transition-colors">Vacatures</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-hett-dark mb-6">Service</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link to="/contact" className="hover:text-hett-brown transition-colors">Contact</Link></li>
                            <li><Link to="/veelgestelde-vragen" className="hover:text-hett-brown transition-colors">FAQ</Link></li>
                            <li><Link to="/downloads" className="hover:text-hett-brown transition-colors">Downloads</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-hett-dark mb-6">Juridisch</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link to="#" className="hover:text-hett-brown transition-colors">Voorwaarden</Link></li>
                            <li><Link to="#" className="hover:text-hett-brown transition-colors">Privacy</Link></li>
                            <li><Link to="#" className="hover:text-hett-brown transition-colors">Cookies</Link></li>
                        </ul>
                    </div>

                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-100 pt-8 text-center">
                 <p className="text-sm text-gray-400">© 2024 Hettbv.com, Alle rechten voorbehouden.</p>
            </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;