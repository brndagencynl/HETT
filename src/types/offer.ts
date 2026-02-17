/**
 * Offer Request Types
 * ====================
 * 
 * Shared type for maatwerk offer flow.
 * Used by the configurator to create a draft and
 * by the Offerte page to display and submit.
 */

export interface OfferSelectionLine {
  key: string;
  label: string;
  valueLabel: string;
  /** Price in EUR. Only present when priceMode is 'paid' (or omitted). */
  price?: number;
  /** 'paid' = normal priced option, 'quote' = priced on request (montage) */
  priceMode?: 'paid' | 'quote';
}

export interface OfferRequestDraft {
  kind: 'maatwerk_offer';
  createdAt: string;
  product: {
    handle: string;
    title: string;
    category: 'verandas';
  };
  size: { widthCm: number; depthCm: number };
  /** Fallback single preview image */
  previewImageUrl: string;
  /** Stacked visualization layer URLs (base + overlays, in z-order) */
  previewLayers: string[];
  selections: OfferSelectionLine[];
  pricing: {
    base: number;
    /** Sum of paid options only (excludes montage) */
    optionsTotal: number;
    /** base + optionsTotal */
    total: number;
    currency: 'EUR';
  };
  reference: string;
}

export interface OfferContactInfo {
  naam: string;
  email: string;
  telefoon: string;
  postcode: string;
  plaats: string;
  opmerking: string;
}

export interface OfferSubmitPayload {
  draft: OfferRequestDraft;
  contact: OfferContactInfo;
}
