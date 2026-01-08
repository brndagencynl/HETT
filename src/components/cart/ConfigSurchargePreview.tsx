/**
 * Configuration Surcharge Preview Component
 * ==========================================
 * 
 * Displays configuration option surcharges in cart UI.
 * 
 * Two modes:
 * 1. Summary mode (default): Shows total surcharge as a blue info box
 * 2. Inline mode: Shows breakdown within a product card
 * 
 * Note: This is calculated locally based on cart items and matches
 * what will be added as price-step lines during checkout.
 */

import React, { useMemo } from 'react';
import { Settings, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { getOptionsSurchargeCents, getTotalOptionsSurchargeCents } from '../../configurator/pricing/getOptionsSurchargeCents';
import { formatEUR, fromCents } from '../../utils/money';
import { buildPriceSteps, formatPriceStepsDisplay } from '../../utils/priceSteps';
import { isShippingLineItem } from '../../services/shipping';
import type { CartItem } from '../../../types';

interface ConfigSurchargePreviewProps {
  /** Show detailed breakdown (step values) */
  showDetails?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Preview component showing total configuration surcharge.
 * Shows the total and optionally the price step breakdown.
 */
export const ConfigSurchargePreview: React.FC<ConfigSurchargePreviewProps> = ({
  showDetails = false,
  className = '',
}) => {
  const { cart } = useCart();

  // Calculate surcharge from cart items (excluding shipping and LED)
  const surchargeInfo = useMemo(() => {
    if (!cart || cart.length === 0) {
      return { totalCents: 0, steps: [], totalEur: 0 };
    }

    // Filter out shipping lines
    const productItems = cart.filter(item => !isShippingLineItem(item));
    
    // Get total surcharge
    const totalCents = getTotalOptionsSurchargeCents(productItems);
    
    // Build price steps for display
    const steps = totalCents > 0 ? buildPriceSteps(totalCents) : [];
    
    return {
      totalCents,
      totalEur: totalCents / 100,
      steps,
    };
  }, [cart]);

  // Don't render if no surcharge
  if (surchargeInfo.totalCents === 0) {
    return null;
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg flex-shrink-0">
          <Settings className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-blue-900">Opties & configuratie</h4>
            <span className="font-black text-blue-900 text-lg">
              {formatEUR(surchargeInfo.totalCents, 'cents')}
            </span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Gekozen extra's voor deze samenstelling
          </p>
          {showDetails && surchargeInfo.steps.length > 0 && (
            <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
              <Info size={12} />
              <span>{formatPriceStepsDisplay(surchargeInfo.steps)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// INLINE BREAKDOWN COMPONENT (for product cards)
// =============================================================================

interface InlineSurchargeBreakdownProps {
  /** Cart item to show surcharge for */
  item: CartItem;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Inline breakdown showing configuration options for a single product.
 * This is INFORMATIONAL ONLY - the options value is already included in lineTotalCents.
 * Renders within a product card, explaining what options are included in the price.
 */
export const InlineSurchargeBreakdown: React.FC<InlineSurchargeBreakdownProps> = ({
  item,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Calculate options value for this specific item (for display info)
  const surchargeInfo = useMemo(() => {
    const result = getOptionsSurchargeCents(item);
    
    if (!result.success || result.amountCents === 0) {
      return null;
    }
    
    // Account for item quantity
    const totalCents = result.amountCents * (item.quantity || 1);
    
    return {
      totalCents,
      totalEur: totalCents / 100,
      configType: result.configType,
      summary: result.summary,
    };
  }, [item]);

  // Don't render if no options value (means no options selected beyond base)
  if (!surchargeInfo) {
    return null;
  }

  // Parse summary into readable lines
  const optionLines = surchargeInfo.summary
    .split(', ')
    .filter(line => line.trim().length > 0);

  return (
    <div className={`bg-blue-50/50 border border-blue-100 rounded-md p-2 mt-2 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-xs font-semibold text-blue-800">
          Inbegrepen opties
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-blue-600">
            {formatEUR(surchargeInfo.totalCents, 'cents')} in prijs
          </span>
          {optionLines.length > 0 && (
            isExpanded ? (
              <ChevronUp size={14} className="text-blue-600" />
            ) : (
              <ChevronDown size={14} className="text-blue-600" />
            )
          )}
        </div>
      </button>
      
      {isExpanded && optionLines.length > 0 && (
        <div className="mt-2 pt-2 border-t border-blue-100 space-y-1">
          {optionLines.map((line, idx) => (
            <div key={idx} className="text-[10px] text-blue-700">
              • {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// WARNING BANNER (for ungrouped surcharges)
// =============================================================================

interface SurchargeWarningBannerProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Warning banner shown when surcharge lines couldn't be grouped.
 * This indicates a potential issue but totals are still correct.
 */
export const SurchargeWarningBanner: React.FC<SurchargeWarningBannerProps> = ({
  className = '',
}) => {
  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Info size={16} className="text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          Sommige optieprijzen konden niet gegroepeerd worden. Het totaalbedrag is wel correct.
        </p>
      </div>
    </div>
  );
};

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to get configuration surcharge info.
 * Useful for components that need the data without the UI.
 */
export function useConfigSurchargePreview() {
  const { cart } = useCart();

  return useMemo(() => {
    if (!cart || cart.length === 0) {
      return { totalCents: 0, totalEur: 0, hasSurcharge: false };
    }

    // Filter out shipping lines
    const productItems = cart.filter(item => !isShippingLineItem(item));
    
    // Get total surcharge
    const totalCents = getTotalOptionsSurchargeCents(productItems);
    
    return {
      totalCents,
      totalEur: totalCents / 100,
      hasSurcharge: totalCents > 0,
    };
  }, [cart]);
}

/**
 * Hook to get surcharge info for a specific cart item.
 */
export function useItemSurcharge(item: CartItem | null) {
  return useMemo(() => {
    if (!item) {
      return { totalCents: 0, totalEur: 0, hasSurcharge: false, summary: '' };
    }

    const result = getOptionsSurchargeCents(item);
    
    if (!result.success || result.amountCents === 0) {
      return { totalCents: 0, totalEur: 0, hasSurcharge: false, summary: '' };
    }
    
    const totalCents = result.amountCents * (item.quantity || 1);
    
    return {
      totalCents,
      totalEur: totalCents / 100,
      hasSurcharge: true,
      summary: result.summary,
    };
  }, [item]);
}

export default ConfigSurchargePreview;
