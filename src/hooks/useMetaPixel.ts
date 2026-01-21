import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const META_PIXEL_ID = '4124230187722791';

// Extend Window interface for fbq
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

/**
 * Custom hook for Meta Pixel SPA PageView tracking.
 * Tracks PageView on every route change without duplicates.
 * 
 * Note: The base pixel code is loaded via index.html <head>.
 * This hook only handles SPA route change tracking.
 */
export const useMetaPixel = () => {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the first render since the initial PageView is already
    // fired by the base pixel code in index.html
    if (isFirstRender.current) {
      isFirstRender.current = false;
      console.log('[Meta Pixel] Initial PageView already tracked by base code');
      return;
    }

    // Track PageView on route change
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
      console.log(`[Meta Pixel] PageView tracked for route: ${location.pathname}${location.hash}`);
    } else {
      console.warn('[Meta Pixel] fbq not available');
    }
  }, [location.pathname, location.hash]);
};

export default useMetaPixel;
