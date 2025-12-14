
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, Search as SearchIcon, Lightbulb, Headset, Check, Star, ChevronDown, User, Heart } from 'lucide-react';
import { NAV_ITEMS, PRODUCTS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { itemCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // Handle Scroll Effect for Desktop
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 40;
      setIsScrolled(scrolled);
      if (!scrolled) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
        searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Live Search Effect
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const filtered = PRODUCTS.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
      setSearchQuery('');
      setIsFocused(false);
      setIsSearchOpen(false);
    }
  };

  const menuVariants = {
    closed: { x: "-100%", transition: { type: "tween", duration: 0.3 } },
    open: { x: 0, transition: { type: "tween", duration: 0.3 } }
  };

  const showSearchForm = !isScrolled || isSearchOpen;

  return (
    <>
      <div className="fixed top-0 w-full z-50 font-sans bg-white shadow-sm/50 backdrop-blur-sm">
        
        {/* ================= MOBILE HEADER (Visible < md) ================= */}
        <div className="md:hidden border-b border-gray-200 bg-white">
            
            {/* ROW 1: Menu, Logo, Icons */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsOpen(true)} 
                        className="text-hett-dark p-1 -ml-1"
                    >
                        <Menu size={28} strokeWidth={2} />
                    </button>
                    <Link to="/" className="flex-shrink-0">
                        <img src="/logo.png" alt="HETT" className="h-6 w-auto object-contain" />
                    </Link>
                </div>

                <div className="flex items-center gap-5 text-hett-dark">
                    <Link to="/my-account" className="relative group">
                        <User size={26} strokeWidth={1.5} />
                        {/* Notification Badge Example */}
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-hett-brown rounded-full border-2 border-white"></span>
                    </Link>
                    <Link to="/wishlist">
                        <Heart size={26} strokeWidth={1.5} />
                    </Link>
                    <Link to="/cart" className="relative">
                        <ShoppingCart size={26} strokeWidth={1.5} />
                        {itemCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-hett-brown text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                                {itemCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* ROW 2: Search Bar */}
            <div className="px-4 pb-4">
                <form onSubmit={handleSearch} className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-hett-dark" size={20} strokeWidth={2.5} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Zoeken" 
                        className="w-full bg-[#f1f3f5] text-hett-dark font-medium py-3 pl-10 pr-4 rounded-lg outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-hett-dark placeholder:font-medium text-base"
                    />
                </form>
            </div>
        </div>


        {/* ================= DESKTOP HEADER (Visible >= md) ================= */}
        
        {/* --- ROW 1: Top Bar --- */}
        <div className={`hidden md:block bg-hett-primary text-white text-xs font-medium py-2 transition-all duration-300 ${isScrolled ? 'h-0 py-0 overflow-hidden opacity-0' : 'h-auto opacity-100'}`}>
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <div className="flex gap-6">
                    <span className="flex items-center gap-1.5"><Check size={14} strokeWidth={3} className="text-hett-brown" /> Sinds 2011</span>
                    <span className="flex items-center gap-1.5"><Check size={14} strokeWidth={3} className="text-hett-brown" /> Persoonlijk advies</span>
                    <span className="flex items-center gap-1.5"><Check size={14} strokeWidth={3} className="text-hett-brown" /> Snelle levering</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="flex text-yellow-400">
                            <Star size={12} fill="currentColor" />
                            <Star size={12} fill="currentColor" />
                            <Star size={12} fill="currentColor" />
                            <Star size={12} fill="currentColor" />
                            <Star size={12} fill="currentColor" />
                        </div>
                        <span className="font-bold">9.2</span>
                    </div>
                </div>
            </div>
        </div>

        {/* --- ROW 2: Main Header --- */}
        <div className={`hidden md:flex transition-all duration-300 border-b border-gray-100 ${isScrolled ? 'py-3' : 'py-6'}`}>
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-12 w-full">
                
                <Link to="/" className="flex-shrink-0 transform hover:scale-105 transition-transform">
                    <img src="/logo.png" alt="HETT" className="h-10 object-contain" />
                </Link>

                {/* Rounded Search Bar */}
                <form 
                    onSubmit={handleSearch} 
                    className={`relative group transition-all duration-300 ease-in-out ${showSearchForm ? 'flex flex-grow max-w-2xl opacity-100 scale-100' : 'w-0 opacity-0 scale-95 overflow-hidden p-0 m-0'}`}
                >
                    <input 
                        ref={searchInputRef}
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        placeholder="Waar ben je naar op zoek?" 
                        className="w-full pl-6 pr-14 py-3 border border-gray-200 bg-gray-50 rounded-full text-gray-700 outline-none focus:border-hett-primary focus:bg-white focus:ring-4 focus:ring-hett-primary/10 transition-all placeholder:text-gray-400 font-medium"
                    />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-hett-primary text-white rounded-full hover:bg-blue-800 transition-colors flex items-center shadow-md hover:shadow-lg transform active:scale-95">
                         <SearchIcon size={18} />
                    </button>

                    {/* Close button for search mode in sticky header */}
                    {isScrolled && isSearchOpen && (
                        <button 
                            type="button" 
                            onClick={() => setIsSearchOpen(false)}
                            className="absolute -right-10 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-hett-dark"
                        >
                            <X size={20} />
                        </button>
                    )}

                    {/* Results Dropdown */}
                    <AnimatePresence>
                        {isFocused && searchQuery.length >= 2 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                className="absolute top-full left-0 right-0 bg-white shadow-2xl border border-gray-100 mt-2 z-50 py-2 rounded-2xl overflow-hidden"
                            >
                                {results.length > 0 ? (
                                    <>
                                        <div className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">Producten</div>
                                        {results.map(product => (
                                            <Link
                                                key={product.id}
                                                to={`/product/${product.id}`}
                                                onClick={() => { setIsFocused(false); setSearchQuery(''); setIsSearchOpen(false); }}
                                                className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 group border-b border-gray-50 last:border-0 transition-colors duration-200"
                                            >
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 group-hover:border-hett-brown/30 transition-colors">
                                                    <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-hett-dark text-sm group-hover:text-hett-brown line-clamp-1 transition-colors">{product.title}</div>
                                                    <div className="text-xs text-gray-500">{product.category}</div>
                                                </div>
                                                <div className="ml-auto font-bold text-sm text-hett-dark bg-gray-100 group-hover:bg-white group-hover:shadow-sm px-2 py-1 rounded transition-all">€{product.price}</div>
                                            </Link>
                                        ))}
                                        <Link 
                                            to={`/search?q=${encodeURIComponent(searchQuery)}`}
                                            className="block text-center py-3 text-sm font-bold text-hett-brown hover:bg-gray-50 border-t border-gray-100 transition-colors"
                                            onClick={() => { setIsFocused(false); setSearchQuery(''); setIsSearchOpen(false); }}
                                        >
                                            Bekijk alle resultaten
                                        </Link>
                                    </>
                                ) : (
                                    <div className="px-5 py-8 text-center flex flex-col items-center">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-3">
                                            <SearchIcon size={20} />
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">Geen resultaten gevonden</p>
                                        <p className="text-xs text-gray-500 mt-1">Probeer een andere zoekterm voor "{searchQuery}"</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>

                {/* Right Actions */}
                <div className="flex items-center gap-8 flex-shrink-0">
                    {/* Search Icon (Visible when scrolled and search form is hidden) */}
                    {isScrolled && !isSearchOpen && (
                        <button 
                            onClick={() => setIsSearchOpen(true)} 
                            className="flex flex-col items-center gap-1 group text-gray-500 hover:text-hett-primary transition-colors"
                        >
                            <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                                <SearchIcon size={22} />
                            </div>
                            <span className="text-[11px] font-bold">Zoeken</span>
                        </button>
                    )}

                    <Link to="/contact" className="hidden lg:flex flex-col items-center gap-1 group text-gray-500 hover:text-hett-primary transition-colors">
                        <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                            <Headset size={22} />
                        </div>
                        <span className="text-[11px] font-bold">Service</span>
                    </Link>
                    <Link to="/my-account" className="flex flex-col items-center gap-1 group text-gray-500 hover:text-hett-primary transition-colors">
                         <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                            <User size={22} />
                         </div>
                        <span className="text-[11px] font-bold">Account</span>
                    </Link>
                    <Link to="/wishlist" className="flex flex-col items-center gap-1 group text-gray-500 hover:text-hett-primary transition-colors">
                         <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                            <Heart size={22} />
                         </div>
                        <span className="text-[11px] font-bold">Favorieten</span>
                    </Link>
                    <Link to="/cart" className="flex flex-col items-center gap-1 group text-gray-500 hover:text-hett-primary transition-colors relative">
                        <div className="relative p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                            <ShoppingCart size={22} />
                            {itemCount > 0 && (
                                <span className="absolute top-0 right-0 w-5 h-5 bg-hett-brown text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm transform scale-110">
                                    {itemCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[11px] font-bold">Winkelwagen</span>
                    </Link>
                </div>

            </div>
        </div>

        {/* --- ROW 3: Navigation Links --- */}
        <div className="border-b border-gray-200 hidden lg:block bg-white h-12">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <ul className="flex items-center gap-1 text-sm font-bold text-gray-600 h-full">
                    {NAV_ITEMS.map((item) => (
                        <li key={item.path} className="h-full flex items-center">
                            <Link 
                                to={item.path} 
                                className="px-4 py-1.5 rounded-full hover:bg-gray-100 hover:text-hett-primary transition-all duration-200"
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                    <li className="ml-auto h-full flex items-center">
                        <Link to="/shop" className="text-white bg-hett-brown px-5 py-1.5 rounded-full font-bold hover:bg-[#d14d18] transition-all text-xs uppercase tracking-wide shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                           Webshop
                        </Link>
                    </li>
                </ul>
            </div>
        </div>

      </div>

      {/* Mobile Menu Sidebar */}
      <AnimatePresence>
        {isOpen && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
                />
                
                <motion.div 
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={menuVariants}
                    className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[101] shadow-2xl flex flex-col font-sans"
                >
                    <div className="bg-hett-primary p-6 flex justify-between items-center text-white">
                        <span className="font-bold text-xl">Menu</span>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="py-4 px-4 space-y-2">
                            {NAV_ITEMS.map((link) => (
                                <Link 
                                    key={link.path}
                                    to={link.path} 
                                    onClick={() => setIsOpen(false)} 
                                    className="block px-4 py-3 text-base font-bold text-gray-700 rounded-xl hover:bg-gray-50 hover:text-hett-primary transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                        
                        <div className="px-6 py-6 border-t border-gray-100 space-y-4">
                            <Link to="/projecten" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-gray-600 font-medium hover:text-hett-primary">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-hett-primary"><Lightbulb size={18} /></div>
                                Inspiratie
                            </Link>
                            <Link to="/contact" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-gray-600 font-medium hover:text-hett-primary">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-hett-primary"><Headset size={18} /></div>
                                Klantenservice
                            </Link>
                            <Link to="/my-account" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-gray-600 font-medium hover:text-hett-primary">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-hett-primary"><User size={18} /></div>
                                Mijn Account
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
