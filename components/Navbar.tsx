import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, Search as SearchIcon, Check, Star, User, Heart, ChevronRight, Loader2 } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LangSwitch from './ui/LangSwitch';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { searchProducts } from '../src/lib/shopify';
import type { Product } from '../types';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Map nav item paths to i18n keys
  const navLabelMap: Record<string, string> = {
    '/categorie/verandas': t('nav.verandas'),
    '/categorie/accessoires': t('nav.accessoires'),
    '/glazen-schuifwanden': t('nav.glazenSchuifwanden'),
    '/maatwerk-configurator': t('nav.maatwerkConfigurator'),
    '/projecten': t('nav.projecten'),
    '/showroom': t('nav.showroom'),
    '/montage-handleiding': t('nav.montage'),
    '/contact': t('nav.contact'),
  };
  const getNavLabel = (item: { label: string; path: string }) => navLabelMap[item.path] || item.label;
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
        setSuggestError(t('nav.searchFailed'));
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
      const y = window.scrollY;
      setIsScrolled(prev => {
        // Hysteresis: scroll down past 40 to activate, scroll up past 10 to deactivate
        if (!prev && y > 40) return true;
        if (prev && y < 10) return false;
        return prev;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close search when unscrolled
  useEffect(() => {
    if (!isScrolled) setIsSearchOpen(false);
  }, [isScrolled]);

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
              <Link to="/" className="flex-shrink-0"><img src="/assets/images/hett-logo-navbar.webp" alt="HETT" className="h-6" /></Link>
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
          <div className={`px-4 overflow-hidden ${showSearchForm ? 'max-h-96 pb-3' : 'max-h-0 pb-0 hidden'}`}>
            <div className="flex items-center gap-2">
              <form ref={mobileSearchWrapperRef} onSubmit={handleSearch} className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder={t('nav.search')} 
                  className="w-full bg-gray-100 py-2.5 pl-10 pr-4 rounded-md outline-none text-sm" 
                />
                {/* Mobile Autosuggest Dropdown */}
                {suggestOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-sm border border-gray-200 z-50 max-h-80 overflow-y-auto">
                  {suggestLoading && (
                    <div className="flex items-center justify-center gap-2 py-4 text-gray-500 text-sm">
                      <Loader2 size={16} className="animate-spin" />
                      <span>{t('nav.searching')}</span>
                    </div>
                  )}
                  {!suggestLoading && suggestError && (
                    <div className="py-4 px-4 text-center text-red-500 text-sm">{suggestError}</div>
                  )}
                  {!suggestLoading && !suggestError && suggestResults.length === 0 && (
                    <div className="py-4 px-4 text-center text-gray-500 text-sm">{t('nav.noResults')}</div>
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

              {/* WhatsApp button */}
              <a
                href="https://wa.me/31685406033"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-10 h-10 bg-[#25D366] rounded-md flex items-center justify-center"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* DESKTOP TOP BAR */}
        <div className={`hidden md:block bg-hett-primary text-white text-[11px] font-bold transition-all duration-300 overflow-hidden ${isScrolled ? 'max-h-0 py-0' : 'max-h-10 py-1.5'}`}>
          <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
            <div className="flex gap-6 uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Check size={12} className="text-hett-brown" strokeWidth={4} /> {t('nav.since')}</span>
              <span className="flex items-center gap-1.5"><Check size={12} className="text-hett-brown" strokeWidth={4} /> {t('nav.personalAdvice')}</span>
              <span className="flex items-center gap-1.5"><Check size={12} className="text-hett-brown" strokeWidth={4} /> {t('nav.fastDelivery')}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400"><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /></div>
                <span>{t('nav.basedOnReviews', { count: 43 })}</span>
              </div>
              <LangSwitch />
            </div>
          </div>
        </div>

        {/* DESKTOP MAIN BAR */}
        <div className={`hidden md:flex border-b border-gray-100 transition-[padding] duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
          <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between gap-10 w-full">
            <Link to="/" className="flex-shrink-0"><img src="/assets/images/hett-logo-navbar.webp" alt="HETT" className="h-9" /></Link>

            <form ref={searchWrapperRef} onSubmit={handleSearch} className={`relative flex flex-grow max-w-xl transition-all ${showSearchForm ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder={t('nav.searchPlaceholder')} 
                className="w-full pl-5 pr-12 py-2.5 border border-gray-200 bg-gray-50 rounded-md text-sm outline-none focus:border-hett-primary focus:bg-white" 
              />
              <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-hett-primary text-white rounded-md"><SearchIcon size={16} /></button>
              
              {/* Desktop Autosuggest Dropdown */}
              {suggestOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-sm border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  {suggestLoading && (
                    <div className="flex items-center justify-center gap-2 py-4 text-gray-500 text-sm">
                      <Loader2 size={16} className="animate-spin" />
                      <span>{t('nav.searching')}</span>
                    </div>
                  )}
                  {!suggestLoading && suggestError && (
                    <div className="py-4 px-4 text-center text-red-500 text-sm">{suggestError}</div>
                  )}
                  {!suggestLoading && !suggestError && suggestResults.length === 0 && (
                    <div className="py-4 px-4 text-center text-gray-500 text-sm">{t('nav.noResults')}</div>
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
                <span className="text-[10px] font-bold text-gray-500 mt-1 uppercase">{t('nav.account')}</span>
              </Link>
              <Link to="/wishlist" className="flex flex-col items-center group relative">
                <Heart size={22} className="text-gray-500 group-hover:text-hett-primary transition-colors" />
                <span className="text-[10px] font-bold text-gray-500 mt-1 uppercase">{t('nav.favorieten')}</span>
                {wishlistCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-hett-brown text-white text-[9px] font-bold flex items-center justify-center rounded-full">{wishlistCount}</span>}
              </Link>
              <button onClick={openCart} className="flex flex-col items-center group relative">
                <ShoppingCart size={22} className="text-gray-500 group-hover:text-hett-primary transition-colors" />
                <span className="text-[10px] font-bold text-gray-500 mt-1 uppercase">{t('nav.mandje')}</span>
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
                  <Link to={item.path} className="px-4 hover:text-hett-primary transition-colors">{getNavLabel(item)}</Link>
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
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[101] shadow-sm flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <img src="/assets/images/hett-logo-navbar.webp" alt="HETT" className="h-6" />
                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                <nav className="flex flex-col">
                  {NAV_ITEMS.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)} className="flex items-center justify-between px-6 py-4 border-b border-gray-50 text-hett-dark font-bold text-lg">
                      <span>{getNavLabel(item)}</span>
                      <ChevronRight size={20} className="text-gray-300" />
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-400 font-medium">{t('nav.needHelp')}</p>
                  <div className="[&_*]:!text-hett-dark [&_span]:!text-gray-300">
                    <LangSwitch />
                  </div>
                </div>
                <a href="tel:+31685406033" className="flex items-center gap-3 text-hett-dark font-bold text-lg">
                  <Star size={20} className="text-hett-secondary" fill="currentColor" />
                  +31 (0)6 85 40 60 33
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