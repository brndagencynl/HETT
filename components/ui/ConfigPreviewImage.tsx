/**
 * ConfigPreviewImage
 * ==================
 * 
 * Reusable component for rendering configured product preview (base + overlays).
 * Used in cart drawer, cart page, and checkout page.
 * 
 * Features:
 * - Renders base image with stacked overlays
 * - Lazy loading for performance
 * - Responsive sizing
 * - Fixed aspect ratio to prevent layout shift
 * - Fallback support for missing render data
 */

import React, { useMemo } from 'react';
import { buildRenderSnapshot, type VerandaVisualizationConfig, FALLBACK_IMAGE } from '../../src/configurator/visual/verandaAssets';
import type { VerandaConfig } from '../../types';

export interface ConfigPreviewImageProps {
  /** Base image URL */
  baseImageUrl?: string;
  /** Overlay URLs in z-order (render bottom to top) */
  overlayUrls?: string[];
  /** Alt text for accessibility */
  alt?: string;
  /** Additional className for container */
  className?: string;
  /** Width of container (CSS value or Tailwind class) */
  width?: string;
  /** Height of container (CSS value or Tailwind class) */
  height?: string;
  /** Fallback image when no render data */
  fallbackImageUrl?: string;
  /** Config for rebuilding render if snapshot missing */
  config?: Partial<VerandaConfig>;
}

/**
 * Build render snapshot from config (fallback when snapshot missing)
 */
function buildFallbackRender(config: Partial<VerandaConfig>): { baseImageUrl: string; overlayUrls: string[] } {
  const visualConfig: VerandaVisualizationConfig = {
    color: config.color || config.kleur,
    daktype: config.daktype,
    goot: config.goot,
    zijwand_links: config.zijwand_links,
    zijwand_rechts: config.zijwand_rechts,
    voorzijde: config.voorzijde,
    verlichting: config.verlichting,
  };
  return buildRenderSnapshot(visualConfig);
}

const ConfigPreviewImage: React.FC<ConfigPreviewImageProps> = ({
  baseImageUrl,
  overlayUrls,
  alt = 'Product preview',
  className = '',
  width,
  height,
  fallbackImageUrl,
  config,
}) => {
  // Compute render data (use props or rebuild from config as fallback)
  const renderData = useMemo(() => {
    // If we have base image URL, use provided data
    if (baseImageUrl) {
      return { baseImageUrl, overlayUrls: overlayUrls || [] };
    }
    
    // If config provided, rebuild render snapshot
    if (config && (config.color || config.kleur || config.daktype)) {
      return buildFallbackRender(config);
    }
    
    // No render data available
    return null;
  }, [baseImageUrl, overlayUrls, config]);

  // Determine what to render
  const hasValidRender = renderData && renderData.baseImageUrl;
  const effectiveFallback = fallbackImageUrl || FALLBACK_IMAGE;

  // Container styles
  const containerClasses = [
    'relative overflow-hidden bg-gray-50',
    width || 'w-full',
    height || 'h-full',
    className,
  ].filter(Boolean).join(' ');

  // If no render data, show fallback image
  if (!hasValidRender) {
    return (
      <div className={containerClasses}>
        <img
          src={effectiveFallback}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {/* Base image */}
      <img
        src={renderData.baseImageUrl}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-contain"
        style={{ zIndex: 0 }}
      />
      
      {/* Overlay images (stacked in order) */}
      {renderData.overlayUrls.map((url, index) => (
        <img
          key={`${url}-${index}`}
          src={url}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-contain"
          style={{ zIndex: (index + 1) * 10 }}
        />
      ))}
    </div>
  );
};

export default ConfigPreviewImage;

/**
 * Helper component for cart items with built-in size presets
 */
export const CartItemPreview: React.FC<{
  render?: { baseImageUrl: string; overlayUrls: string[] };
  config?: Partial<VerandaConfig>;
  fallbackImageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ render, config, fallbackImageUrl, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  };

  return (
    <ConfigPreviewImage
      baseImageUrl={render?.baseImageUrl}
      overlayUrls={render?.overlayUrls}
      config={config}
      fallbackImageUrl={fallbackImageUrl}
      className={`rounded-lg border border-gray-100 ${sizeClasses[size]} ${className}`}
      alt="Product configuratie"
    />
  );
};
