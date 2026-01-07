/**
 * AddressDeliverySelector Component
 * ==================================
 * 
 * Address form with Google Address Validation for shipping calculation.
 * Used on the /cart page to determine shipping costs before checkout.
 * 
 * Features:
 * - Pickup vs Delivery selection
 * - Full address form for delivery (street, postal code, city, country)
 * - Google Address Validation via serverless API
 * - Real-time validation status feedback
 * - Distance-based shipping cost calculation (€1/km for BE/DE, free for NL)
 */

import React, { useState, useCallback, useEffect } from 'react';
import { MapPin, Truck, Check, AlertCircle, Loader2, Lock, ChevronDown } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import {
  type CountryCode,
  type AddressInput,
  type NormalizedAddress,
  type ValidationStatus,
  SUPPORTED_COUNTRIES,
  COUNTRY_LABELS,
  validateAddress,
  formatShippingCost,
  isAddressComplete,
  isDeliveryAvailable,
} from '../../services/addressValidation';
import {
  calculateShipping,
  type ShippingResult,
} from '../../services/shipping';

// =============================================================================
// TYPES
// =============================================================================

export type ShippingMethod = 'pickup' | 'delivery';

export interface DeliveryAddress extends AddressInput {
  isValidated: boolean;
  normalizedAddress: NormalizedAddress | null;
}

export interface AddressDeliverySelectorProps {
  method: ShippingMethod;
  address: DeliveryAddress;
  shippingCost: number;
  isLocked: boolean;
  onMethodChange: (method: ShippingMethod) => void;
  onAddressChange: (address: DeliveryAddress) => void;
  onShippingCostChange: (cost: number, isValid: boolean) => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const AddressDeliverySelector: React.FC<AddressDeliverySelectorProps> = ({
  method,
  address,
  shippingCost,
  isLocked,
  onMethodChange,
  onAddressChange,
  onShippingCostChange,
}) => {
  // Local form state
  const [localAddress, setLocalAddress] = useState<AddressInput>({
    street: address.street || '',
    postalCode: address.postalCode || '',
    city: address.city || '',
    country: address.country || 'NL',
  });
  
  // Validation state
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>(
    address.isValidated ? 'valid' : 'idle'
  );
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Distance-based shipping state
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  // Initialize from props if address was previously validated
  useEffect(() => {
    if (address.isValidated && address.normalizedAddress) {
      setValidationStatus('valid');
      setValidationMessages(['Adres is geldig.']);
    }
  }, []);

  // Handle method change
  const handleMethodChange = (newMethod: ShippingMethod) => {
    if (isLocked) return;
    onMethodChange(newMethod);
    
    // If switching to pickup, mark as valid with 0 cost
    if (newMethod === 'pickup') {
      onShippingCostChange(0, true);
      setDistanceKm(null);
    } else {
      // If switching to delivery, use current validation state
      const isValid = validationStatus === 'valid';
      // Keep existing shipping cost if valid, otherwise 0
      onShippingCostChange(isValid ? shippingCost : 0, isValid);
    }
  };

  // Handle address field changes
  const handleFieldChange = (field: keyof AddressInput, value: string) => {
    if (isLocked) return;
    
    setHasInteracted(true);
    
    const newAddress = { ...localAddress, [field]: value };
    setLocalAddress(newAddress);
    
    // Reset validation when address changes
    setValidationStatus('idle');
    setValidationMessages([]);
    setDistanceKm(null);
    
    // Update parent with non-validated address
    onAddressChange({
      ...newAddress,
      isValidated: false,
      normalizedAddress: null,
    });
    
    // Mark shipping as invalid until re-validated
    onShippingCostChange(0, false);
  };

  // Calculate shipping cost using distance API
  const calculateDistanceBasedShipping = useCallback(async (
    addressData: AddressInput
  ): Promise<ShippingResult> => {
    setIsCalculatingShipping(true);
    try {
      const result = await calculateShipping({
        country: addressData.country,
        postalCode: addressData.postalCode,
        street: addressData.street,
        city: addressData.city,
      });
      return result;
    } finally {
      setIsCalculatingShipping(false);
    }
  }, []);

  // Validate address
  const handleValidateAddress = useCallback(async () => {
    if (isLocked) return;
    
    // Check if all fields are filled
    if (!isAddressComplete(localAddress)) {
      setValidationMessages(['Vul alle adresvelden in.']);
      setValidationStatus('invalid');
      return;
    }

    setValidationStatus('validating');
    setValidationMessages([]);
    setDistanceKm(null);

    try {
      const result = await validateAddress(localAddress);
      
      if (result.isValid && result.normalizedAddress) {
        // Check if delivery is available for this country
        const countryCode = result.countryCode as CountryCode;
        if (!isDeliveryAvailable(countryCode)) {
          setValidationStatus('invalid');
          setValidationMessages([
            'Bezorging is niet beschikbaar in dit land.',
            'Kies "Afhalen" of selecteer een ander land (NL/BE/DE).'
          ]);
          onShippingCostChange(0, false);
          return;
        }
        
        // Address is valid, now calculate distance-based shipping
        const shippingResult = await calculateDistanceBasedShipping({
          ...localAddress,
          country: countryCode,
        });
        
        if (shippingResult.success) {
          setValidationStatus('valid');
          setDistanceKm(shippingResult.distanceKm);
          
          // Build success messages
          const messages: string[] = ['Adres is geldig.'];
          if (shippingResult.distanceKm > 0) {
            messages.push(`Afstand: ${shippingResult.distanceKm} km vanaf Eindhoven`);
          }
          setValidationMessages(messages);
          
          // Convert euros to cents for consistency with cart context
          const costInEuros = shippingResult.costEuros;
          
          // Update parent with validated address
          onAddressChange({
            ...localAddress,
            country: countryCode,
            isValidated: true,
            normalizedAddress: result.normalizedAddress,
          });
          
          onShippingCostChange(costInEuros, true);
          
          // Update local state with normalized values if available
          if (result.normalizedAddress) {
            setLocalAddress({
              street: result.normalizedAddress.street || localAddress.street,
              postalCode: result.normalizedAddress.postalCode || localAddress.postalCode,
              city: result.normalizedAddress.city || localAddress.city,
              country: (result.normalizedAddress.country as CountryCode) || localAddress.country,
            });
          }
        } else {
          // Shipping calculation failed - still show address as valid but with error
          setValidationStatus('valid');
          setValidationMessages([
            'Adres is geldig.',
            `Kon bezorgkosten niet berekenen: ${shippingResult.error}`,
          ]);
          
          // Update parent with validated address but no shipping cost
          onAddressChange({
            ...localAddress,
            country: countryCode,
            isValidated: true,
            normalizedAddress: result.normalizedAddress,
          });
          
          onShippingCostChange(0, false);
        }
      } else {
        setValidationStatus('invalid');
        setValidationMessages(result.messages);
        onShippingCostChange(0, false);
        
        onAddressChange({
          ...localAddress,
          isValidated: false,
          normalizedAddress: null,
        });
      }
    } catch (error) {
      setValidationStatus('invalid');
      setValidationMessages(['Er is een fout opgetreden. Probeer het opnieuw.']);
      onShippingCostChange(0, false);
    }
  }, [localAddress, isLocked, onAddressChange, onShippingCostChange, calculateDistanceBasedShipping]);

  // Determine if checkout should be blocked
  const canProceed = method === 'pickup' || (method === 'delivery' && validationStatus === 'valid');

  return (
    <Card padding="wide">
      <h3 className="text-lg font-black text-[#003878] mb-4 pb-3 border-b border-gray-100">
        Bezorging & Adres
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
            <div className="text-xs text-gray-500">NL gratis, BE/DE € 1,- per km</div>
          </div>
          {method === 'delivery' && validationStatus === 'valid' && !isCalculatingShipping && (
            <span className={`font-bold ${shippingCost === 0 ? 'text-green-600' : 'text-gray-900'}`}>
              {formatShippingCost(shippingCost)}
            </span>
          )}
          {method === 'delivery' && isCalculatingShipping && (
            <Loader2 size={18} className="animate-spin text-[#003878]" />
          )}
        </label>
      </div>

      {/* Pickup Confirmation */}
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

      {/* Address Form (only for delivery) */}
      {method === 'delivery' && (
        <div className={`mt-4 pt-4 border-t border-gray-100 ${isLocked ? 'opacity-60 pointer-events-none' : ''}`}>
          <div className="space-y-4">
            
            {/* Street + House Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Straat en huisnummer *
              </label>
              <input
                type="text"
                value={localAddress.street}
                onChange={(e) => handleFieldChange('street', e.target.value)}
                placeholder="Bijv. Kerkstraat 123"
                disabled={isLocked}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 font-medium 
                  focus:outline-none focus:ring-2 focus:ring-[#003878] focus:border-transparent
                  disabled:cursor-not-allowed disabled:bg-gray-50"
              />
            </div>

            {/* Postal Code + City Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Postcode *
                </label>
                <input
                  type="text"
                  value={localAddress.postalCode}
                  onChange={(e) => handleFieldChange('postalCode', e.target.value.toUpperCase())}
                  placeholder="Bijv. 1234 AB"
                  disabled={isLocked}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 font-medium 
                    focus:outline-none focus:ring-2 focus:ring-[#003878] focus:border-transparent
                    disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Plaats *
                </label>
                <input
                  type="text"
                  value={localAddress.city}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  placeholder="Bijv. Amsterdam"
                  disabled={isLocked}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 font-medium 
                    focus:outline-none focus:ring-2 focus:ring-[#003878] focus:border-transparent
                    disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Country Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Land *
              </label>
              <div className="relative">
                <select
                  value={localAddress.country}
                  onChange={(e) => handleFieldChange('country', e.target.value)}
                  disabled={isLocked}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 font-medium 
                    focus:outline-none focus:ring-2 focus:ring-[#003878] focus:border-transparent
                    disabled:cursor-not-allowed disabled:bg-gray-50 appearance-none cursor-pointer"
                >
                  {SUPPORTED_COUNTRIES.map(({ code, label }) => (
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
            </div>

            {/* Validate Button */}
            <button
              type="button"
              onClick={handleValidateAddress}
              disabled={isLocked || validationStatus === 'validating' || isCalculatingShipping || !isAddressComplete(localAddress)}
              className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2
                ${(validationStatus === 'validating' || isCalculatingShipping)
                  ? 'bg-[#003878]/70 cursor-wait' 
                  : validationStatus === 'valid'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-[#003878] hover:bg-[#003878]/90'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {(validationStatus === 'validating' || isCalculatingShipping) && (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {isCalculatingShipping ? 'Bezorgkosten berekenen...' : 'Adres valideren...'}
                </>
              )}
              {validationStatus === 'valid' && !isCalculatingShipping && (
                <>
                  <Check size={18} />
                  Adres gevalideerd
                </>
              )}
              {(validationStatus === 'idle' || validationStatus === 'invalid') && !isCalculatingShipping && (
                <>
                  Adres valideren
                </>
              )}
            </button>

            {/* Validation Messages */}
            {validationMessages.length > 0 && (
              <div
                className={`p-3 rounded-lg ${
                  validationStatus === 'valid'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                {validationMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`text-sm flex items-start gap-2 ${
                      validationStatus === 'valid' ? 'text-green-700' : 'text-red-700'
                    } ${i > 0 ? 'mt-1' : ''}`}
                  >
                    {validationStatus === 'valid' ? (
                      <Check size={14} className="mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    )}
                    <span>{msg}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Shipping Cost Info */}
            {validationStatus === 'valid' && !isCalculatingShipping && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <span>Bezorgkosten ({COUNTRY_LABELS[localAddress.country]})</span>
                    {distanceKm !== null && distanceKm > 0 && (
                      <span className="block text-xs text-gray-400 mt-0.5">
                        {distanceKm} km × €1,- = {formatShippingCost(shippingCost)}
                      </span>
                    )}
                  </div>
                  <span className={`font-bold ${shippingCost === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {formatShippingCost(shippingCost)}
                  </span>
                </div>
              </div>
            )}

            {/* Help Text */}
            {validationStatus !== 'valid' && hasInteracted && (
              <p className="text-xs text-gray-400">
                Valideer uw adres om de bezorgkosten te berekenen en door te gaan naar afrekenen.
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default AddressDeliverySelector;
