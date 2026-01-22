/**
 * HomeHeroShowcase Component (Optimized)
 * ======================================
 * 
 * Performance optimized hero with:
 * - AVIF + WebP fallback using <picture> elements
 * - Responsive srcset for different viewport sizes
 * - Blur placeholder for hero image
 * - Lazy loading for thumbnails
 * - Thumbnails rendered after initial hero mount
 * - Improved thumbnail visibility (larger, better contrast)
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface HeroImageSet {
  avif1920: string;
  webp1920: string;
  avif1024: string;
  webp1024: string;
  webp640: string;
}

interface HeroItem {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  images: HeroImageSet;
  thumbnail: string;
  enabled: boolean;
}

// =============================================================================
// HERO ITEMS CONFIGURATION
// =============================================================================

const heroItems: HeroItem[] = [
  {
    id: 'veranda',
    label: 'Veranda',
    title: 'Al een Veranda vanaf €699',
    subtitle: 'De beste en voordeligste in de markt voor de doe-het-zelver!',
    ctaText: 'Stel zelf samen',
    ctaHref: '/categorie/verandas',
    images: {
      avif1920: '/assets/images/homepagina_hero_1_1920.avif',
      webp1920: '/assets/images/homepagina_hero_1_1920.webp',
      avif1024: '/assets/images/homepagina_hero_1_1024.avif',
      webp1024: '/assets/images/homepagina_hero_1_1024.webp',
      webp640: '/assets/images/homepagina_hero_1_640.webp',
    },
    thumbnail: '/assets/images/homepagina_thumb_1.webp',
    enabled: true,
  },
  {
    id: 'maatwerk-veranda',
    label: 'Maatwerk',
    title: 'Maatwerk Veranda',
    subtitle: 'Speciale maten? Geen probleem met onze maatwerk configurator.',
    ctaText: 'Configureer nu',
    ctaHref: '/maatwerk-configurator',
    images: {
      avif1920: '/assets/images/homepagina_hero_2_1920.avif',
      webp1920: '/assets/images/homepagina_hero_2_1920.webp',
      avif1024: '/assets/images/homepagina_hero_2_1024.avif',
      webp1024: '/assets/images/homepagina_hero_2_1024.webp',
      webp640: '/assets/images/homepagina_hero_2_640.webp',
    },
    thumbnail: '/assets/images/homepagina_thumb_2.webp',
    enabled: true,
  },
];

// Blur placeholder - simple gray SVG (tiny base64)
const BLUR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMyYTJhMmEiLz48L3N2Zz4=';

// =============================================================================
// HERO IMAGE COMPONENT (Optimized)
// =============================================================================

interface HeroImageProps {
  images: HeroImageSet;
  alt: string;
  priority?: boolean;
}

const HeroImage: React.FC<HeroImageProps> = ({ images, alt, priority = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="absolute inset-0">
      {/* Blur placeholder background */}
      <div 
        className={`absolute inset-0 bg-gray-800 transition-opacity duration-500 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: `url(${BLUR_PLACEHOLDER})`,
          backgroundSize: 'cover',
          filter: 'blur(20px)',
          transform: 'scale(1.1)',
        }}
      />
      
      {/* Main image with <picture> for format fallback */}
      <picture>
        {/* AVIF for modern browsers - desktop */}
        <source
          type="image/avif"
          media="(min-width: 1024px)"
          srcSet={images.avif1920}
        />
        {/* WebP for desktop */}
        <source
          type="image/webp"
          media="(min-width: 1024px)"
          srcSet={images.webp1920}
        />
        {/* AVIF for tablet */}
        <source
          type="image/avif"
          media="(min-width: 640px)"
          srcSet={images.avif1024}
        />
        {/* WebP for tablet */}
        <source
          type="image/webp"
          media="(min-width: 640px)"
          srcSet={images.webp1024}
        />
        {/* WebP for mobile */}
        <source
          type="image/webp"
          srcSet={images.webp640}
        />
        {/* Fallback img */}
        <img
          src={images.webp1920}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          // @ts-expect-error fetchPriority not yet in React types
          fetchpriority={priority ? 'high' : 'auto'}
        />
      </picture>
    </div>
  );
};

// =============================================================================
// THUMBNAIL COMPONENT (Lazy loaded)
// =============================================================================

interface ThumbnailProps {
  item: HeroItem;
  isActive: boolean;
  onClick: () => void;
}

const Thumbnail: React.FC<ThumbnailProps> = ({ item, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2.5 flex-shrink-0 group"
    >
      {/* Thumbnail image container - larger for better visibility */}
      <div className={`
        w-[72px] h-[72px] md:w-[88px] md:h-[88px] 
        rounded-xl overflow-hidden transition-all duration-200
        border-2 shadow-sm
        ${isActive
          ? 'ring-[3px] ring-teal-500 ring-offset-2 border-teal-500 scale-105'
          : 'border-gray-300 hover:border-gray-400 hover:ring-2 hover:ring-gray-300 hover:ring-offset-1 hover:scale-102'
        }
      `}>
        <img
          src={item.thumbnail}
          srcSet={`${item.thumbnail} 1x, ${item.thumbnail} 2x`}
          alt={item.label}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      {/* Label */}
      <span className={`
        text-sm md:text-base font-bold whitespace-nowrap transition-colors
        ${isActive 
          ? 'text-teal-600' 
          : 'text-gray-700 group-hover:text-gray-900'
        }
      `}>
        {item.label}
      </span>
    </button>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const HomeHeroShowcase: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbnailsReady, setThumbnailsReady] = useState(false);

  // Delay thumbnail rendering until after initial hero mount (optimize LCP)
  useEffect(() => {
    // Use requestIdleCallback for non-critical rendering, fallback to setTimeout
    const callback = () => setThumbnailsReady(true);
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(callback, { timeout: 100 });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(callback, 50);
      return () => clearTimeout(id);
    }
  }, []);

  const visibleItems = heroItems.filter(item => item.enabled);
  const currentItem = visibleItems[activeIndex] || heroItems[0];
  const priceMatch = currentItem.title.match(/€\s?\d+/);
  const priceText = priceMatch?.[0];
  const priceIndex = priceText ? currentItem.title.indexOf(priceText) : -1;
  const titleStart = priceIndex >= 0 ? currentItem.title.slice(0, priceIndex).trimEnd() : currentItem.title;
  const titleEnd = priceIndex >= 0 ? currentItem.title.slice(priceIndex + priceText.length).trimStart() : '';

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? visibleItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === visibleItems.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="relative rounded-[28px] overflow-hidden min-h-[500px] md:min-h-[550px] lg:min-h-[600px]">
        {/* Hero Background Image (Priority loaded) */}
        <HeroImage
          images={currentItem.images}
          alt={currentItem.title}
          priority={activeIndex === 0}
        />
        
        {/* Dark Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/25 to-black/10" />
        
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
              {priceText ? (
                <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-2">
                  <span>{titleStart}</span>
                  <span className="price-badge inline-block bg-[#FF7A00] text-white font-extrabold rounded-[10px] shadow-[0_6px_16px_rgba(0,0,0,0.15)] px-2.5 py-1 text-[0.9em] sm:px-3.5 sm:py-2 sm:text-[0.95em]">
                    {priceText}
                  </span>
                  {titleEnd ? <span>{titleEnd}</span> : null}
                </span>
              ) : (
                currentItem.title
              )}
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
            <div className="flex items-center justify-center gap-3 md:gap-4">
              {/* Prev Button */}
              <button
                onClick={handlePrev}
                className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/95 backdrop-blur-md hover:bg-white flex items-center justify-center transition-all flex-shrink-0 shadow-lg hover:shadow-xl border border-gray-200"
                aria-label="Vorige"
              >
                <ChevronLeft size={22} className="text-gray-700" />
              </button>
              
              {/* Thumbnail Container - Semi-opaque with backdrop blur */}
              <div className="bg-white/90 backdrop-blur-md rounded-[24px] px-5 md:px-8 py-4 md:py-5 flex items-center shadow-xl border border-white/50">
                {thumbnailsReady ? (
                  <div className="flex items-center gap-5 md:gap-8 overflow-x-auto no-scrollbar">
                    {heroItems.map((item, index) => (
                      <Thumbnail
                        key={item.id}
                        item={item}
                        isActive={index === activeIndex}
                        onClick={() => handleThumbnailClick(index)}
                      />
                    ))}
                  </div>
                ) : (
                  // Placeholder while thumbnails load
                  <div className="flex items-center gap-5 md:gap-8">
                    {heroItems.map((item) => (
                      <div key={item.id} className="flex flex-col items-center gap-2.5">
                        <div className="w-[72px] h-[72px] md:w-[88px] md:h-[88px] rounded-xl bg-gray-200 animate-pulse" />
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Next Button */}
              <button
                onClick={handleNext}
                className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/95 backdrop-blur-md hover:bg-white flex items-center justify-center transition-all flex-shrink-0 shadow-lg hover:shadow-xl border border-gray-200"
                aria-label="Volgende"
              >
                <ChevronRight size={22} className="text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeHeroShowcase;
