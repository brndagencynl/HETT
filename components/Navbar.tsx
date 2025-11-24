import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronRight, Star, Check } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // Animation Variants
  const menuVariants = {
    closed: { 
        x: "100%",
        transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    open: { 
        x: 0,
        transition: { type: "spring", stiffness: 300, damping: 30, staggerChildren: 0.07, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, x: 20 },
    open: { opacity: 1, x: 0 }
  };

  return (
    <>
    <div className="fixed top-0 w-full z-50 font-sans bg-white shadow-sm transition-all duration-300">
      
      {/* Row 1: Main Header (Logo, Icons, Desktop Nav) */}
      <div className="border-b border-gray-100 relative z-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`flex justify-between items-center transition-all duration-300 ${isScrolled ? 'py-3' : 'py-4'}`}>
                
                {/* Logo */}
                <Link to="/" className="block z-50">
                    <img 
                        src="/logo.png" 
                        alt="HETT - Panelen & Profielen" 
                        className={`w-auto object-contain transition-all duration-300 ${isScrolled ? 'h-10' : 'h-12'}`}
                    />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                    {NAV_ITEMS.map((item) => (
                        <Link key={item.path} to={item.path} className="text-sm font-bold text-hett-dark hover:text-hett-brown transition-colors">
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Desktop Right Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <Link 
                        to="/configurator" 
                        className="ml-2 bg-hett-dark text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-hett-brown transition-colors shadow-sm"
                    >
                        Stel samen
                    </Link>
                </div>

                {/* Mobile Right Actions - Menu */}
                <div className="flex items-center gap-3 md:hidden">
                    <button 
                        onClick={() => setIsOpen(true)} 
                        className="p-2 text-hett-dark hover:text-hett-brown transition-colors"
                    >
                        <Menu size={28} strokeWidth={1.5} />
                    </button>
                </div>

            </div>
        </div>
      </div>

      {/* Row 2: Mobile Sticky CTA Bar (Mobile Only) */}
      <div className="md:hidden border-b border-gray-100 bg-white px-4 py-3 flex items-center justify-between gap-4">
           <div className="flex flex-col">
                <span className="font-bold text-hett-dark text-sm leading-tight">Sandwichpanelen</span>
                <span className="text-xs text-gray-500">vanaf €25/m²</span>
           </div>
           <Link 
                to="/configurator" 
                className="bg-hett-dark text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-hett-brown transition-colors shadow-sm whitespace-nowrap flex-shrink-0"
           >
                Stel samen
           </Link>
      </div>

      {/* Row 3: Reviews & USPs Bar (Mobile Scrolling, Desktop Flex) */}
      <div className="bg-[#f9fafb] border-b border-gray-100 py-2.5 overflow-hidden">
           <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex items-center gap-6 text-xs font-medium text-hett-dark overflow-x-auto no-scrollbar whitespace-nowrap mask-fade-sides">
                    <div className="flex items-center gap-1.5 font-bold pr-2 sm:border-r border-gray-200">
                        <div className="flex gap-0.5">
                            <Star size={12} fill="#FACC15" className="text-yellow-400" strokeWidth={0} />
                            <Star size={12} fill="#FACC15" className="text-yellow-400" strokeWidth={0} />
                            <Star size={12} fill="#FACC15" className="text-yellow-400" strokeWidth={0} />
                            <Star size={12} fill="#FACC15" className="text-yellow-400" strokeWidth={0} />
                            <Star size={12} fill="#FACC15" className="text-yellow-400" strokeWidth={0} />
                        </div>
                        <span>4.8 Uitstekend op Google</span>
                    </div>
                    
                    <span className="flex items-center gap-1.5 text-gray-600">
                        <Check size={14} className="text-green-500" /> 10 jaar garantie
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-600">
                        <Check size={14} className="text-green-500" /> Snelle levering
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-600 hidden sm:flex">
                        <Check size={14} className="text-green-500" /> Op maat gezaagd
                    </span>
               </div>
           </div>
      </div>

    </div>

    {/* Full Screen Mobile Menu Overlay */}
    <AnimatePresence>
        {isOpen && (
            <motion.div 
                initial="closed"
                animate="open"
                exit="closed"
                variants={menuVariants}
                className="fixed inset-0 z-[100] bg-white text-hett-dark flex flex-col font-sans"
            >
                {/* Mobile Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <img src="/logo.png" alt="HETT" className="h-10 w-auto object-contain" />
                    <motion.button 
                        whileTap={{ scale: 0.8, rotate: 90 }}
                        onClick={() => setIsOpen(false)} 
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-hett-dark"
                    >
                        <X size={32} strokeWidth={1.5} />
                    </motion.button>
                </div>

                {/* Mobile Menu Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8 no-scrollbar">
                    <motion.div variants={itemVariants}>
                        <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center justify-between group cursor-pointer">
                            <span className="text-3xl font-bold text-gray-400 group-hover:text-hett-dark transition-colors">Home</span>
                            <ChevronRight size={24} className="text-gray-300 group-hover:text-hett-dark" />
                        </Link>
                    </motion.div>

                    {NAV_ITEMS.map((link) => (
                         <motion.div variants={itemVariants} key={link.path}>
                            <Link to={link.path} onClick={() => setIsOpen(false)} className="flex items-center justify-between group">
                                <span className="text-3xl font-bold text-gray-400 group-hover:text-hett-dark transition-colors">{link.label}</span>
                                <ChevronRight size={24} className="text-gray-300 group-hover:text-hett-dark" />
                            </Link>
                        </motion.div>
                    ))}
                    
                    <motion.div variants={itemVariants}>
                        <Link to="/configurator" onClick={() => setIsOpen(false)} className="block text-2xl text-hett-brown font-black mt-4">
                            Configurator Tool
                        </Link>
                    </motion.div>
                </div>

                {/* Mobile Footer */}
                <motion.div variants={itemVariants} className="p-6 border-t border-gray-100 bg-gray-50">
                     <div className="flex items-center gap-2 text-yellow-400 mb-4 font-bold text-sm">
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <span className="text-hett-dark ml-2">4.8 op Google</span>
                     </div>
                     <Link to="/contact" onClick={() => setIsOpen(false)} className="block w-full bg-hett-dark text-white text-center font-bold py-4 rounded-lg shadow-sm">
                        Contact opnemen
                     </Link>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
    </>
  );
};

export default Navbar;