/**
 * Maatwerk Configurator Page
 * ==========================
 * 
 * Standalone page for the maatwerk veranda configurator.
 * Renders the configurator directly without product context.
 */

import React from 'react';
import MaatwerkVerandaConfigurator from '../components/MaatwerkVerandaConfigurator';
import { useCart } from '../context/CartContext';
import { buildMaatwerkCartPayload, type MaatwerkCartPayload } from '../src/configurators/custom';

const MaatwerkConfiguratorPage: React.FC = () => {
  const { addMaatwerkToCart, openCart } = useCart();

  const handleAddToCart = (payload: MaatwerkCartPayload) => {
    // Add the maatwerk item to cart
    addMaatwerkToCart(payload);
    
    // Open cart drawer (stay on current page)
    openCart();
  };

  return (
    <MaatwerkVerandaConfigurator 
      onAddToCart={handleAddToCart}
    />
  );
};

export default MaatwerkConfiguratorPage;
