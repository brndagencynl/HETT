import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Facebook, Instagram, Linkedin, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-hett-primary text-white pt-16 pb-8 border-t-4 border-hett-secondary">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
              
              {/* Product Navigation */}
              <div className="grid grid-cols-2 gap-8 lg:contents">
                  <div className="col-span-1">
                      <h3 className="text-lg font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Producten</h3>
                      <ul className="space-y-3 text-sm font-medium text-white/70">
                          <li><Link to="/categorie/overkappingen" className="hover:text-white transition-colors flex items-center gap-2"><span>&rsaquo;</span> Veranda's</Link></li>
                          <li><Link to="/categorie/glazen-schuifwanden" className="hover:text-white transition-colors flex items-center gap-2"><span>&rsaquo;</span> Schuifwanden</Link></li>
                          <li><Link to="/categorie/sandwichpanelen" className="hover:text-white transition-colors flex items-center gap-2"><span>&rsaquo;</span> Sandwichpanelen</Link></li>
                          <li><Link to="/categorie/profielen" className="hover:text-white transition-colors flex items-center gap-2"><span>&rsaquo;</span> Profielen</Link></li>
                      </ul>
                  </div>

                  <div className="col-span-1">
                      <h3 className="text-lg font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Over HETT</h3>
                      <ul className="space-y-3 text-sm font-medium text-white/70">
                          <li><Link to="/over-ons" className="hover:text-white transition-colors flex items-center gap-2"><span>&rsaquo;</span> Over ons</Link></li>
                          <li><Link to="/showroom" className="hover:text-white transition-colors flex items-center gap-2"><span>&rsaquo;</span> Showroom</Link></li>
                          <li><Link to="/projecten" className="hover:text-white transition-colors flex items-center gap-2"><span>&rsaquo;</span> Projecten</Link></li>
                          <li><Link to="/blogs" className="hover:text-white transition-colors flex items-center gap-2"><span>&rsaquo;</span> Nieuws</Link></li>
                      </ul>
                  </div>
              </div>

              {/* Service Column */}
              <div>
                  <h3 className="text-lg font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Service</h3>
                  <ul className="space-y-3 text-sm font-medium text-white/70">
                      <li><Link to="/veelgestelde-vragen" className="hover:text-white transition-colors">Veelgestelde vragen</Link></li>
                      <li><Link to="/bezorging" className="hover:text-white transition-colors">Bezorging</Link></li>
                      <li><Link to="/montage-handleiding" className="hover:text-white transition-colors">Montage</Link></li>
                      <li><Link to="/garantie-en-klachten" className="hover:text-white transition-colors">Garantie</Link></li>
                  </ul>
              </div>

              {/* Contact Block: Single Column on mobile, 100% width */}
              <div className="w-full lg:w-auto">
                  <h3 className="text-lg font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Contact</h3>
                  <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-4">
                      <div className="flex items-start gap-3">
                          <MapPin size={18} className="text-hett-secondary flex-shrink-0 mt-1" />
                          <p className="text-sm font-medium text-white/80">
                              <strong className="block text-white mb-1">HETT B.V.</strong>
                              Industrieweg 45, 5600 AA Eindhoven
                          </p>
                      </div>
                      <div className="flex flex-col gap-3">
                          <a href="tel:0401234567" className="flex items-center gap-3 text-sm hover:text-hett-secondary transition-colors"><Phone size={18} /> 040 123 4567</a>
                          <a href="mailto:info@hett.nl" className="flex items-center gap-3 text-sm hover:text-hett-secondary transition-colors"><Mail size={18} /> info@hett.nl</a>
                      </div>
                      <div className="flex gap-4 pt-2">
                          <Facebook size={20} className="cursor-pointer hover:text-hett-secondary transition-colors" />
                          <Instagram size={20} className="cursor-pointer hover:text-hett-secondary transition-colors" />
                          <Linkedin size={20} className="cursor-pointer hover:text-hett-secondary transition-colors" />
                      </div>
                  </div>
              </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                  <img src="/logo.png" alt="HETT" className="h-8 brightness-0 invert" />
                  <p className="text-[10px] text-white/40 max-w-[200px]">Hoogwaardige panelen voor de professional.</p>
              </div>
              <div className="flex gap-4 opacity-50 grayscale brightness-200">
                  <div className="h-6 w-10 bg-white/20 rounded-sm"></div>
                  <div className="h-6 w-10 bg-white/20 rounded-sm"></div>
                  <div className="h-6 w-10 bg-white/20 rounded-sm"></div>
              </div>
              <p className="text-[10px] text-white/40 font-medium">© 2025 HETT B.V. Alle rechten voorbehouden.</p>
          </div>
      </div>
    </footer>
  );
};

export default Footer;