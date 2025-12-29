import "./styles/ui.css";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { VerandaEditProvider } from './context/VerandaEditContext';
import { MaatwerkEditProvider } from './context/MaatwerkEditContext';
import { SandwichpanelenEditProvider } from './context/SandwichpanelenEditContext';
import { ShopifyCartProvider } from './context/ShopifyCartContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ShopifyCartProvider>
      <CartProvider>
        <WishlistProvider>
          <VerandaEditProvider>
            <MaatwerkEditProvider>
            <SandwichpanelenEditProvider>
              <App />
            </SandwichpanelenEditProvider>
            </MaatwerkEditProvider>
          </VerandaEditProvider>
        </WishlistProvider>
      </CartProvider>
    </ShopifyCartProvider>
  </React.StrictMode>
);
