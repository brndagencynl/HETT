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
                            <h3 className="text-lg font-bold uppercase tracking-widest mb-6 border-b border-white pb-2">Producten</h3>
                            <li><Link to="/categorie/verandas" className="text-white hover:text-[#FF7300] transition-colors flex items-center gap-2"><span>&rsaquo;</span> Veranda's</Link></li>
                            <li><Link to="/categorie/sandwichpanelen" className="text-white hover:text-[#FF7300] transition-colors flex items-center gap-2"><span>&rsaquo;</span> Sandwichpanelen</Link></li>
                            <li><Link to="/categorie/accessoires" className="text-white hover:text-[#FF7300] transition-colors flex items-center gap-2"><span>&rsaquo;</span> Accessoires</Link></li>
                        </div>

                        <div className="col-span-1">
                            <h3 className="text-lg font-bold uppercase tracking-widest mb-6 border-b border-white pb-2">Over HETT</h3>
                            <ul className="space-y-3 text-sm font-medium">
                                <li><Link to="/over-ons" className="text-white hover:text-[#FF7300] transition-colors flex items-center gap-2"><span>&rsaquo;</span> Over ons</Link></li>
                                <li><Link to="/showroom" className="text-white hover:text-[#FF7300] transition-colors flex items-center gap-2"><span>&rsaquo;</span> Showroom</Link></li>
                                <li><Link to="/projecten" className="text-white hover:text-[#FF7300] transition-colors flex items-center gap-2"><span>&rsaquo;</span> Projecten</Link></li>
                                <li><Link to="/blogs" className="text-white hover:text-[#FF7300] transition-colors flex items-center gap-2"><span>&rsaquo;</span> Nieuws</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Service Column */}
                    <div>
                        <h3 className="text-lg font-bold uppercase tracking-widest mb-6 border-b border-white pb-2">Service</h3>
                        <ul className="space-y-3 text-sm font-medium">
                            <li><Link to="/veelgestelde-vragen" className="text-white hover:text-[#FF7300] transition-colors">Veelgestelde vragen</Link></li>
                            <li><Link to="/bezorging" className="text-white hover:text-[#FF7300] transition-colors">Bezorging</Link></li>
                            <li><Link to="/montage-handleiding" className="text-white hover:text-[#FF7300] transition-colors">Montage</Link></li>
                            <li><Link to="/garantie-en-klachten" className="text-white hover:text-[#FF7300] transition-colors">Garantie</Link></li>
                        </ul>
                    </div>

                    {/* Contact Block: Single Column on mobile, 100% width */}
                    <div className="w-full lg:w-auto">
                        <h3 className="text-lg font-bold uppercase tracking-widest mb-6 border-b border-white pb-2">Contact</h3>
                        <div className="bg-white/5 p-6 rounded-xl border border-white/20 space-y-4 text-white">
                            <div className="flex items-start gap-3">
                                <MapPin size={18} className="text-white flex-shrink-0 mt-1" />
                                <div className="text-sm font-medium">
                                    <strong className="block text-white mb-1 uppercase tracking-tight">HETT B.V.</strong>
                                    Industrieweg 45, 5600 AA Eindhoven
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <a href="tel:0401234567" className="flex items-center gap-3 text-sm text-white hover:text-[#FF7300] transition-colors"><Phone size={18} /> 040 123 4567</a>
                                <a href="mailto:info@hett.nl" className="flex items-center gap-3 text-sm text-white hover:text-[#FF7300] transition-colors"><Mail size={18} /> info@hett.nl</a>
                            </div>
                            <div className="flex gap-4 pt-2">
                                <Facebook size={20} className="text-white cursor-pointer hover:text-[#FF7300] transition-colors" />
                                <Instagram size={20} className="text-white cursor-pointer hover:text-[#FF7300] transition-colors" />
                                <Linkedin size={20} className="text-white cursor-pointer hover:text-[#FF7300] transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="HETT" className="h-8 brightness-0 invert" />
                        <p className="text-[10px] text-white">Hoogwaardige panelen voor de professional.</p>
                    </div>
                    <div className="flex gap-4 opacity-70 grayscale brightness-200">
                        <div className="h-6 w-10 bg-white/20 rounded-sm"></div>
                        <div className="h-6 w-10 bg-white/20 rounded-sm"></div>
                        <div className="h-6 w-10 bg-white/20 rounded-sm"></div>
                    </div>
                    <p className="text-[10px] text-white font-medium">© 2025 HETT B.V. Alle rechten voorbehouden.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;