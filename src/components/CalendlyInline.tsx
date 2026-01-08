/**
 * Calendly Inline Embed Component
 * ================================
 * 
 * Renders a Calendly inline widget for scheduling appointments.
 * Loads the Calendly script only once and handles cleanup on unmount.
 */

import React, { useEffect, useState, useRef } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';

const CALENDLY_SCRIPT_SRC = 'https://assets.calendly.com/assets/external/widget.js';
const SCRIPT_ID = 'calendly-widget-script';
const LOAD_TIMEOUT_MS = 5000;

interface CalendlyInlineProps {
  url: string;
  className?: string;
}

/**
 * CalendlyInline - Embeds a Calendly scheduling widget inline
 * 
 * @param url - The Calendly scheduling URL
 * @param className - Optional additional CSS classes
 */
const CalendlyInline: React.FC<CalendlyInlineProps> = ({ url, className = '' }) => {
  const [scriptStatus, setScriptStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if script already exists and is loaded
    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    
    if (existingScript) {
      // Script already in DOM, check if Calendly is available
      if ((window as any).Calendly) {
        setScriptStatus('loaded');
        return;
      }
      // Script exists but Calendly not ready yet, wait for it
      existingScript.addEventListener('load', () => setScriptStatus('loaded'));
      existingScript.addEventListener('error', () => setScriptStatus('error'));
    } else {
      // Create and inject script
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = CALENDLY_SCRIPT_SRC;
      script.async = true;

      script.onload = () => {
        console.log('[Calendly] Script loaded successfully');
        setScriptStatus('loaded');
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };

      script.onerror = () => {
        console.error('[Calendly] Failed to load script');
        setScriptStatus('error');
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };

      document.body.appendChild(script);
    }

    // Set timeout for fallback
    timeoutRef.current = window.setTimeout(() => {
      if (scriptStatus === 'loading') {
        console.warn('[Calendly] Script load timeout - showing fallback');
        setScriptStatus('error');
      }
    }, LOAD_TIMEOUT_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Note: We don't remove the script on unmount to avoid re-loading
      // when navigating back to this page
    };
  }, []);

  // Re-initialize Calendly widget when script loads or URL changes
  useEffect(() => {
    if (scriptStatus === 'loaded' && containerRef.current && (window as any).Calendly) {
      // Clear any existing widget content
      containerRef.current.innerHTML = '';
      
      // Initialize the widget
      (window as any).Calendly.initInlineWidget({
        url: url,
        parentElement: containerRef.current,
      });
    }
  }, [scriptStatus, url]);

  return (
    <div className={`calendly-container ${className}`}>
      {/* Loading State */}
      {scriptStatus === 'loading' && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 size={40} className="animate-spin mb-4 text-hett-brown" />
          <p className="text-sm font-medium">Agenda laden...</p>
        </div>
      )}

      {/* Calendly Widget Container */}
      <div
        ref={containerRef}
        className="calendly-inline-widget"
        data-url={url}
        style={{
          minWidth: '320px',
          width: '100%',
          height: scriptStatus === 'loaded' ? '900px' : '0px',
          overflow: 'hidden',
          transition: 'height 0.3s ease',
        }}
      />

      {/* Error/Fallback State */}
      {scriptStatus === 'error' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-amber-800 text-sm mb-4">
            De agenda kon niet worden geladen. Probeer het later opnieuw of plan direct via Calendly.
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-hett-dark text-white px-6 py-3 rounded-xl font-bold hover:bg-hett-brown transition-colors"
          >
            <ExternalLink size={18} />
            Open Calendly
          </a>
        </div>
      )}
    </div>
  );
};

export default CalendlyInline;
