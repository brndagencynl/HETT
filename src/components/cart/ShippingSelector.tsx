/**
 * ShippingSelector Component
 * ==========================
 * 
 * Shipping method selection with postal code detection for NL/BE/DE.
 * Used on the /cart page to determine shipping costs before checkout.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Truck, Check, AlertCircle, Lock } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import {
  type ShippingMethod,
  type CountryCode,
  validateShipping,
  formatShippingCost,
  getCountryLabel,
} from '../../utils/shipping';

// =============================================================================
// TYPES
// =============================================================================

export interface ShippingSelectorProps {
  method: ShippingMethod;
  postcode: string;
  country: CountryCode | null;
  cost: number;
  isValid: boolean;
  isLocked: boolean;
  onMethodChange: (method: ShippingMethod) => void;
  onPostcodeChange: (postcode: string) => void;
  onValidationChange: (isValid: boolean, country: CountryCode | null, cost: number) => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const ShippingSelector: React.FC<ShippingSelectorProps> = ({
  method,
  postcode,
  country,
  cost,
  isValid,
  isLocked,
  onMethodChange,
  onPostcodeChange,
  onValidationChange,
}) => {
  const [localPostcode, setLocalPostcode] = useState(postcode);
  const [validationMessage, setValidationMessage] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);

  // Validate shipping whenever method or postcode changes
  const validateAndUpdate = useCallback((currentMethod: ShippingMethod, currentPostcode: string) => {
    const result = validateShipping(currentMethod, currentPostcode);
    setValidationMessage(result.message);
    onValidationChange(result.isValid, result.country, result.cost);
  }, [onValidationChange]);

  // Initial validation on mount and when method changes
  useEffect(() => {
    validateAndUpdate(method, localPostcode);
  }, [method, validateAndUpdate, localPostcode]);

  // Handle method change
  const handleMethodChange = (newMethod: ShippingMethod) => {
    if (isLocked) return;
    onMethodChange(newMethod);
    validateAndUpdate(newMethod, localPostcode);
  };

  // Handle postcode input
  const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    const value = e.target.value.toUpperCase();
    setLocalPostcode(value);
    setHasInteracted(true);
    onPostcodeChange(value);
    validateAndUpdate(method, value);
  };

  // Determine validation state for delivery
  const showError = method === 'delivery' && hasInteracted && localPostcode.trim() && !isValid;
  const showSuccess = method === 'delivery' && isValid && country !== null;

  return (
    <Card padding="wide">
      <h3 className="text-lg font-black text-[#003878] mb-4 pb-3 border-b border-gray-100">
        Bezorging / Afhalen
      </h3>

      {/* Lock Banner */}
      {isLocked && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
          <Lock size={16} className="flex-shrink-0" />
          <span className="text-sm">Bezorgmethode is vergrendeld tijdens het afrekenen.</span>
        </div>
      )}

      {/* Shipping Method Selection */}
      <div className={`space-y-3 ${isLocked ? 'opacity-60 pointer-events-none' : ''}`}>
        
        {/* Pickup Option */}
        <label
          className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
            isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
          } ${
            method === 'pickup'
              ? 'border-[#003878] bg-[#003878]/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="shippingMethod"
            value="pickup"
            checked={method === 'pickup'}
            onChange={() => handleMethodChange('pickup')}
            disabled={isLocked}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              method === 'pickup' ? 'border-[#003878]' : 'border-gray-300'
            }`}
          >
            {method === 'pickup' && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#003878]" />
            )}
          </div>
          <MapPin
            size={20}
            className={method === 'pickup' ? 'text-[#003878]' : 'text-gray-400'}
          />
          <div className="flex-1">
            <div className="font-bold text-gray-900">Afhalen in Eindhoven</div>
            <div className="text-xs text-gray-500">Op ons magazijn ophalen</div>
          </div>
          <span className="font-bold text-green-600">Gratis</span>
        </label>

        {/* Delivery Option */}
        <label
          className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
            isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
          } ${
            method === 'delivery'
              ? 'border-[#003878] bg-[#003878]/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="shippingMethod"
            value="delivery"
            checked={method === 'delivery'}
            onChange={() => handleMethodChange('delivery')}
            disabled={isLocked}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              method === 'delivery' ? 'border-[#003878]' : 'border-gray-300'
            }`}
          >
            {method === 'delivery' && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#003878]" />
            )}
          </div>
          <Truck
            size={20}
            className={method === 'delivery' ? 'text-[#003878]' : 'text-gray-400'}
          />
          <div className="flex-1">
            <div className="font-bold text-gray-900">Bezorgen</div>
            <div className="text-xs text-gray-500">Aan huis geleverd</div>
          </div>
          {method === 'delivery' && isValid && (
            <span className={`font-bold ${cost === 0 ? 'text-green-600' : 'text-gray-900'}`}>
              {formatShippingCost(cost)}
            </span>
          )}
        </label>
      </div>

      {/* Postcode Input (only for delivery) */}
      {method === 'delivery' && (
        <div className={`mt-4 pt-4 border-t border-gray-100 ${isLocked ? 'opacity-60 pointer-events-none' : ''}`}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Postcode bezorgadres
          </label>
          <div className="relative">
            <input
              type="text"
              value={localPostcode}
              onChange={handlePostcodeChange}
              placeholder="Bijv. 1234 AB, 1000, 10115"
              disabled={isLocked}
              className={`w-full px-4 py-3 border-2 rounded-lg bg-white text-gray-900 font-medium 
                focus:outline-none focus:ring-2 focus:ring-[#003878] focus:border-transparent
                disabled:cursor-not-allowed disabled:bg-gray-50
                ${showError ? 'border-red-300 bg-red-50' : ''}
                ${showSuccess ? 'border-green-300 bg-green-50' : ''}
                ${!showError && !showSuccess ? 'border-gray-200' : ''}
              `}
            />
            {/* Validation icon */}
            {method === 'delivery' && localPostcode.trim() && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {showSuccess && <Check size={20} className="text-green-600" />}
                {showError && <AlertCircle size={20} className="text-red-500" />}
              </div>
            )}
          </div>

          {/* Validation Message */}
          {method === 'delivery' && (hasInteracted || isValid) && validationMessage && (
            <div
              className={`mt-2 text-sm font-medium flex items-center gap-2 ${
                showError ? 'text-red-600' : showSuccess ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {showSuccess && <Check size={14} />}
              {showError && <AlertCircle size={14} />}
              {validationMessage}
            </div>
          )}

          {/* Country help text */}
          <p className="mt-2 text-xs text-gray-400">
            Wij leveren in Nederland, België en Duitsland
          </p>
        </div>
      )}

      {/* Pickup confirmation */}
      {method === 'pickup' && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <Check size={16} />
            <span>Afhalen in Eindhoven (gratis)</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            U ontvangt een e-mail zodra uw bestelling klaar staat
          </p>
        </div>
      )}
    </Card>
  );
};

export default ShippingSelector;
