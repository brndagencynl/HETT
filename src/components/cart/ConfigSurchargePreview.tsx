/**
 * Configuration Surcharge Preview Component
 * ==========================================
 * 
 * Displays a preview of the configuration surcharge that will be added
 * to Shopify checkout. This shows users what extra charges they'll see
 * for their configuration options.
 * 
 * Note: This is calculated locally based on cart items and matches
 * what will be added as price-step lines during checkout.
 */

import React, { useMemo } from 'react';
import { Settings, Info } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { getTotalOptionsSurchargeCents } from '../../configurator/pricing/getOptionsSurchargeCents';
import { formatEUR, fromCents } from '../../utils/money';
import { buildPriceSteps, formatPriceStepsDisplay } from '../../utils/priceSteps';
import { isShippingLineItem } from '../../services/shipping';

interface ConfigSurchargePreviewProps {
  /** Show detailed breakdown (step values) */
  showDetails?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Preview component showing configuration surcharge.
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
            <h4 className="font-bold text-blue-900">Configuratie toeslag</h4>
            <span className="font-black text-blue-900 text-lg">
              {formatEUR(surchargeInfo.totalCents, 'cents')}
            </span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Extra opties voor uw configuratie(s)
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

/**
 * Hook to get configuration surcharge info.
 * Useful for components that need the data without the UI.
 */
export function useConfigSurchargePreview() {
  const { cart } = useCart();

  return useMemo(() => {
    if (!cart || cart.length === 0) {
      return { totalCents: 0, totalEur: 0, hasurcharge: false };
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

export default ConfigSurchargePreview;
