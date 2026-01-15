/**
 * ShippingSection Component
 * ==========================
 * 
 * Shipping method and address selection for the cart page.
 * 
 * Features:
 * - Pickup vs Delivery selection
 * - Country selection (NL/BE/DE)
 * - Address form (street, house number, postal code, city)
 * - "Bereken verzendkosten" button
 * - Distance and cost display
 * - Error handling
 */

import React, { useState, useCallback } from 'react';
import { MapPin, Truck, Check, AlertCircle, Loader2, Lock, ChevronDown } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { useCart, type ShippingMode, type ShippingCountry, type ShippingAddress } from '../../../context/CartContext';
import { formatShippingPrice } from '../../services/shippingQuote';

// =============================================================================
// CONSTANTS
// =============================================================================

const COUNTRIES: { code: ShippingCountry; label: string }[] = [
  { code: 'NL', label: 'Nederland' },
  { code: 'BE', label: 'België' },
  { code: 'DE', label: 'Duitsland' },
];

const COUNTRY_LABELS: Record<ShippingCountry, string> = {
  NL: 'Nederland',
  BE: 'België',
  DE: 'Duitsland',
};

// =============================================================================
// COMPONENT
// =============================================================================

export const ShippingSection: React.FC = () => {
  const {
    shippingMode,
    shippingCountry,
    shippingAddress,
    shippingQuote,
    shippingCost,
    shippingIsValid,
    shippingIsCalculating,
    shippingError,
    isShippingLocked,
    setShippingMode,
    setShippingCountry,
    setShippingAddress,
    fetchShippingQuote,
    clearShippingQuote,
  } = useCart();

  // Local form state
  const [localAddress, setLocalAddress] = useState<ShippingAddress>({
    street: shippingAddress.street || '',
    houseNumber: shippingAddress.houseNumber || '',
    postalCode: shippingAddress.postalCode || '',
    city: shippingAddress.city || '',
  });

  // Handle mode change
  const handleModeChange = (mode: ShippingMode) => {
    if (isShippingLocked) return;
    setShippingMode(mode);
  };

  // Handle country change
  const handleCountryChange = (country: ShippingCountry) => {
    if (isShippingLocked) return;
    setShippingCountry(country);
    // Clear quote when country changes
    clearShippingQuote();
  };

  // Handle address field change
  const handleFieldChange = (field: keyof ShippingAddress, value: string) => {
    if (isShippingLocked) return;
    const newAddress = { ...localAddress, [field]: value };
    setLocalAddress(newAddress);
    // Clear quote when address changes
    if (shippingQuote) {
      clearShippingQuote();
    }
  };

  // Handle calculate shipping
  const handleCalculateShipping = useCallback(async () => {
    if (isShippingLocked) return;
    
    // Update context with local address
    setShippingAddress(localAddress);
    
    // Small delay to ensure state is updated
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Fetch quote
    await fetchShippingQuote();
  }, [localAddress, isShippingLocked, setShippingAddress, fetchShippingQuote]);

  // Check if address is complete enough to calculate
  const canCalculate = localAddress.postalCode.trim().length >= 4;

  return (
    <Card padding="wide">
      <h3 className="text-lg font-black text-[#003878] mb-4 pb-3 border-b border-gray-100">
        Afhalen of bezorgen
      </h3>

      {/* Lock Banner */}
      {isShippingLocked && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
          <Lock size={16} className="flex-shrink-0" />
          <span className="text-sm">Bezorgmethode is vergrendeld tijdens het afrekenen.</span>
        </div>
      )}

      {/* Shipping Method Selection */}
      <div className={`space-y-3 ${isShippingLocked ? 'opacity-60 pointer-events-none' : ''}`}>
        
        {/* Pickup Option */}
        <label
          className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
            isShippingLocked ? 'cursor-not-allowed' : 'cursor-pointer'
          } ${
            shippingMode === 'pickup'
              ? 'border-[#003878] bg-[#003878]/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="shippingMode"
            value="pickup"
            checked={shippingMode === 'pickup'}
            onChange={() => handleModeChange('pickup')}
            disabled={isShippingLocked}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              shippingMode === 'pickup' ? 'border-[#003878]' : 'border-gray-300'
            }`}
          >
            {shippingMode === 'pickup' && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#003878]" />
            )}
          </div>
          <MapPin
            size={20}
            className={shippingMode === 'pickup' ? 'text-[#003878]' : 'text-gray-400'}
          />
          <div className="flex-1">
            <div className="font-bold text-gray-900">Afhalen</div>
            <div className="text-xs text-gray-500">Hoppenkuil 17, 5626DD Eindhoven</div>
          </div>
          <span className="font-bold text-green-600">Gratis</span>
        </label>

        {/* Delivery Option */}
        <label
          className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
            isShippingLocked ? 'cursor-not-allowed' : 'cursor-pointer'
          } ${
            shippingMode === 'delivery'
              ? 'border-[#003878] bg-[#003878]/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="shippingMode"
            value="delivery"
            checked={shippingMode === 'delivery'}
            onChange={() => handleModeChange('delivery')}
            disabled={isShippingLocked}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              shippingMode === 'delivery' ? 'border-[#003878]' : 'border-gray-300'
            }`}
          >
            {shippingMode === 'delivery' && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#003878]" />
            )}
          </div>
          <Truck
            size={20}
            className={shippingMode === 'delivery' ? 'text-[#003878]' : 'text-gray-400'}
          />
          <div className="flex-1">
            <div className="font-bold text-gray-900">Bezorgen</div>
            <div className="text-xs text-gray-500">Veranda ≤ 300 km gratis • &gt; 300 km € 299,99 • Accessoires € 29,99</div>
          </div>
          {shippingMode === 'delivery' && shippingIsValid && !shippingIsCalculating && (
            <span className={`font-bold ${shippingCost === 0 ? 'text-green-600' : 'text-gray-900'}`}>
              {formatShippingPrice(shippingCost)}
            </span>
          )}
          {shippingMode === 'delivery' && shippingIsCalculating && (
            <Loader2 size={18} className="animate-spin text-[#003878]" />
          )}
        </label>
      </div>

      {/* Pickup Confirmation */}
      {shippingMode === 'pickup' && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <Check size={16} />
            <span>Afhalen in Eindhoven (gratis)</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            U ontvangt een e-mail zodra uw bestelling klaar staat voor ophalen.
          </p>
        </div>
      )}

      {/* Delivery Address Form */}
      {shippingMode === 'delivery' && (
        <div className={`mt-4 pt-4 border-t border-gray-100 ${isShippingLocked ? 'opacity-60 pointer-events-none' : ''}`}>
          <div className="space-y-4">
            
            {/* Country Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Land *
              </label>
              <div className="relative">
                <select
                  value={shippingCountry}
                  onChange={(e) => handleCountryChange(e.target.value as ShippingCountry)}
                  disabled={isShippingLocked}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 font-medium 
                    focus:outline-none focus:ring-2 focus:ring-[#003878] focus:border-transparent
                    disabled:cursor-not-allowed disabled:bg-gray-50 appearance-none cursor-pointer"
                >
                  {COUNTRIES.map(({ code, label }) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown 
                  size={18} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Veranda ≤ 300 km gratis • &gt; 300 km € 299,99 • Accessoires € 29,99
              </p>
            </div>

            {/* Street */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Straat
              </label>
              <input
                type="text"
                value={localAddress.street}
                onChange={(e) => handleFieldChange('street', e.target.value)}
                placeholder="Bijv. Kerkstraat"
                disabled={isShippingLocked}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 font-medium 
                  focus:outline-none focus:ring-2 focus:ring-[#003878] focus:border-transparent
                  disabled:cursor-not-allowed disabled:bg-gray-50"
              />
            </div>

            {/* House Number + Postal Code Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Huisnummer
                </label>
                <input
                  type="text"
                  value={localAddress.houseNumber}
                  onChange={(e) => handleFieldChange('houseNumber', e.target.value)}
                  placeholder="123"
                  disabled={isShippingLocked}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 font-medium 
                    focus:outline-none focus:ring-2 focus:ring-[#003878] focus:border-transparent
                    disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Postcode *
                </label>
                <input
                  type="text"
                  value={localAddress.postalCode}
                  onChange={(e) => handleFieldChange('postalCode', e.target.value.toUpperCase())}
                  placeholder={shippingCountry === 'NL' ? '1234 AB' : shippingCountry === 'BE' ? '2000' : '10115'}
                  disabled={isShippingLocked}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 font-medium 
                    focus:outline-none focus:ring-2 focus:ring-[#003878] focus:border-transparent
                    disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Plaats *
              </label>
              <input
                type="text"
                value={localAddress.city}
                onChange={(e) => handleFieldChange('city', e.target.value)}
                placeholder={shippingCountry === 'NL' ? 'Amsterdam' : shippingCountry === 'BE' ? 'Antwerpen' : 'Berlin'}
                disabled={isShippingLocked}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 font-medium 
                  focus:outline-none focus:ring-2 focus:ring-[#003878] focus:border-transparent
                  disabled:cursor-not-allowed disabled:bg-gray-50"
              />
            </div>

            {/* Calculate Button */}
            <button
              type="button"
              onClick={handleCalculateShipping}
              disabled={isShippingLocked || shippingIsCalculating || !canCalculate}
              className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2
                ${shippingIsCalculating 
                  ? 'bg-[#003878]/70 cursor-wait' 
                  : shippingIsValid
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-[#003878] hover:bg-[#003878]/90'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {shippingIsCalculating && (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verzendkosten berekenen...
                </>
              )}
              {shippingIsValid && !shippingIsCalculating && (
                <>
                  <Check size={18} />
                  Verzendkosten berekend
                </>
              )}
              {!shippingIsValid && !shippingIsCalculating && (
                <>
                  Bereken verzendkosten
                </>
              )}
            </button>

            {/* Error Message */}
            {shippingError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="text-sm flex items-start gap-2 text-red-700">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  <span>{shippingError}</span>
                </div>
              </div>
            )}

            {/* Quote Result */}
            {shippingIsValid && shippingQuote && !shippingIsCalculating && (
              <div className="p-4 bg-[#eff6ff] rounded-lg border border-gray-200">
                <div className="space-y-2">
                  {shippingQuote.type && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Type</span>
                      <span className="font-semibold text-gray-900">
                        {shippingQuote.type === 'free'
                          ? 'Gratis bezorging'
                          : shippingQuote.type === 'accessories'
                            ? 'Accessoires (vast tarief)'
                            : shippingQuote.type === 'veranda_flat'
                              ? 'Veranda (vast tarief)'
                              : 'Bezorgen'}
                      </span>
                    </div>
                  )}
                  {/* Distance */}
                  {shippingQuote.distanceKm > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Afstand</span>
                      <span className="font-semibold text-gray-900">{shippingQuote.distanceKm.toFixed(1)} km</span>
                    </div>
                  )}
                  {/* Price */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                    <span className="font-semibold text-gray-700">Verzendkosten</span>
                    <span className={`text-lg font-black ${shippingCost === 0 ? 'text-green-600' : 'text-[#003878]'}`}>
                      {formatShippingPrice(shippingCost)}
                    </span>
                  </div>
                  {shippingQuote.description && (
                    <p className="text-xs text-gray-500 pt-1">{shippingQuote.description}</p>
                  )}
                </div>
              </div>
            )}

            {/* Help Text */}
            {!shippingIsValid && !shippingError && (
              <p className="text-xs text-gray-400">
                Vul uw adres in en klik op "Bereken verzendkosten" om de bezorgkosten te zien.
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default ShippingSection;
