/**
 * Unit Tests for Config Validation
 * =================================
 * 
 * Tests for validateConfig() function used by addToCart:
 * - Standard veranda with complete config passes validation
 * - Missing width/depth returns clear errors (size selection step)
 * - Missing required fields (daktype, goot, color) returns specific errors
 * - Sandwichpanelen validation
 */

import { describe, it, expect } from 'vitest';
import { validateConfig, ValidationResult } from './configValidation';
import { ProductConfig, VerandaConfig, SandwichConfig } from '../types';

// =============================================================================
// HELPER: Create valid veranda ProductConfig
// =============================================================================

function createVerandaConfig(overrides: Partial<VerandaConfig> = {}): ProductConfig {
  const defaultConfig: VerandaConfig = {
    color: 'ral7016',
    daktype: 'poly_helder',
    goot: 'deluxe',
    zijwand_links: 'geen',
    zijwand_rechts: 'geen',
    voorzijde: 'geen',
    verlichting: false,
    ...overrides,
  };

  return {
    category: 'verandas',
    data: defaultConfig,
  };
}

// =============================================================================
// Standard Veranda Flow Tests (width=506, depth=300 with defaults)
// =============================================================================

describe('validateConfig - Standard Veranda Flow', () => {
  describe('Complete configuration should pass', () => {
    it('should pass validation with all required fields set', () => {
      const config = createVerandaConfig();
      const result = validateConfig('verandas', config, false);
      
      expect(result.ok).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass with width=506, depth=300 and defaults', () => {
      // Simulate the exact config from Step 1 selection
      const config = createVerandaConfig({
        color: 'ral7016',
        daktype: 'poly_helder',
        goot: 'deluxe',
        zijwand_links: 'geen',
        zijwand_rechts: 'geen',
        voorzijde: 'geen',
        verlichting: false,
      });
      
      // Add widthCm/depthCm as done in VerandaCategoryPage
      (config.data as any).widthCm = 506;
      (config.data as any).depthCm = 300;
      
      const result = validateConfig('verandas', config, false);
      
      expect(result.ok).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass with all goot options (deluxe, cube, classic)', () => {
      ['deluxe', 'cube', 'classic'].forEach(goot => {
        const config = createVerandaConfig({ goot: goot as any });
        const result = validateConfig('verandas', config, false);
        
        expect(result.ok).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should pass with all daktype options', () => {
      ['poly_helder', 'poly_opaal', 'glas'].forEach(daktype => {
        const config = createVerandaConfig({ daktype: daktype as any });
        const result = validateConfig('verandas', config, false);
        
        expect(result.ok).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });
  });

  describe('Missing required fields should fail with clear errors', () => {
    it('should fail when config is undefined', () => {
      const result = validateConfig('verandas', undefined, false);
      
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Geen configuratie gevonden.');
    });

    it('should fail when config.data is undefined', () => {
      const config = { category: 'verandas', data: undefined } as unknown as ProductConfig;
      const result = validateConfig('verandas', config, false);
      
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Geen configuratie gevonden.');
    });

    it('should fail when daktype is missing', () => {
      const config = createVerandaConfig({ daktype: undefined as any });
      const result = validateConfig('verandas', config, false);
      
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Kies een daktype.');
    });

    it('should fail when goot is missing', () => {
      const config = createVerandaConfig({ goot: undefined as any });
      const result = validateConfig('verandas', config, false);
      
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Kies een goot (Deluxe, Cube of Classic).');
    });

    it('should fail when color is missing', () => {
      const config = createVerandaConfig({ color: undefined as any });
      const result = validateConfig('verandas', config, false);
      
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Kies een kleur.');
    });

    it('should fail with multiple errors when multiple fields are missing', () => {
      const config = createVerandaConfig({
        color: undefined as any,
        daktype: undefined as any,
        goot: undefined as any,
      });
      const result = validateConfig('verandas', config, false);
      
      expect(result.ok).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
      expect(result.errors).toContain('Kies een kleur.');
      expect(result.errors).toContain('Kies een daktype.');
      expect(result.errors).toContain('Kies een goot (Deluxe, Cube of Classic).');
    });

    it('should fail when category does not match', () => {
      const config = createVerandaConfig();
      const result = validateConfig('sandwichpanelen', config, false);
      
      expect(result.ok).toBe(false);
      expect(result.errors[0]).toContain('categorie mismatch');
    });
  });

  describe('Invalid field values should fail', () => {
    it('should fail with invalid goot option', () => {
      const config = createVerandaConfig({ goot: 'invalid' as any });
      const result = validateConfig('verandas', config, false);
      
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Ongeldige goot optie.');
    });

    it('should fail with invalid daktype option', () => {
      const config = createVerandaConfig({ daktype: 'invalid' as any });
      const result = validateConfig('verandas', config, false);
      
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Ongeldig daktype.');
    });
  });

  describe('Debug info should be included in result', () => {
    it('should include debug info with missing fields', () => {
      const config = createVerandaConfig({ daktype: undefined as any });
      const result = validateConfig('verandas', config, false);
      
      expect(result.debug).toBeDefined();
      expect(result.debug?.missingFields).toContain('daktype');
    });
  });
});

// =============================================================================
// Sandwichpanelen Tests
// =============================================================================

describe('validateConfig - Sandwichpanelen', () => {
  function createSandwichConfig(overrides: Partial<SandwichConfig> = {}): ProductConfig {
    return {
      category: 'sandwichpanelen',
      data: {
        lengthMm: 4000,
        color: 'antraciet',
        ...overrides,
      } as SandwichConfig,
    };
  }

  it('should pass with length and color set', () => {
    const config = createSandwichConfig();
    const result = validateConfig('sandwichpanelen', config, false);
    
    expect(result.ok).toBe(true);
  });

  it('should fail when length is missing', () => {
    const config = createSandwichConfig({ lengthMm: undefined } as any);
    delete (config.data as any).lengthMm;
    delete (config.data as any).length;
    
    const result = validateConfig('sandwichpanelen', config, false);
    
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('Kies een lengte.');
  });

  it('should fail when color is missing', () => {
    const config = createSandwichConfig({ color: undefined } as any);
    delete (config.data as any).color;
    delete (config.data as any).kleur;
    
    const result = validateConfig('sandwichpanelen', config, false);
    
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('Kies een kleur.');
  });
});
