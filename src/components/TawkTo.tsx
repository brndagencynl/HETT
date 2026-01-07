import { useEffect } from 'react';

/**
 * TawkTo Chat Widget Component
 * 
 * Injects the Tawk.to chat script once and manages its lifecycle.
 * - Duplicate guard: checks if script already exists
 * - Async loading: doesn't block rendering
 * - Cleanup: removes script on unmount (though unlikely in App.tsx)
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
      // Note: We don't delete window.Tawk_API here as Tawk may still be running
    };
  }, []);

  // This component renders nothing
  return null;
};

export default TawkTo;
