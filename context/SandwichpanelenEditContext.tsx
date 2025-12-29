import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { CartItem, ProductConfig, SandwichConfig } from '../types';
import { useCart } from './CartContext';
import SandwichpanelenCartItemEditorModal from '../components/SandwichpanelenCartItemEditorModal';
import { calculateSandwichpanelenPricing, SANDWICH_WORKING_WIDTH_MM } from '../src/pricing/sandwichpanelen';

type SandwichEditState =
  | null
  | {
      lineId: string;
      item: CartItem;
      basePrice: number;
      initialConfig: SandwichConfig;
    };

type SandwichpanelenEditContextType = {
  openSandwichpanelenEdit: (params: { lineId: string; item: CartItem }) => void;
  closeSandwichpanelenEdit: () => void;
  isEditing: boolean;
};

const SandwichpanelenEditContext = createContext<SandwichpanelenEditContextType | undefined>(undefined);

function extractSandwichConfig(item: CartItem): SandwichConfig {
  const raw: any = item?.config;

  // Most items store ProductConfig: { category, data }
  if (raw && typeof raw === 'object' && 'category' in raw && 'data' in raw) {
    return (raw.data || {}) as SandwichConfig;
  }

  // Fallback: config was stored directly as SandwichConfig
  return (raw || {}) as SandwichConfig;
}

function buildSandwichProductConfig(existing: any, nextData: SandwichConfig): ProductConfig {
  if (existing && typeof existing === 'object' && 'category' in existing && 'data' in existing) {
    return {
      ...(existing as ProductConfig),
      category: 'sandwichpanelen',
      data: nextData as any,
    };
  }

  return {
    category: 'sandwichpanelen',
    data: nextData as any,
  };
}

export const SandwichpanelenEditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { updateCartItem } = useCart();
  const [state, setState] = useState<SandwichEditState>(null);

  const openSandwichpanelenEdit = useCallback((params: { lineId: string; item: CartItem }) => {
    const { lineId, item } = params;

    const basePrice =
      typeof item?.pricing?.basePrice === 'number'
        ? item.pricing.basePrice
        : typeof item?.price === 'number'
          ? item.price
          : item?.quantity
            ? item.totalPrice / item.quantity
            : item.totalPrice;

    const current = extractSandwichConfig(item);

    const initialConfig: SandwichConfig = {
      workingWidthMm: SANDWICH_WORKING_WIDTH_MM,
      lengthMm: (current as any).lengthMm,
      color: (current as any).color,
      extras: {
        uProfiles: {
          enabled: Boolean((current as any)?.extras?.uProfiles?.enabled),
          meters: Math.max(1, Math.round(Number((current as any)?.extras?.uProfiles?.meters || 1))),
        },
      },
    };

    setState({ lineId, item, basePrice, initialConfig });
  }, []);

  const closeSandwichpanelenEdit = useCallback(() => setState(null), []);

  const isEditing = Boolean(state);

  const onSave = useCallback(
    (nextConfig: SandwichConfig) => {
      if (!state) return;

      const { lineId, item, basePrice } = state;

      const normalizedNext: SandwichConfig = {
        workingWidthMm: SANDWICH_WORKING_WIDTH_MM,
        lengthMm: (nextConfig as any).lengthMm,
        color: (nextConfig as any).color,
        extras: {
          uProfiles: {
            enabled: Boolean((nextConfig as any)?.extras?.uProfiles?.enabled),
            meters: Math.max(1, Math.round(Number((nextConfig as any)?.extras?.uProfiles?.meters || 1))),
          },
        },
      };

      const pricing = calculateSandwichpanelenPricing({ basePrice, config: normalizedNext as any });

      const selectedColorLabel =
        normalizedNext.color === 'ral7016'
          ? 'Antraciet (RAL 7016)'
          : normalizedNext.color === 'ral9001'
            ? 'Crème (RAL 9001)'
            : normalizedNext.color === 'ral9005'
              ? 'Zwart (RAL 9005)'
              : String(normalizedNext.color || '');

      const details = [
        { label: 'Breedte', value: `${SANDWICH_WORKING_WIDTH_MM} mm` },
        { label: 'Lengte', value: `${normalizedNext.lengthMm} mm` },
        { label: 'Kleur', value: selectedColorLabel },
        ...(normalizedNext.extras?.uProfiles?.enabled
          ? [{ label: 'U-profielen', value: `${normalizedNext.extras.uProfiles.meters} m` }]
          : []),
      ];

      const displayConfigSummary = [
        `Breedte: ${SANDWICH_WORKING_WIDTH_MM} mm`,
        `Lengte: ${normalizedNext.lengthMm} mm`,
        `Kleur: ${selectedColorLabel}`,
        ...(normalizedNext.extras?.uProfiles?.enabled
          ? [`U-profielen: ${normalizedNext.extras.uProfiles.meters} m`]
          : []),
      ].join(' • ');

      const breakdownItems = pricing.breakdown.map((row) => ({
        groupLabel: 'Extra opties',
        choiceLabel: row.label,
        price: row.amount,
      }));

      const priceBreakdown = {
        basePrice: pricing.basePrice,
        items: breakdownItems,
        optionsTotal: pricing.extrasTotal,
        grandTotal: pricing.total,
      };

      const updatedConfig = buildSandwichProductConfig(item.config as any, normalizedNext);

      const quantity = item.quantity || 1;
      const unitTotal = pricing.total;

      updateCartItem(lineId, {
        type: 'sandwichpanelen',
        config: updatedConfig,
        pricing: {
          basePrice: pricing.basePrice,
          extrasTotal: pricing.extrasTotal,
          total: unitTotal,
          breakdown: pricing.breakdown,
        },
        priceBreakdown,
        details,
        displayConfigSummary,
        totalPrice: unitTotal * quantity,
      });

      setState(null);
    },
    [state, updateCartItem]
  );

  const value = useMemo(
    () => ({ openSandwichpanelenEdit, closeSandwichpanelenEdit, isEditing }),
    [openSandwichpanelenEdit, closeSandwichpanelenEdit, isEditing]
  );

  return (
    <SandwichpanelenEditContext.Provider value={value}>
      {children}
      {state ? (
        <SandwichpanelenCartItemEditorModal
          isOpen={Boolean(state)}
          basePrice={state.basePrice}
          initialConfig={state.initialConfig}
          onSave={onSave}
          onClose={closeSandwichpanelenEdit}
        />
      ) : null}
    </SandwichpanelenEditContext.Provider>
  );
};

export function useSandwichpanelenEdit(): SandwichpanelenEditContextType {
  const ctx = useContext(SandwichpanelenEditContext);
  if (!ctx) throw new Error('useSandwichpanelenEdit must be used within a SandwichpanelenEditProvider');
  return ctx;
}
