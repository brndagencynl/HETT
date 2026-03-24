/**
 * HomeHeroShowcase Component (Tabbed)
 * ====================================
 *
 * Redesigned hero with tab-based navigation instead of a carousel.
 * Both options (Veranda & Maatwerk) are always visible via pill-tabs,
 * solving the problem of slide 2 being overlooked.
 *
 * Retained from original:
 * - AVIF + WebP fallback using <picture> elements
 * - Responsive srcset for different viewport sizes
 * - Blur placeholder for hero image
 * - i18n integration
 */

import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  enabled: boolean;
}

// =============================================================================
// HERO ITEMS CONFIGURATION
// =============================================================================

const heroItems: HeroItem[] = [
  {
    id: 'veranda',
    label: 'Bouwpakket veranda',
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
    enabled: true,
  },
  {
    id: 'maatwerk-veranda',
    label: 'Maatwerk veranda',
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
    enabled: true,
  },
];

// Blur placeholder - simple gray SVG (tiny base64)
const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMyYTJhMmEiLz48L3N2Zz4=';

// =============================================================================
// HERO IMAGE COMPONENT (Optimized)
// =============================================================================

interface HeroImageProps {
  images: HeroImageSet;
  alt: string;
  isActive: boolean;
  priority?: boolean;
}

const HeroImage: React.FC<HeroImageProps> = ({ images, alt, isActive, priority = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
        isActive ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
      }`}
    >
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
        <source type="image/avif" media="(min-width: 1024px)" srcSet={images.avif1920} />
        <source type="image/webp" media="(min-width: 1024px)" srcSet={images.webp1920} />
        <source type="image/avif" media="(min-width: 640px)" srcSet={images.avif1024} />
        <source type="image/webp" media="(min-width: 640px)" srcSet={images.webp1024} />
        <source type="image/webp" srcSet={images.webp640} />
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
// PILL TABS COMPONENT
// =============================================================================

interface PillTabsProps {
  items: HeroItem[];
  activeIndex: number;
  onChange: (index: number) => void;
}

const PillTabs: React.FC<PillTabsProps> = ({ items, activeIndex, onChange }) => {
  return (
    <div
      className="inline-flex p-1 rounded-full border border-white/15 bg-white/10 backdrop-blur-xl"
      role="tablist"
      aria-label="Hero tabs"
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`hero-panel-${item.id}`}
            onClick={() => onChange(index)}
            className={`
              relative px-5 py-2.5 md:px-7 md:py-3 rounded-full text-sm md:text-[15px] font-bold
              transition-all duration-300 ease-out cursor-pointer whitespace-nowrap
              ${
                isActive
                  ? 'bg-[#FF7A00] text-white shadow-[0_2px_12px_rgba(255,122,0,0.35)]'
                  : 'text-white/60 hover:text-white/90'
              }
            `}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

// =============================================================================
// SLIDE CONTENT COMPONENT
// =============================================================================

interface SlideContentProps {
  item: HeroItem;
  isActive: boolean;
}

const SlideContent: React.FC<SlideContentProps> = ({ item, isActive }) => {
  const priceMatch = item.title.match(/€\s?\d+/);
  const priceText = priceMatch?.[0];
  const priceIndex = priceText ? item.title.indexOf(priceText) : -1;
  const titleStart = priceIndex >= 0 ? item.title.slice(0, priceIndex).trimEnd() : item.title;
  const titleEnd = priceIndex >= 0 ? item.title.slice(priceIndex + (priceText?.length ?? 0)).trimStart() : '';

  return (
    <div
      id={`hero-panel-${item.id}`}
      role="tabpanel"
      aria-hidden={!isActive}
      className={`
        transition-all duration-500 ease-out
        ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none absolute inset-0'}
      `}
    >
      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-4 leading-tight">
        {priceText ? (
          <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-2">
            <span>{titleStart}</span>
            <span className="inline-block bg-[#FF7A00] text-white font-extrabold rounded-[10px] shadow-[0_6px_16px_rgba(0,0,0,0.15)] px-2.5 py-1 text-[0.9em] sm:px-3.5 sm:py-2 sm:text-[0.95em]">
              {priceText}
            </span>
            {titleEnd ? <span>{titleEnd}</span> : null}
          </span>
        ) : (
          item.title
        )}
      </h1>

      {/* Subtitle */}
      <p className="text-white/90 text-base md:text-lg lg:text-xl font-medium mb-8 max-w-lg">
        {item.subtitle}
      </p>

      {/* CTA Button */}
      <Link to={item.ctaHref} className="ds-btn ds-btn--secondary ds-btn--lg">
        {item.ctaText}
        <ArrowRight size={20} />
      </Link>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const HomeHeroShowcase: React.FC = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  // Override hero text with i18n
  const translatedItems = heroItems
    .filter((item) => item.enabled)
    .map((item) => {
      if (item.id === 'veranda') {
        return {
          ...item,
          title: t('home.hero.title'),
          subtitle: t('home.hero.subtitle'),
          ctaText: t('home.hero.verandaCta'),
        };
      }
      if (item.id === 'maatwerk-veranda') {
        return {
          ...item,
          title: t('home.hero.maatwerkTitle'),
          subtitle: t('home.hero.maatwerkSubtitle'),
          ctaText: t('home.hero.maatwerkCta'),
        };
      }
      return item;
    });

  const handleTabChange = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const currentItem = translatedItems[activeIndex] ?? translatedItems[0];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="relative rounded-[28px] overflow-hidden min-h-[500px] md:min-h-[550px] lg:min-h-[600px]">
        {/* ── Background images (all pre-rendered, crossfade via opacity) ── */}
        {translatedItems.map((item, index) => (
          <HeroImage
            key={item.id}
            images={item.images}
            alt={item.title}
            isActive={index === activeIndex}
            priority={index === 0}
          />
        ))}

        {/* ── Dark overlay gradient ── */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-r from-black/40 via-black/25 to-black/10" />

        {/* ── Content ── */}
        <div className="relative z-10 h-full min-h-[500px] md:min-h-[550px] lg:min-h-[600px] flex flex-col justify-between p-6 md:p-10 lg:p-14">
          {/* Top section */}
          <div className="flex-1 flex flex-col justify-center max-w-2xl">
            {/* Pill tabs */}
            <div className="mb-6 md:mb-8">
              <PillTabs
                items={translatedItems}
                activeIndex={activeIndex}
                onChange={handleTabChange}
              />
            </div>

            {/* Eyebrow */}
            <span className="text-hett-secondary font-bold text-sm md:text-base tracking-wide uppercase mb-3">
              {t('home.hero.eyebrow')}
            </span>

            {/* Slide content (relative container for absolute positioning of inactive panels) */}
            <div className="relative">
              {translatedItems.map((item, index) => (
                <SlideContent key={item.id} item={item} isActive={index === activeIndex} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeHeroShowcase;