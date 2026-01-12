import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Settings, Truck } from 'lucide-react';
import { formatEUR } from '../../src/utils/money';
import type { PopulaireVerandaKaart } from '../../config/homepageContent';

interface VerandaPresetCardProps {
  card: PopulaireVerandaKaart;
}

/**
 * VerandaPresetCard
 * 
 * A card component for displaying hardcoded veranda presets on the homepage.
 * Styled to match the existing ProductCard component.
 */
const VerandaPresetCard: React.FC<VerandaPresetCardProps> = ({ card }) => {
  return (
    <Link
      to={card.href}
      className="bg-white border border-gray-200 rounded-lg shadow-soft hover:shadow-md transition-all flex flex-col group overflow-hidden cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative flex items-center justify-center overflow-hidden bg-gray-50 h-32 sm:h-64">
        <img
          src={card.imageSrc}
          alt={card.imageAlt}
          className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content Section */}
      <div className="p-2.5 sm:p-5 flex flex-col flex-grow relative bg-white">
        <div className="block mb-1 sm:mb-2">
          <h3 className="text-hett-dark font-bold text-[13px] sm:text-base leading-tight group-hover:underline line-clamp-2 min-h-[2.4rem] sm:min-h-[3rem]">
            {card.title}
          </h3>
          <div className="mt-0.5 sm:mt-1 space-y-0.5">
            <div className="text-[10px] sm:text-xs text-gray-500 font-medium leading-tight line-clamp-2">
              {card.description}
            </div>
          </div>
        </div>

        <div className="mb-3 sm:mb-4">
          {card.prijsVanafCents && (
            <div className="text-base sm:text-2xl font-black text-hett-dark leading-none">
              {formatEUR(card.prijsVanafCents, 'cents')} <span className="text-xs font-medium text-gray-500">vanaf</span>
            </div>
          )}
          {card.usps.length > 0 && (
            <div className="mt-1 flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 font-medium leading-tight">
              <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
              <span className="line-clamp-1">{card.usps[0]}</span>
            </div>
          )}
        </div>

        <div className="mt-auto">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = card.href;
            }}
            className="w-full rounded-md py-2 sm:py-3 text-[11px] sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm transition-colors bg-hett-dark text-white hover:bg-hett-primary"
          >
            <Settings size={16} />
            {card.ctaLabel}
          </button>
          <div className="mt-2 flex items-center gap-1 text-[10px] sm:text-xs text-green-600 font-medium leading-tight">
            <Truck size={14} className="flex-shrink-0" />
            <span>{card.deliveryLabel}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VerandaPresetCard;
