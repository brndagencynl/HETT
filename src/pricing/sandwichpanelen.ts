import type { SandwichConfig } from '../../types';

export const SANDWICH_WORKING_WIDTH_MM = 1000 as const;

export const SANDWICH_LENGTH_MM_OPTIONS = [2500, 3000, 3500, 4000, 4500, 5000] as const;
export type SandwichLengthMm = (typeof SANDWICH_LENGTH_MM_OPTIONS)[number];

export const SANDWICH_COLOR_OPTIONS = [
  { id: 'ral7016', label: 'Antraciet (RAL 7016)', hex: '#293133' },
  { id: 'ral9001', label: 'Crème (RAL 9001)', hex: '#FDF4E3' },
  { id: 'ral9005', label: 'Zwart (RAL 9005)', hex: '#0E0E10' },
] as const;

export type SandwichColorId = (typeof SANDWICH_COLOR_OPTIONS)[number]['id'];

// Placeholder price until business provides final value
export const U_PROFILE_PRICE_PER_M = 12.5;

export type SandwichPricingBreakdownRow = { label: string; amount: number };

export function calculateSandwichpanelenPricing(params: {
  basePrice: number;
  config: SandwichConfig;
}): {
  basePrice: number;
  extrasTotal: number;
  total: number;
  breakdown: SandwichPricingBreakdownRow[];
} {
  const { basePrice, config } = params;

  const lengthMm = (config as any)?.lengthMm as number | undefined;
  void lengthMm; // reserved for future length mapping

  const uProfiles = (config as any)?.extras?.uProfiles as { enabled?: boolean; meters?: number } | undefined;
  const uEnabled = Boolean(uProfiles?.enabled);
  const meters = Math.max(1, Math.round(Number(uProfiles?.meters || 1)));

  const uProfilesTotal = uEnabled ? meters * U_PROFILE_PRICE_PER_M : 0;

  const breakdown: SandwichPricingBreakdownRow[] = [];
  if (uEnabled) {
    breakdown.push({ label: `U-profielen: ${meters} m`, amount: uProfilesTotal });
  }

  const extrasTotal = uProfilesTotal;
  return {
    basePrice,
    extrasTotal,
    total: basePrice + extrasTotal,
    breakdown,
  };
}
