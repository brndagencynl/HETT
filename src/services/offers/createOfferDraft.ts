/**
 * Create Offer Draft
 * ===================
 * 
 * Builds an OfferRequestDraft from maatwerk configurator state.
 */

import type { OfferRequestDraft, OfferSelectionLine } from '../../types/offer';
import type { PartialMaatwerkConfig, MaatwerkPriceBreakdown } from '../../configurators/custom/customTypes';
import { getMaatwerkOptionLabel } from '../../configurators/custom/customPricing';
import { formatMaatwerkSize } from '../../configurators/custom/customHelpers';

interface CreateOfferDraftInput {
  config: PartialMaatwerkConfig;
  priceBreakdown: MaatwerkPriceBreakdown;
  ledSelectedTotal: number;
  ledQty: number;
  previewImageUrl: string;
  /** All visualization layer URLs in z-order (base + overlays) */
  previewLayers: string[];
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
 * Create an OfferRequestDraft from maatwerk configurator state
 */
export function createMaatwerkOfferDraft(input: CreateOfferDraftInput): OfferRequestDraft {
  const { config, priceBreakdown, ledSelectedTotal, ledQty, previewImageUrl, previewLayers } = input;

  const widthCm = config.size?.width ?? 0;
  const depthCm = config.size?.depth ?? 0;

  const reference = generateOfferReference();

  // Build selections list
  const selections: OfferSelectionLine[] = [];

  // Size (included in base, no price)
  selections.push({
    key: 'afmetingen',
    label: 'Afmetingen',
    valueLabel: config.size ? formatMaatwerkSize(config.size) : '-',
    price: 0,
    priceMode: 'paid',
  });

  // Kleur (included in base, no price)
  selections.push({
    key: 'color',
    label: 'Kleur profiel',
    valueLabel: getMaatwerkOptionLabel('color', config.color),
    price: 0,
    priceMode: 'paid',
  });

  // Options from price breakdown
  const optionKeys: Array<{ key: string; label: string }> = [
    { key: 'daktype', label: 'Daktype' },
    { key: 'goot', label: 'Goot optie' },
    { key: 'zijwand_links', label: 'Zijwand links' },
    { key: 'zijwand_rechts', label: 'Zijwand rechts' },
    { key: 'voorzijde', label: 'Voorzijde' },
  ];

  for (const opt of optionKeys) {
    const configValue = (config as Record<string, unknown>)[opt.key];
    const selection = priceBreakdown.selections.find(s => s.groupId === opt.key);
    selections.push({
      key: opt.key,
      label: opt.label,
      valueLabel: getMaatwerkOptionLabel(opt.key, configValue as string),
      price: selection?.price ?? 0,
      priceMode: 'paid',
    });
  }

  // LED verlichting (normal paid addon)
  if (config.verlichting && ledQty > 0) {
    selections.push({
      key: 'verlichting',
      label: 'LED Verlichting',
      valueLabel: `Ja, ${ledQty} LED spots`,
      price: ledSelectedTotal,
      priceMode: 'paid',
    });
  } else {
    selections.push({
      key: 'verlichting',
      label: 'LED Verlichting',
      valueLabel: 'Nee',
      price: 0,
      priceMode: 'paid',
    });
  }

  // Montage — never include a numeric price, always priceMode 'quote'
  if (config.montage) {
    selections.push({
      key: 'montage',
      label: 'Montage',
      valueLabel: 'Ja (op offerte)',
      priceMode: 'quote',
    });
  }

  // Calculate totals — montage is EXCLUDED from all numbers
  const base = priceBreakdown.basePrice;
  const optionsTotal = priceBreakdown.optionsTotal + ledSelectedTotal;
  const total = base + optionsTotal;

  // Cache-bust preview URL
  const finalPreviewUrl = previewImageUrl.includes('?')
    ? `${previewImageUrl}&ref=${encodeURIComponent(reference)}`
    : `${previewImageUrl}?ref=${encodeURIComponent(reference)}`;

  return {
    kind: 'maatwerk_offer',
    createdAt: new Date().toISOString(),
    product: {
      handle: 'maatwerk-veranda',
      title: 'Maatwerk Veranda',
      category: 'verandas',
    },
    size: { widthCm, depthCm },
    previewImageUrl: finalPreviewUrl,
    previewLayers,
    selections,
    pricing: {
      base,
      optionsTotal,
      total,
      currency: 'EUR',
    },
    reference,
  };
}
