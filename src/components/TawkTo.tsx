import { useEffect } from 'react';

/**
 * TawkTo Chat Widget Component
 * 
 * Injects the Tawk.to chat script once and manages its lifecycle.
 * - Duplicate guard: checks if script already exists
 * - Async loading: doesn't block rendering
 * - Cleanup: removes script on unmount (though unlikely in App.tsx)
 * - Body class toggle: adds/removes 'tawk-visible' for CTA collision avoidance
 * 
 * Usage: Place <TawkTo /> once in App.tsx, outside of routes.
 */

const TAWK_PROPERTY_ID = '695dab78ca5231197e06ccd0';
const TAWK_WIDGET_ID = '1jeaubjid';
const TAWK_SCRIPT_ID = 'tawkto-script';

const TawkTo: React.FC = () => {
  useEffect(() => {
    // Guard: Don't inject if already present
    if (window.Tawk_API || document.getElementById(TAWK_SCRIPT_ID)) {
      return;
    }

    // Initialize Tawk globals
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    /**
     * Tawk.to visibility callbacks
     * Toggle body.tawk-visible class so CSS can shift fixed CTAs
     * to avoid overlap with the chat bubble.
     */
    window.Tawk_API.onLoad = function() {
      // Widget loaded - add class (bubble is visible by default)
      document.body.classList.add('tawk-visible');
    };

    window.Tawk_API.onChatMinimized = function() {
      // Chat minimized but bubble still visible - keep class
      document.body.classList.add('tawk-visible');
    };

    window.Tawk_API.onChatMaximized = function() {
      // Chat expanded - keep class
      document.body.classList.add('tawk-visible');
    };

    window.Tawk_API.onChatHidden = function() {
      // Widget completely hidden - remove class
      document.body.classList.remove('tawk-visible');
    };

    // Create and inject script
    const script = document.createElement('script');
    script.id = TAWK_SCRIPT_ID;
    script.async = true;
    script.src = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    // Insert script into document
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }

    // Cleanup on unmount (edge case, but good practice)
    return () => {
      const existingScript = document.getElementById(TAWK_SCRIPT_ID);
      if (existingScript) {
        existingScript.remove();
      }
      // Remove body class on cleanup
      document.body.classList.remove('tawk-visible');
      // Note: We don't delete window.Tawk_API here as Tawk may still be running
    };
  }, []);

  // This component renders nothing
  return null;
};

export default TawkTo;
