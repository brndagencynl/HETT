/**
 * VerandaEditContext
 * 
 * Shared context for managing veranda configuration editing from cart.
 * Provides a unified way to open the configurator in "edit mode" from:
 * - Cart drawer
 * - /cart page
 * - /afrekenen (checkout) page
 * 
 * When editing, the configurator prefills with the existing configuration
 * and updates the same cart line item (instead of adding a new one).
 */

import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import VerandaConfiguratorWizard, { VerandaConfiguratorWizardRef } from '../components/VerandaConfiguratorWizard';
import { useCart } from './CartContext';
import { ProductConfig } from '../types';
// Use the schema VerandaConfig which matches the configurator's types
import { VerandaConfig } from '../src/configurator/schemas/veranda';

interface EditingCartItem {
  cartIndex: number;
  productTitle: string;
  basePrice: number;
  initialConfig: Partial<VerandaConfig>;
}

interface VerandaEditContextType {
  /** Open configurator in edit mode for an existing cart item */
  openEditConfigurator: (params: {
    cartIndex: number;
    productTitle: string;
    basePrice: number;
    initialConfig?: Partial<VerandaConfig>;
  }) => void;
  /** Whether the configurator is currently open in edit mode */
  isEditing: boolean;
  /** Close the configurator without saving */
  closeEditConfigurator: () => void;
}

const VerandaEditContext = createContext<VerandaEditContextType | undefined>(undefined);

export const VerandaEditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const configuratorRef = useRef<VerandaConfiguratorWizardRef>(null);
  const [editingItem, setEditingItem] = useState<EditingCartItem | null>(null);
  const [configWasReset, setConfigWasReset] = useState(false);
  const { updateCartItem } = useCart();

  const openEditConfigurator = useCallback((params: {
    cartIndex: number;
    productTitle: string;
    basePrice: number;
    initialConfig?: Partial<VerandaConfig>;
  }) => {
    const { cartIndex, productTitle, basePrice, initialConfig } = params;

    // Determine if config is missing or incomplete
    const hasValidConfig = initialConfig && 
      (initialConfig.daktype || initialConfig.goot);

    setConfigWasReset(!hasValidConfig);
    setEditingItem({
      cartIndex,
      productTitle,
      basePrice,
      initialConfig: initialConfig || {},
    });

    // Open configurator with initial config (or defaults if missing)
    setTimeout(() => {
      configuratorRef.current?.open(hasValidConfig ? initialConfig : undefined);
    }, 50);
  }, []);

  const closeEditConfigurator = useCallback(() => {
    configuratorRef.current?.close();
    setEditingItem(null);
    setConfigWasReset(false);
  }, []);

  // Handle save from edit mode
  const handleEditSubmit = useCallback((
    config: VerandaConfig, 
    mode: 'order' | 'quote', 
    price: number, 
    details: { label: string; value: string }[]
  ) => {
    if (!editingItem) return;

    if (mode === 'order') {
      // Cast to any to bridge schema VerandaConfig and types.ts ProductConfig
      const productConfig: ProductConfig = { category: 'verandas', data: config as any };

      // Update the existing cart item
      updateCartItem(editingItem.cartIndex, {
        totalPrice: price,
        config: productConfig,
        details,
        displayConfigSummary: `Dak: ${config.daktype || '-'}, Goot: ${config.goot || '-'}, Voorzijde: ${config.voorzijde || 'Geen'}`,
      });
    }

    setEditingItem(null);
    setConfigWasReset(false);
  }, [editingItem, updateCartItem]);

  const isEditing = editingItem !== null;

  return (
    <VerandaEditContext.Provider value={{ openEditConfigurator, isEditing, closeEditConfigurator }}>
      {children}
      
      {/* Shared configurator instance for editing */}
      {editingItem && (
        <VerandaConfiguratorWizard
          ref={configuratorRef}
          productTitle={editingItem.productTitle}
          basePrice={editingItem.basePrice}
          onSubmit={handleEditSubmit}
          mode="edit"
          showResetMessage={configWasReset}
          onCancel={closeEditConfigurator}
        />
      )}
    </VerandaEditContext.Provider>
  );
};

export const useVerandaEdit = () => {
  const context = useContext(VerandaEditContext);
  if (!context) {
    throw new Error('useVerandaEdit must be used within a VerandaEditProvider');
  }
  return context;
};
