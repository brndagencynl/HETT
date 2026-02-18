/**
 * Create Standard-Package Offer Draft
 * =====================================
 *
 * Builds an OfferRequestDraft from the standard veranda configurator
 * wizard state. Only called when the user selects Montage = Ja.
 */

import type { OfferRequestDraft, OfferSelectionLine } from '../../types/offer';
import type { VerandaConfig } from '../../configurator/schemas/veranda';
import type { VerandaPriceBreakdown } from '../../../components/VerandaConfiguratorWizard';

interface CreateStandardOfferDraftInput {
  /** Full configurator state */
  config: VerandaConfig;
  /** Product title including size, e.g. "Standaard Veranda 506 x 306 cm" */
  productTitle: string;
  /** Shopify product handle */
  productHandle: string;
  /** Width in cm */
  widthCm: number;
  /** Depth in cm */
  depthCm: number;
  /** Details array produced by the wizard */
  details: { label: string; value: string }[];
  /** Breakdown computed by the wizard */
  priceBreakdown: VerandaPriceBreakdown;
  /** Stacked visualization layer URLs */
  previewLayers: string[];
  /** Single fallback preview URL */
  previewImageUrl: string;
}

/**
 * Generate a short reference code for the offer
 */
function generateOfferReference(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `OFF-${dateStr}-${rand}`;
}

/**
 * Create an OfferRequestDraft for a standard veranda package (Montage = Ja).
 */
export function createStandardOfferDraft(input: CreateStandardOfferDraftInput): OfferRequestDraft {
  const {
    config,
    productTitle,
    productHandle,
    widthCm,
    depthCm,
    details,
    priceBreakdown,
    previewLayers,
    previewImageUrl,
  } = input;

  const reference = generateOfferReference();

  // Build selections from the wizard's detail rows
  const selections: OfferSelectionLine[] = details.map((d) => {
    // Find matching price item in the breakdown
    const priceItem = priceBreakdown.items.find(
      (pi) => pi.label.toLowerCase().includes(d.label.toLowerCase()),
    );

    return {
      key: d.label.toLowerCase().replace(/\s+/g, '_'),
      label: d.label,
      valueLabel: d.value,
      price: priceItem?.amount ?? 0,
      priceMode: 'paid' as const,
    };
  });

  // Append Montage line — always priceMode 'quote', no numeric price
  selections.push({
    key: 'montage',
    label: 'Montage',
    valueLabel: 'Ja (op offerte)',
    priceMode: 'quote',
  });

  // Cache-bust preview URL
  const finalPreviewUrl = previewImageUrl.includes('?')
    ? `${previewImageUrl}&ref=${encodeURIComponent(reference)}`
    : `${previewImageUrl}?ref=${encodeURIComponent(reference)}`;

  return {
    kind: 'standard_package',
    createdAt: new Date().toISOString(),
    product: {
      handle: productHandle,
      title: productTitle,
      category: 'verandas',
    },
    size: { widthCm, depthCm },
    previewImageUrl: finalPreviewUrl,
    previewLayers,
    selections,
    pricing: {
      base: priceBreakdown.basePrice,
      optionsTotal: priceBreakdown.optionsTotal,
      total: priceBreakdown.grandTotal,
      currency: 'EUR',
    },
    reference,
    flags: {
      montage: true,
    },
  };
}
