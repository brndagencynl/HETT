/**
 * Application Entry Point
 * Sets up React root with all providers and global error handling
 */

import "./styles/ui.css";
import './src/i18n';
import React from 'react';
import ReactDOM from 'react-dom/client';

// =============================================================================
// GLOBAL ERROR HANDLERS
// =============================================================================
// These catch errors that escape React's error boundary

/**
 * Handle uncaught JavaScript errors
 */
window.addEventListener('error', (event) => {
  console.error('[GlobalError] Uncaught error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
  });
  
  // Prevent default browser error handling in dev
  // event.preventDefault();
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('[UnhandledRejection] Promise rejected:', {
    reason: event.reason,
    promise: event.promise,
  });
  
  // Prevent the browser from logging an additional error
  // event.preventDefault();
});

// =============================================================================
// IMPORTS
// =============================================================================

import App from './App';
import ErrorBoundary from './src/components/ErrorBoundary';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { VerandaEditProvider } from './context/VerandaEditContext';
import { MaatwerkEditProvider } from './context/MaatwerkEditContext';
import { SandwichpanelenEditProvider } from './context/SandwichpanelenEditContext';
import { ShopifyCartProvider } from './context/ShopifyCartContext';

// =============================================================================
// RENDER APPLICATION
// =============================================================================

const rootElement = document.getElementById('root');
if (!rootElement) {
  // This is a fatal error - display a basic message
  document.body.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: sans-serif;">
      <div style="text-align: center; padding: 40px;">
        <h1 style="color: #DC2626;">Kritieke fout</h1>
        <p>De applicatie kon niet worden geladen. Root element ontbreekt.</p>
        <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">
          Herlaad
        </button>
      </div>
    </div>
  `;
  throw new Error("Could not find root element to mount to");
}

console.log('[App] Starting application...');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
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
    </ErrorBoundary>
  </React.StrictMode>
);

console.log('[App] Render initiated');
