import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, Search as SearchIcon, Check, Star, User, Heart, ChevronRight, Loader2 } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { searchProducts } from '../src/lib/shopify';
import type { Product } from '../types';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Autosuggest state
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestResults, setSuggestResults] = useState<Product[]>([]);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const searchWrapperRef = useRef<HTMLFormElement>(null);
  const mobileSearchWrapperRef = useRef<HTMLFormElement>(null);
  const requestIdRef = useRef(0);

  const { itemCount, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSuggestOpen(false);
      setSuggestResults([]);
      setSuggestError(null);
      return;
    }

    setSuggestLoading(true);
    setSuggestOpen(true);
    const currentRequestId = ++requestIdRef.current;

    const timeoutId = setTimeout(async () => {
      console.log('[Search] query', trimmed);
      try {
        const result = await searchProducts(trimmed, { first: 6 });
        // Ignore stale responses
        if (currentRequestId !== requestIdRef.current) return;
        console.log('[Search] results', result.products.length);
        setSuggestResults(result.products);
        setSuggestError(null);
      } catch (err) {
        if (currentRequestId !== requestIdRef.current) return;
        console.error('[Search] error', err);
        setSuggestError('Zoeken mislukt');
        setSuggestResults([]);
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setSuggestLoading(false);
        }
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target as Node) &&
        mobileSearchWrapperRef.current &&
        !mobileSearchWrapperRef.current.contains(e.target as Node)
      ) {
        setSuggestOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSuggestOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const handleResultClick = useCallback((handle: string) => {
    navigate(`/producten/${handle}`);
    setSuggestOpen(false);
    setSearchQuery('');
    setIsOpen(false);
  }, [navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // If we already have results, navigate to full search page
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
      setSearchQuery('');
      setIsSearchOpen(false);
      setSuggestOpen(false);
    }
  };

  const showSearchForm = !isScrolled || isSearchOpen;

  return (
    <>
      <div className="sticky top-0 w-full z-50 font-sans bg-white shadow-sm">
        {/* MOBILE HEADER */}
        <div className="md:hidden border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsOpen(true)} className="text-hett-dark p-1 -ml-1">
                <Menu size={28} />
              </button>
              <Link to="/" className="flex-shrink-0"><img src="/assets/images/hett-logo-navbar.png" alt="HETT" className="h-6" /></Link>
            </div>
            <div className="flex items-center gap-3 text-hett-dark">
              <Link to="/my-account" className="p-1 relative">
                <User size={26} strokeWidth={1.5} />
              </Link>
              <Link to="/wishlist" className="p-1 relative">
                <Heart size={26} strokeWidth={1.5} />
                {wishlistCount > 0 && <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-hett-brown text-white text-[8px] font-bold flex items-center justify-center rounded-full border border-white">{wishlistCount}</span>}
              </Link>
              <button onClick={openCart} className="p-1 relative text-hett-dark">
                <ShoppingCart size={26} strokeWidth={1.5} />
                {itemCount > 0 && <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-hett-brown text-white text-[8px] font-bold flex items-center justify-center rounded-full border border-white">{itemCount}</span>}
              </button>
            </div>
          </div>
          <div className={`px-4 overflow-hidden ${showSearchForm ? 'max-h-96 pb-4' : 'max-h-0 pb-0 hidden'}`}>
            <form ref={mobileSearchWrapperRef} onSubmit={handleSearch} className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Zoeken" 
                className="w-full bg-gray-100 py-2.5 pl-10 pr-4 rounded-md outline-none text-sm" 
              />
              {/* Mobile Autosuggest Dropdown */}
              {suggestOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
                  {suggestLoading && (
                    <div className="flex items-center justify-center gap-2 py-4 text-gray-500 text-sm">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Zoeken...</span>
                    </div>
                  )}
                  {!suggestLoading && suggestError && (
                    <div className="py-4 px-4 text-center text-red-500 text-sm">{suggestError}</div>
                  )}
                  {!suggestLoading && !suggestError && suggestResults.length === 0 && (
                    <div className="py-4 px-4 text-center text-gray-500 text-sm">Geen resultaten</div>
                  )}
                  {!suggestLoading && !suggestError && suggestResults.length > 0 && (
                    <ul>
                      {suggestResults.map((product) => (
                        <li key={product.id}>
                          <button
                            type="button"
                            onClick={() => handleResultClick(product.handle || product.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                          >
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              className="w-12 h-12 object-cover rounded-md bg-gray-100 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-hett-dark truncate">{product.title}</p>
                              <p className="text-sm text-hett-primary font-semibold">{formatPrice(product.price)}</p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* DESKTOP TOP BAR */}
        <div className={`hidden md:block bg-hett-primary text-white text-[11px] font-bold ${isScrolled ? 'h-0 py-0 overflow-hidden' : 'h-auto py-1.5'}`}>
          <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
            <div className="flex gap-6 uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Check size={12} className="text-hett-brown" strokeWidth={4} /> Sinds 2016</span>
              <span className="flex items-center gap-1.5"><Check size={12} className="text-hett-brown" strokeWidth={4} /> Persoonlijk advies</span>
              <span className="flex items-center gap-1.5"><Check size={12} className="text-hett-brown" strokeWidth={4} /> Snelle levering</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400"><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /></div>
              <span>Gebasseerd op 43 reviews</span>
            </div>
          </div>
        </div>

        {/* DESKTOP MAIN BAR */}
        <div className={`hidden md:flex border-b border-gray-100 ${isScrolled ? 'py-2' : 'py-4'}`}>
          <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between gap-10 w-full">
            <Link to="/" className="flex-shrink-0"><img src="/assets/images/hett-logo-navbar.png" alt="HETT" className="h-9" /></Link>

            <form ref={searchWrapperRef} onSubmit={handleSearch} className={`relative flex flex-grow max-w-xl transition-all ${showSearchForm ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Waar ben je naar op zoek?" 
                className="w-full pl-5 pr-12 py-2.5 border border-gray-200 bg-gray-50 rounded-md text-sm outline-none focus:border-hett-primary focus:bg-white" 
              />
              <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-hett-primary text-white rounded-md"><SearchIcon size={16} /></button>
              
              {/* Desktop Autosuggest Dropdown */}
              {suggestOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  {suggestLoading && (
                    <div className="flex items-center justify-center gap-2 py-4 text-gray-500 text-sm">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Zoeken...</span>
                    </div>
                  )}
                  {!suggestLoading && suggestError && (
                    <div className="py-4 px-4 text-center text-red-500 text-sm">{suggestError}</div>
                  )}
                  {!suggestLoading && !suggestError && suggestResults.length === 0 && (
                    <div className="py-4 px-4 text-center text-gray-500 text-sm">Geen resultaten</div>
                  )}
                  {!suggestLoading && !suggestError && suggestResults.length > 0 && (
                    <ul>
                      {suggestResults.map((product) => (
                        <li key={product.id}>
                          <button
                            type="button"
                            onClick={() => handleResultClick(product.handle || product.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                          >
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              className="w-12 h-12 object-cover rounded-md bg-gray-100 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-hett-dark truncate">{product.title}</p>
                              <p className="text-sm text-hett-primary font-semibold">{formatPrice(product.price)}</p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </form>

            <div className="flex items-center gap-6">
              <Link to="/my-account" className="flex flex-col items-center group">
                <User size={22} className="text-gray-500 group-hover:text-hett-primary transition-colors" />
                <span className="text-[10px] font-bold text-gray-500 mt-1 uppercase">Account</span>
              </Link>
              <Link to="/wishlist" className="flex flex-col items-center group relative">
                <Heart size={22} className="text-gray-500 group-hover:text-hett-primary transition-colors" />
                <span className="text-[10px] font-bold text-gray-500 mt-1 uppercase">Favorieten</span>
                {wishlistCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-hett-brown text-white text-[9px] font-bold flex items-center justify-center rounded-full">{wishlistCount}</span>}
              </Link>
              <button onClick={openCart} className="flex flex-col items-center group relative">
                <ShoppingCart size={22} className="text-gray-500 group-hover:text-hett-primary transition-colors" />
                <span className="text-[10px] font-bold text-gray-500 mt-1 uppercase">Mandje</span>
                {itemCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-hett-brown text-white text-[9px] font-bold flex items-center justify-center rounded-full">{itemCount}</span>}
              </button>
            </div>
          </div>
        </div>

        {/* DESKTOP NAV BAR */}
        <div className="border-b border-gray-200 hidden lg:block bg-white h-10">
          <div className="max-w-[1400px] mx-auto px-6 h-full">
            <ul className="flex items-center gap-1 text-[13px] font-bold text-gray-600 h-full">
              {NAV_ITEMS.map((item) => (
                <li key={item.path} className="h-full flex items-center">
                  <Link to={item.path} className="px-4 hover:text-hett-primary transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-[100]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[101] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <img src="/assets/images/hett-logo-navbar.png" alt="HETT" className="h-6" />
                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                <nav className="flex flex-col">
                  {NAV_ITEMS.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)} className="flex items-center justify-between px-6 py-4 border-b border-gray-50 text-hett-dark font-bold text-lg">
                      <span>{item.label}</span>
                      <ChevronRight size={20} className="text-gray-300" />
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-400 font-medium mb-4">Hulp nodig? Bel ons direct:</p>
                <a href="tel:0401234567" className="flex items-center gap-3 text-hett-dark font-bold text-lg">
                  <Star size={20} className="text-hett-secondary" fill="currentColor" />
                  040 123 4567
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;