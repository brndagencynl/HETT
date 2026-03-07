import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { useCart } from './CartContext';
import CustomVerandaConfiguratorModal from '../components/CustomVerandaConfiguratorModal';

import {
  type MaatwerkConfig,
  type PartialMaatwerkConfig,
  DEFAULT_MAATWERK_CONFIG,
} from '../src/configurators/custom/customTypes';

import {
  buildMaatwerkCartPayload,
  getMaatwerkConfigSummary,
  isMaatwerkConfigComplete,
} from '../src/configurators/custom/customHelpers';

import type { CartItem } from '../types';

type EditRequest = {
  cartIndex: number;
  initialConfig: PartialMaatwerkConfig;
};

type MaatwerkEditContextType = {
  openMaatwerkEdit: (params: { cartIndex: number; item: CartItem }) => void;
  closeMaatwerkEdit: () => void;
  isEditing: boolean;
};

const MaatwerkEditContext = createContext<MaatwerkEditContextType | undefined>(undefined);

function coerceToPartialMaatwerkConfig(item: CartItem): PartialMaatwerkConfig {
  const data: any = item.config?.category === 'maatwerk_veranda' ? (item.config.data as any) : undefined;

  const width = data?.widthCm ?? data?.size?.width ?? item.maatwerkPayload?.size?.width;
  const depth = data?.depthCm ?? data?.size?.depth ?? item.maatwerkPayload?.size?.depth;

  const next: PartialMaatwerkConfig = {
    ...DEFAULT_MAATWERK_CONFIG,
    size: {
      width: typeof width === 'number' ? width : DEFAULT_MAATWERK_CONFIG.size!.width,
      depth: typeof depth === 'number' ? depth : DEFAULT_MAATWERK_CONFIG.size!.depth,
    },
    color: data?.color || item.maatwerkPayload?.selections?.find((s) => s.groupId === 'color')?.choiceId || DEFAULT_MAATWERK_CONFIG.color,
    daktype: data?.daktype || undefined,
    goot: data?.goot || undefined,
    zijwand_links: data?.zijwand_links ?? 'geen',
    zijwand_rechts: data?.zijwand_rechts ?? 'geen',
    voorzijde: data?.voorzijde ?? 'geen',
    verlichting: typeof data?.verlichting === 'boolean' ? data.verlichting : Boolean(data?.verlichting) || false,
  };

  return next;
}

export const MaatwerkEditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cart, updateCartItem } = useCart();
  const [editing, setEditing] = useState<EditRequest | null>(null);

  const openMaatwerkEdit = useCallback((params: { cartIndex: number; item: CartItem }) => {
    setEditing({
      cartIndex: params.cartIndex,
      initialConfig: coerceToPartialMaatwerkConfig(params.item),
    });
  }, []);

  const closeMaatwerkEdit = useCallback(() => setEditing(null), []);

  const isEditing = editing !== null;

  const currentCartItem = useMemo(() => {
    if (!editing) return null;
    return cart[editing.cartIndex] || null;
  }, [cart, editing]);

  const handleSave = useCallback(
    (config: MaatwerkConfig) => {
      if (!editing) return;
      if (!isMaatwerkConfigComplete(config)) return;

      const existing = cart[editing.cartIndex];
      if (!existing) return;

      const qty = existing.quantity || 1;

      const payload = buildMaatwerkCartPayload(config);
      const unitTotal = payload.totalPrice;
      const totalPrice = unitTotal * qty;

      const sizeSummary = `${config.size.width}×${config.size.depth}cm`;
      const displaySummary = getMaatwerkConfigSummary(config);
      const colorId = config.color || 'ral7016';

      updateCartItem(editing.cartIndex, {
        // required contract
        type: 'custom_veranda',

        // keep same line item id, but update displayed info
        title: 'Maatwerk Veranda',
        shortDescription: `Maatwerk veranda ${sizeSummary}`,
        imageUrl: `/renders/veranda/${String(colorId)}/base.png`,

        // pricing
        price: unitTotal,
        totalPrice,

        // structured config (backward compatible)
        config: {
          category: 'maatwerk_veranda',
          data: {
            type: 'maatwerk_veranda',
            size: config.size,
            widthCm: config.size.width,
            depthCm: config.size.depth,
            color: config.color,
            daktype: config.daktype,
            goot: config.goot,
            zijwand_links: config.zijwand_links,
            zijwand_rechts: config.zijwand_rechts,
            voorzijde: config.voorzijde,
            verlichting: config.verlichting,
          },
        },

        displayConfigSummary: displaySummary,

        // maatwerk payload & breakdown
        maatwerkPayload: {
          ...payload,
          quantity: qty,
          totalPrice: unitTotal,
        } as any,
        priceBreakdown: payload.priceBreakdown as any,

        details: [
          { label: 'Afmeting', value: sizeSummary },
          ...payload.selections.map((s) => ({ label: s.groupLabel, value: s.choiceLabel })),
        ],
      });

      closeMaatwerkEdit();
    },
    [cart, closeMaatwerkEdit, editing, updateCartItem]
  );

  return (
    <MaatwerkEditContext.Provider value={{ openMaatwerkEdit, closeMaatwerkEdit, isEditing }}>
      {children}

      {editing && currentCartItem && (
        <CustomVerandaConfiguratorModal
          isOpen
          initialConfig={editing.initialConfig}
          onSave={handleSave}
          onClose={closeMaatwerkEdit}
        />
      )}
    </MaatwerkEditContext.Provider>
  );
};

export function useMaatwerkEdit() {
  const ctx = useContext(MaatwerkEditContext);
  if (!ctx) throw new Error('useMaatwerkEdit must be used within a MaatwerkEditProvider');
  return ctx;
}
