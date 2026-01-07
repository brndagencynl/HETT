/**
 * Shipping Services Index
 * =======================
 * 
 * Re-exports all shipping-related services for easy importing.
 */

export {
  fetchDistance,
  extractPostalCode,
  detectCountryFromPostalCode,
  type DistanceRequest,
  type DistanceResponse,
  type DistanceResult,
} from './distanceClient';

export {
  calculateShipping,
  calculateCostFromDistance,
  centsToEuros,
  formatPrice,
  getInstantEstimate,
  getShippingDescription,
  isShippingAvailable,
  PRICE_PER_KM_CENTS,
  MINIMUM_COST_CENTS,
  MAXIMUM_COST_CENTS,
  type ShippingAddress,
  type ShippingCalculationResult,
  type ShippingCalculationError,
  type ShippingResult,
} from './shippingCalculator';
