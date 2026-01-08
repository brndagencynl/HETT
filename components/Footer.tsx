import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Facebook, Instagram, Linkedin, MapPin } from 'lucide-react';
import { getFooterColumns, FooterColumn, FALLBACK_FOOTER_COLUMNS } from '../services/shopify';

const Footer: React.FC = () => {
    const [columns, setColumns] = useState<FooterColumn[]>(FALLBACK_FOOTER_COLUMNS);

    const sandwichpanelenUrl = '/products/sandwichpaneel';

    useEffect(() => {
        const fetchFooter = async () => {
            try {
                const data = await getFooterColumns();
                if (data.length > 0) {
                    setColumns(data);
                }
            } catch (error) {
                console.error('Failed to fetch footer columns:', error);
            }
        };

        fetchFooter();
    }, []);

    return (
        <footer className="bg-hett-primary text-white pt-16 pb-8 border-t-4 border-hett-secondary">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">

                    {/* Dynamic Footer Columns from Shopify */}
                    {columns.map((column, index) => (
                        <div key={index} className={index < 2 ? "col-span-1" : ""}>
                            <h3 className="text-lg font-bold uppercase tracking-widest mb-6 border-b border-white pb-2">
                                {column.title}
                            </h3>
                            <ul className="space-y-3 text-sm font-medium">
                                {column.links.map((link, linkIndex) => {
                                    const resolvedUrl =
                                        link.label === 'Sandwichpanelen' || link.url === '/categorie/sandwichpanelen'
                                            ? sandwichpanelenUrl
                                            : link.url;
                                    
                                    // Only render as Link if URL is valid
                                    if (!resolvedUrl || resolvedUrl === '#') {
                                        return (
                                            <li key={linkIndex}>
                                                <span className="text-white/60 flex items-center gap-2">
                                                    <span>&rsaquo;</span> {link.label}
                                                </span>
                                            </li>
                                        );
                                    }
                                    
                                    return (
                                        <li key={linkIndex}>
                                            <Link
                                                to={resolvedUrl}
                                                className="text-white hover:text-[#FF7300] transition-colors flex items-center gap-2"
                                            >
                                                <span>&rsaquo;</span> {link.label}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}

                    {/* Contact Block */}
                    <div className="w-full lg:w-auto">
                        <h3 className="text-lg font-bold uppercase tracking-widest mb-6 border-b border-white pb-2">Contact</h3>
                        <div className="bg-white/5 p-6 rounded-xl border border-white/20 space-y-4 text-white">
                            <div className="flex items-start gap-3">
                                <MapPin size={18} className="text-white flex-shrink-0 mt-1" />
                                <div className="text-sm font-medium">
                                    <strong className="block text-white mb-1 uppercase tracking-tight">HETT Veranda B.V.</strong>
                                    Hoppenkuil 17, 5626 DC Eindhoven
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <a href="tel:+31685406033" className="flex items-center gap-3 text-sm text-white hover:text-[#FF7300] transition-colors"><Phone size={18} /> +31 (0)6 85 40 60 33</a>
                                <a href="mailto:info@hettveranda.nl" className="flex items-center gap-3 text-sm text-white hover:text-[#FF7300] transition-colors"><Mail size={18} /> info@hettveranda.nl</a>
                            </div>
                            <div className="flex gap-4 pt-2">
                                <span className="text-white opacity-60" aria-label="Facebook"><Facebook size={20} /></span>
                                <span className="text-white opacity-60" aria-label="Instagram"><Instagram size={20} /></span>
                                <span className="text-white opacity-60" aria-label="LinkedIn"><Linkedin size={20} /></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <img src="/assets/images/hett-logo-navbar.png" alt="HETT" className="h-8 object-contain" />
                        <p className="text-[10px] text-white">Hoogwaardige Veranda's voor iedereen.</p>
                    </div>

                    <p className="text-[10px] text-white font-medium">© 2025 HETT Veranda B.V. Alle rechten voorbehouden.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;