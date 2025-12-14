
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, CheckCircle2, Facebook, Instagram, Linkedin, Youtube, ArrowRight, ChevronDown } from 'lucide-react';

const FooterSection = ({ title, children }: { title: string, children?: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/20 md:border-none last:border-none">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-between w-full py-5 md:py-0 md:mb-6 text-left md:cursor-default group select-none"
      >
        <h3 className="text-base md:text-xl font-black uppercase tracking-wider md:tracking-normal">{title}</h3>
        <ChevronDown 
            size={24} 
            className={`md:hidden transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 md:block md:h-auto md:opacity-100 ${isOpen ? 'max-h-[500px] opacity-100 pb-6' : 'max-h-0 opacity-0'} md:max-h-none md:pb-0`}>
        {children}
      </div>
    </div>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="font-sans">

      {/* --- Top Bar (USPs) --- */}
      <div className="bg-hett-orangeLight py-3 border-b border-gray-200/50 hidden md:block">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-xs md:text-sm font-bold text-gray-800">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-hett-brown" size={18} />
                    <span>10 jaar garantie op HETT</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-hett-brown" size={18} />
                    <span>Professionele inmeting en montage</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-hett-brown" size={18} />
                    <span>Bekend van RTL4 / way of living</span>
                </div>
            </div>
        </div>
      </div>

      {/* --- Main Footer --- */}
      <div className="bg-hett-brown text-white pt-0 md:pt-16 pb-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 md:gap-8 mb-8 md:mb-16 border-t border-white/20 md:border-t-0">
                
                {/* Column 1: Producten */}
                <FooterSection title="Assortiment">
                    <ul className="space-y-3 text-sm font-medium">
                        <li><Link to="/categorie/overkappingen" className="hover:underline block py-1">Veranda's</Link></li>
                        <li><Link to="/categorie/sandwichpanelen" className="hover:underline block py-1">Sandwichpanelen</Link></li>
                        <li><Link to="/categorie/overkappingen" className="hover:underline block py-1">Tuinoverkapping</Link></li>
                        <li><Link to="/categorie/overkappingen" className="hover:underline block py-1">Serre</Link></li>
                        <li><Link to="/categorie/accessoires" className="hover:underline block py-1">Carport</Link></li>
                        <li><Link to="/categorie/accessoires" className="hover:underline flex items-center justify-between py-1">Accessoires</Link></li>
                    </ul>
                </FooterSection>

                {/* Column 2: Service */}
                <FooterSection title="Klantenservice">
                    <ul className="space-y-3 text-sm font-medium">
                        <li><Link to="/veelgestelde-vragen" className="hover:underline block py-1">Veelgestelde vragen</Link></li>
                        <li><Link to="/bezorging" className="hover:underline block py-1">Bezorging</Link></li>
                        <li><Link to="/betaalmethoden" className="hover:underline block py-1">Betaalmethoden</Link></li>
                        <li><Link to="/montage-handleiding" className="hover:underline block py-1">Montage handleiding</Link></li>
                        <li><Link to="/afhalen" className="hover:underline block py-1">Afhalen</Link></li>
                        <li><Link to="/garantie-en-klachten" className="hover:underline block py-1">Garantie & klachten</Link></li>
                        <li><Link to="/retourneren" className="hover:underline block py-1">Retourneren</Link></li>
                    </ul>
                </FooterSection>

                {/* Column 3: Informatie */}
                <FooterSection title="Informatie">
                    <ul className="space-y-3 text-sm font-medium">
                        <li><Link to="/over-ons" className="hover:underline block py-1">Over ons</Link></li>
                        <li><Link to="/contact" className="hover:underline block py-1">Contact</Link></li>
                        <li><Link to="/showroom" className="hover:underline block py-1">Showroom</Link></li>
                        <li><Link to="/blogs" className="hover:underline block py-1">Blogs</Link></li>
                        <li><Link to="/algemene-voorwaarden" className="hover:underline block py-1">Algemene voorwaarden</Link></li>
                        <li><Link to="/leveringsvoorwaarden" className="hover:underline block py-1">Leverings voorwaarden</Link></li>
                        <li><Link to="/privacy" className="hover:underline block py-1">Privacy Policy</Link></li>
                    </ul>
                </FooterSection>

                {/* Column 4: Contact */}
                <FooterSection title="HETT B.V.">
                    <ul className="space-y-4 text-sm font-medium">
                        <li>
                            <strong className="block text-lg">HETT B.V.</strong>
                            Industrieweg 45<br/>
                            5600 AA Eindhoven
                        </li>
                        <li className="space-y-1">
                            <div className="opacity-90">KVK: 92626963</div>
                            <div className="opacity-90">BTW: NL866121171B01</div>
                        </li>
                        <li className="space-y-2">
                            <a href="tel:0401234567" className="flex items-center gap-2 hover:underline py-1"><Phone size={18} fill="currentColor" /> 040 123 4567</a>
                            <a href="mailto:info@hett.nl" className="flex items-center gap-2 hover:underline py-1"><Mail size={18} fill="currentColor" /> info@hett.nl</a>
                        </li>
                    </ul>
                </FooterSection>
            </div>

            {/* Middle Section: Logo, CTA, Partners (Hidden on small mobile if desired, but keeping for now as per minimal change) */}
            <div className="flex flex-col lg:flex-row justify-between items-end gap-12 border-b border-white/20 pb-12 mb-8 pt-8 md:pt-0">
                
                {/* Left: Branding & CTA */}
                <div className="max-w-md hidden md:block">
                    {/* Using standard logo but inverted for white-on-orange */}
                    <img src="/logo.png" alt="HETT" className="h-16 mb-6 brightness-0 invert" /> 
                    
                    <h2 className="text-2xl font-bold mb-6">HETT - specialist in veranda's, tuinkamers en overkappingen</h2>
                    
                    <Link to="/configurator" className="inline-block bg-[#4caf50] text-white font-black text-sm uppercase tracking-wider px-8 py-4 rounded-full hover:bg-[#45a049] transition-colors shadow-md transform hover:-translate-y-1">
                        Stel je veranda samen
                    </Link>
                </div>

                {/* Right: Trust & Partners */}
                <div className="flex flex-col items-center lg:items-end gap-8 w-full lg:w-auto">
                    {/* Trustpilot (Mock) */}
                    <div className="flex items-center gap-4">
                        <div className="text-center lg:text-right">
                            <div className="font-bold text-lg hover:underline cursor-pointer">Uitstekend</div>
                            <div className="flex text-white gap-1 justify-center lg:justify-end">
                                {[1,2,3,4,5].map(i => <div key={i} className="w-6 h-6 bg-[#00b67a] flex items-center justify-center"><span className="text-white text-sm">★</span></div>)}
                            </div>
                            <div className="text-xs mt-1 opacity-80">4.8 op Trustpilot</div>
                        </div>
                    </div>

                    {/* Socials - Visible on Mobile too now */}
                    <div className="flex gap-4">
                             <a href="#" className="bg-white/10 text-white p-3 rounded-full hover:bg-white/20 transition-colors"><Facebook size={20} /></a>
                             <a href="#" className="bg-white/10 text-white p-3 rounded-full hover:bg-white/20 transition-colors"><Instagram size={20} /></a>
                             <a href="#" className="bg-white/10 text-white p-3 rounded-full hover:bg-white/20 transition-colors"><Linkedin size={20} /></a>
                             <a href="#" className="bg-white/10 text-white p-3 rounded-full hover:bg-white/20 transition-colors"><Youtube size={20} /></a>
                    </div>

                    {/* Webwinkel Keur (Mock) */}
                    <div className="hidden md:flex bg-[#e54589] text-white px-4 py-2 rounded items-center gap-3 text-xs font-bold w-full max-w-[280px] shadow-sm">
                         <div className="bg-white text-[#e54589] rounded-full w-8 h-8 flex items-center justify-center text-lg flex-shrink-0">✓</div>
                         <div>
                            <span className="block text-sm">Vertrouwd online shoppen</span>
                            <span className="font-normal text-[10px] opacity-90">met zekerheid van WebwinkelKeur</span>
                         </div>
                    </div>
                </div>
            </div>

            {/* Copyright & Payment */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-medium opacity-80">
                <p className="text-center md:text-left">© 2025 HETT B.V. Alle rechten voorbehouden.</p>
                <div className="flex gap-2">
                     <div className="h-8 w-12 bg-white rounded flex items-center justify-center text-black font-bold text-[9px] shadow-sm">iDEAL</div>
                     <div className="h-8 w-12 bg-white rounded flex items-center justify-center text-black font-bold text-[9px] shadow-sm">VISA</div>
                     <div className="h-8 w-12 bg-white rounded flex items-center justify-center text-black font-bold text-[9px] shadow-sm">MC</div>
                     <div className="h-8 w-12 bg-white rounded flex items-center justify-center text-black font-bold text-[9px] shadow-sm">AMEX</div>
                     <div className="h-8 w-12 bg-white rounded flex items-center justify-center text-[#ffb3c7] font-bold text-[9px] shadow-sm bg-pink-100">Klarna.</div>
                </div>
            </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
