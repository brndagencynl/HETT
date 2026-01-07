/**
 * Shipping Services Index
 * =======================
 * 
 * Re-exports all shipping-related services for easy importing.
 */

// Constants
export {
  ORIGIN_ADDRESS,
  WAREHOUSE_LOCATION,
  SHIPPING_PRODUCT_HANDLE,
  SHIPPING_LINE_CART_ID,
  PRICE_PER_KM_EUR,
  PRICE_PER_KM_CENTS,
  SUPPORTED_COUNTRIES,
  COUNTRY_LABELS,
  COUNTRY_NAMES,
  PAID_SHIPPING_COUNTRIES,
  isShippingFree,
  isShippingPaid,
  type ShippingCountry,
} from './constants';

// Distance client
export {
  fetchDistance,
  extractPostalCode,
  detectCountryFromPostalCode,
  type DistanceRequest,
  type DistanceResponse,
  type DistanceResult,
} from './distanceClient';

// Shipping calculator (legacy)
export {
  calculateShipping,
  calculateCostFromDistance,
  centsToEuros,
  formatPrice,
  getInstantEstimate,
  getShippingDescription,
  isShippingAvailable,
  MINIMUM_COST_CENTS,
  MAXIMUM_COST_CENTS,
  type ShippingAddress,
  type ShippingCalculationResult,
  type ShippingCalculationError,
  type ShippingResult,
} from './shippingCalculator';

// Shipping line item (new system)
export {
  getShippingProduct,
  clearShippingProductCache,
  calculateShippingFromDistance,
  createShippingLineItem,
  isShippingLineItem,
  findShippingLine,
  getProductsOnly,
  getProductsTotalCents,
  type ShippingSelection,
  type ShippingQuoteResult,
  type ShippingLineItem,
} from './shippingLineItem';
