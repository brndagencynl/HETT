/**
 * HomeHeroShowcase Component
 * ==========================
 * 
 * Full-width hero with background image, overlay, content, and
 * a thumbnail carousel strip at the bottom for category navigation.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

// Hero items configuration - easily editable
interface HeroItem {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  backgroundImage: string;
  thumbnail: string;
  enabled: boolean;
}

const heroItems: HeroItem[] = [
  {
    id: 'veranda',
    label: 'Veranda',
    title: 'Al een Veranda vanaf €699',
    subtitle: 'De beste en voordeligste in de markt voor de doe-het-zelver!',
    ctaText: 'Stel zelf samen',
    ctaHref: '/verandas',
    backgroundImage: '/assets/images/homepagina_1.webp',
    thumbnail: '/assets/images/homepagina_1.webp',
    enabled: true,
  },
  {
    id: 'maatwerk-veranda',
    label: 'Maatwerk',
    title: 'Maatwerk Veranda',
    subtitle: 'Speciale maten? Geen probleem met onze maatwerk configurator.',
    ctaText: 'Configureer nu',
    ctaHref: '/maatwerk-configurator',
    backgroundImage: '/assets/images/homepagina_2.webp',
    thumbnail: '/assets/images/homepagina_2.webp',
    enabled: true,
  },
];

const HomeHeroShowcase: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = heroItems[activeIndex];

  // Only show enabled items in the carousel, or show all but disabled ones are not clickable
  const visibleItems = heroItems.filter(item => item.enabled);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? visibleItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === visibleItems.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
  };

  // For now, only show veranda since others are disabled
  const currentItem = visibleItems[activeIndex] || heroItems[0];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="relative rounded-[28px] overflow-hidden min-h-[500px] md:min-h-[550px] lg:min-h-[600px]">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url(${currentItem.backgroundImage})` }}
        />
        
        {/* Dark Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-black/10" />
        
        {/* Content */}
        <div className="relative z-10 h-full min-h-[500px] md:min-h-[550px] lg:min-h-[600px] flex flex-col justify-between p-6 md:p-10 lg:p-14">
          {/* Top Content */}
          <div className="flex-1 flex flex-col justify-center max-w-2xl">
            {/* Eyebrow */}
            <span className="text-hett-secondary font-bold text-sm md:text-base tracking-wide uppercase mb-3">
              HETT VERANDA'S
            </span>
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-4 leading-tight">
              {currentItem.title}
            </h1>
            
            {/* Subtitle */}
            <p className="text-white/90 text-base md:text-lg lg:text-xl font-medium mb-8 max-w-lg">
              {currentItem.subtitle}
            </p>
            
            {/* CTA Button */}
            <Link
              to={currentItem.ctaHref}
              className="btn-secondary px-8 py-4 text-base md:text-lg w-fit inline-flex items-center gap-3 hover:gap-4 transition-all rounded-xl font-bold"
            >
              {currentItem.ctaText}
              <ArrowRight size={20} />
            </Link>
          </div>
          
          {/* Bottom Thumbnail Strip */}
          <div className="mt-8">
            <div className="flex items-center justify-center gap-4">
              {/* Prev Button - Outside the white container */}
              <button
                onClick={handlePrev}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white flex items-center justify-center transition-colors flex-shrink-0 shadow-lg"
                aria-label="Vorige"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              
              {/* White pill container with thumbnails */}
              <div className="bg-white/95 backdrop-blur-sm rounded-[28px] px-6 py-4 flex items-center shadow-lg">
                <div className="flex items-center gap-4 md:gap-6 overflow-x-auto no-scrollbar">
                  {heroItems.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => handleThumbnailClick(index)}
                      className="flex flex-col items-center gap-2 flex-shrink-0 group"
                    >
                      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden transition-all ${
                        index === activeIndex
                          ? 'ring-[3px] ring-teal-500 ring-offset-2'
                          : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
                      }`}>
                        <img
                          src={item.thumbnail}
                          alt={item.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className={`text-xs md:text-sm font-semibold whitespace-nowrap transition-colors ${
                        index === activeIndex ? 'text-teal-600' : 'text-gray-600 group-hover:text-gray-800'
                      }`}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Next Button - Outside the white container */}
              <button
                onClick={handleNext}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white flex items-center justify-center transition-colors flex-shrink-0 shadow-lg"
                aria-label="Volgende"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeHeroShowcase;
