/**
 * Unit Tests for Shipping Rules
 * =============================
 * 
 * Test scenarios:
 * - 299km (just within radius) → FREE
 * - 300km (boundary) → FREE
 * - 301km (just beyond) → €299.99
 * - Accessories only → €29.99
 * - Veranda + accessories → Veranda rules apply
 * - Waddeneiland → BLOCKED
 */

import { describe, it, expect } from 'vitest';
import {
  calculateShippingCost,
  classifyCartItem,
  classifyCart,
  isWaddeneiland,
  FREE_SHIPPING_RADIUS_KM,
  VERANDA_BEYOND_RADIUS_CENTS,
  ACCESSORIES_SHIPPING_CENTS,
  type CartItemCategory,
} from './shippingRules';
import type { CartItem } from '../../../types';

// =============================================================================
// HELPER: Create mock cart item
// =============================================================================

function createMockCartItem(overrides: Partial<CartItem & { type?: string }>): CartItem {
  return {
    id: `item-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Test Product',
    price: 100,
    quantity: 1,
    image: 'test.jpg',
    ...overrides,
  } as CartItem;
}

// =============================================================================
// isWaddeneiland() Tests
// =============================================================================

describe('isWaddeneiland', () => {
  it('should detect Texel by postal code', () => {
    expect(isWaddeneiland('1791AB')).toBe(true);
    expect(isWaddeneiland('1791 AB')).toBe(true);
    expect(isWaddeneiland('1795CD')).toBe(true);
  });

  it('should detect Terschelling by postal code', () => {
    expect(isWaddeneiland('8881AA')).toBe(true);
    expect(isWaddeneiland('8885BB')).toBe(true);
  });

  it('should detect Schiermonnikoog by postal code', () => {
    expect(isWaddeneiland('9166AA')).toBe(true);
  });

  it('should detect Waddeneilanden by place name', () => {
    expect(isWaddeneiland('0000AA', 'Texel')).toBe(true);
    expect(isWaddeneiland('0000AA', 'VLIELAND')).toBe(true);
    expect(isWaddeneiland('0000AA', 'terschelling')).toBe(true);
    expect(isWaddeneiland('0000AA', 'Den Burg')).toBe(true);
    expect(isWaddeneiland('0000AA', 'West-Terschelling')).toBe(true);
  });

  it('should NOT detect mainland addresses', () => {
    expect(isWaddeneiland('5626DD', 'Eindhoven')).toBe(false);
    expect(isWaddeneiland('1011AA', 'Amsterdam')).toBe(false);
    expect(isWaddeneiland('3011AA', 'Rotterdam')).toBe(false);
    expect(isWaddeneiland('8011AA', 'Zwolle')).toBe(false);
  });

  it('should handle empty/invalid input', () => {
    expect(isWaddeneiland('')).toBe(false);
    expect(isWaddeneiland('', '')).toBe(false);
    expect(isWaddeneiland('invalid')).toBe(false);
  });
});

// =============================================================================
// classifyCartItem() Tests
// =============================================================================

describe('classifyCartItem', () => {
  it('should classify veranda by category', () => {
    const item = createMockCartItem({ category: 'verandas', title: 'My Veranda' });
    expect(classifyCartItem(item)).toBe('veranda');
  });

  it('should classify veranda by handle prefix', () => {
    const item1 = createMockCartItem({ slug: 'veranda-550-300' });
    expect(classifyCartItem(item1)).toBe('veranda');

    const item2 = createMockCartItem({ handle: 'standaard-veranda-classic' });
    expect(classifyCartItem(item2)).toBe('veranda');

    const item3 = createMockCartItem({ slug: 'maatwerk-veranda-xl' });
    expect(classifyCartItem(item3)).toBe('veranda');
  });

  it('should classify veranda by title', () => {
    const item = createMockCartItem({ title: 'Veranda Premium 500x300' });
    expect(classifyCartItem(item)).toBe('veranda');
  });

  it('should classify overkapping as veranda', () => {
    const item1 = createMockCartItem({ slug: 'overkapping-premium' });
    expect(classifyCartItem(item1)).toBe('veranda');

    const item2 = createMockCartItem({ title: 'Glazen Overkapping' });
    expect(classifyCartItem(item2)).toBe('veranda');
  });

  it('should classify accessories by default', () => {
    const item = createMockCartItem({ slug: 'led-spots-set', title: 'LED Spots 5-pack' });
    expect(classifyCartItem(item)).toBe('accessoire');
  });

  it('should classify non-veranda items as accessories', () => {
    const item1 = createMockCartItem({ category: 'accessoires' as any });
    expect(classifyCartItem(item1)).toBe('accessoire');

    const item2 = createMockCartItem({ slug: 'heater-3000w' });
    expect(classifyCartItem(item2)).toBe('accessoire');

    const item3 = createMockCartItem({ slug: 'zonwering-screen' });
    expect(classifyCartItem(item3)).toBe('accessoire');
  });
});

// =============================================================================
// classifyCart() Tests
// =============================================================================

describe('classifyCart', () => {
  it('should detect cart with only verandas', () => {
    const items = [
      createMockCartItem({ category: 'verandas', title: 'Veranda 1' }),
      createMockCartItem({ slug: 'veranda-xl' }),
    ];
    const result = classifyCart(items);
    
    expect(result.hasVeranda).toBe(true);
    expect(result.hasAccessoires).toBe(false);
    expect(result.verandaItems).toHaveLength(2);
    expect(result.accessoireItems).toHaveLength(0);
  });

  it('should detect cart with only accessories', () => {
    const items = [
      createMockCartItem({ slug: 'led-spots', title: 'LED Spots' }),
      createMockCartItem({ slug: 'heater-3000w', title: 'Heater' }),
    ];
    const result = classifyCart(items);
    
    expect(result.hasVeranda).toBe(false);
    expect(result.hasAccessoires).toBe(true);
    expect(result.verandaItems).toHaveLength(0);
    expect(result.accessoireItems).toHaveLength(2);
  });

  it('should detect mixed cart', () => {
    const items = [
      createMockCartItem({ category: 'verandas', title: 'Veranda Premium' }),
      createMockCartItem({ slug: 'led-spots', title: 'LED Spots' }),
    ];
    const result = classifyCart(items);
    
    expect(result.hasVeranda).toBe(true);
    expect(result.hasAccessoires).toBe(true);
    expect(result.verandaItems).toHaveLength(1);
    expect(result.accessoireItems).toHaveLength(1);
  });

  it('should ignore shipping line items', () => {
    const items = [
      createMockCartItem({ id: '__shipping_line__', title: 'Shipping' }),
      createMockCartItem({ category: 'verandas', title: 'Veranda' }),
    ];
    const result = classifyCart(items);
    
    expect(result.verandaItems).toHaveLength(1);
    expect(result.accessoireItems).toHaveLength(0);
  });
});

// =============================================================================
// calculateShippingCost() Tests - Core Logic
// =============================================================================

describe('calculateShippingCost', () => {
  // --- Veranda shipping tests ---
  
  describe('Veranda within 300km radius', () => {
    it('should be FREE at 0km', () => {
      const result = calculateShippingCost(true, 0, false);
      expect(result.type).toBe('free');
      expect(result.costCents).toBe(0);
      expect(result.blocked).toBe(false);
    });

    it('should be FREE at 100km', () => {
      const result = calculateShippingCost(true, 100, false);
      expect(result.type).toBe('free');
      expect(result.costCents).toBe(0);
    });

    it('should be FREE at 299km (just within radius)', () => {
      const result = calculateShippingCost(true, 299, false);
      expect(result.type).toBe('free');
      expect(result.costCents).toBe(0);
      expect(result.distanceKm).toBe(299);
    });

    it('should be FREE at exactly 300km (boundary)', () => {
      const result = calculateShippingCost(true, 300, false);
      expect(result.type).toBe('free');
      expect(result.costCents).toBe(0);
      expect(result.distanceKm).toBe(300);
    });
  });

  describe('Veranda beyond 300km radius', () => {
    it('should charge €299.99 at 301km (just beyond radius)', () => {
      const result = calculateShippingCost(true, 301, false);
      expect(result.type).toBe('veranda_flat');
      expect(result.costCents).toBe(VERANDA_BEYOND_RADIUS_CENTS);
      expect(result.costEur).toBe(299.99);
      expect(result.distanceKm).toBe(301);
    });

    it('should charge €299.99 at 500km', () => {
      const result = calculateShippingCost(true, 500, false);
      expect(result.type).toBe('veranda_flat');
      expect(result.costCents).toBe(29999);
    });

    it('should charge €299.99 at 1000km', () => {
      const result = calculateShippingCost(true, 1000, false);
      expect(result.type).toBe('veranda_flat');
      expect(result.costCents).toBe(29999);
    });
  });

  // --- Accessories only tests ---

  describe('Accessories only (no veranda)', () => {
    it('should charge €29.99 fixed regardless of distance', () => {
      const result = calculateShippingCost(false, 100, false);
      expect(result.type).toBe('accessories');
      expect(result.costCents).toBe(ACCESSORIES_SHIPPING_CENTS);
      expect(result.costEur).toBe(29.99);
    });

    it('should charge €29.99 even with null distance', () => {
      const result = calculateShippingCost(false, null, false);
      expect(result.type).toBe('accessories');
      expect(result.costCents).toBe(2999);
    });

    it('should charge €29.99 at any distance', () => {
      expect(calculateShippingCost(false, 0, false).costCents).toBe(2999);
      expect(calculateShippingCost(false, 50, false).costCents).toBe(2999);
      expect(calculateShippingCost(false, 300, false).costCents).toBe(2999);
      expect(calculateShippingCost(false, 500, false).costCents).toBe(2999);
    });
  });

  // --- Waddeneilanden blocked tests ---

  describe('Waddeneilanden (blocked)', () => {
    it('should block veranda delivery to Waddeneilanden', () => {
      const result = calculateShippingCost(true, 150, true);
      expect(result.type).toBe('blocked');
      expect(result.blocked).toBe(true);
      expect(result.costCents).toBe(0);
      expect(result.blockReason).toContain('Waddeneilanden');
    });

    it('should block accessories delivery to Waddeneilanden', () => {
      const result = calculateShippingCost(false, 150, true);
      expect(result.type).toBe('blocked');
      expect(result.blocked).toBe(true);
    });

    it('should block even when distance is within radius', () => {
      const result = calculateShippingCost(true, 100, true);
      expect(result.blocked).toBe(true);
    });
  });

  // --- Mixed cart tests ---

  describe('Mixed cart (veranda + accessories)', () => {
    it('should apply veranda rules when cart has both', () => {
      // hasVeranda = true means veranda rules apply
      const result = calculateShippingCost(true, 250, false);
      expect(result.type).toBe('free');
      expect(result.costCents).toBe(0);
    });

    it('should charge €299.99 for mixed cart beyond radius', () => {
      const result = calculateShippingCost(true, 400, false);
      expect(result.type).toBe('veranda_flat');
      expect(result.costCents).toBe(29999);
    });
  });

  // --- Edge cases ---

  describe('Edge cases', () => {
    it('should handle null distance for veranda (awaiting calculation)', () => {
      const result = calculateShippingCost(true, null, false);
      expect(result.type).toBe('free');
      expect(result.distanceKm).toBeNull();
      expect(result.description).toContain('berekend');
    });

    it('should handle distance at exact boundary (300km)', () => {
      const result = calculateShippingCost(true, FREE_SHIPPING_RADIUS_KM, false);
      expect(result.type).toBe('free');
      expect(result.costCents).toBe(0);
    });

    it('should handle distance just over boundary (300.01km)', () => {
      const result = calculateShippingCost(true, 300.01, false);
      expect(result.type).toBe('veranda_flat');
      expect(result.costCents).toBe(29999);
    });
  });
});

// =============================================================================
// Integration scenario tests
// =============================================================================

describe('Shipping Scenarios (Integration)', () => {
  it('Scenario: Veranda order to Eindhoven (0km) → FREE', () => {
    const result = calculateShippingCost(true, 0, false);
    expect(result.costEur).toBe(0);
    expect(result.type).toBe('free');
  });

  it('Scenario: Veranda order to Amsterdam (~120km) → FREE', () => {
    const result = calculateShippingCost(true, 120, false);
    expect(result.costEur).toBe(0);
    expect(result.type).toBe('free');
  });

  it('Scenario: Veranda order to Brussels (~137km) → FREE', () => {
    const result = calculateShippingCost(true, 137, false);
    expect(result.costEur).toBe(0);
    expect(result.type).toBe('free');
  });

  it('Scenario: Veranda order to Paris (~450km) → €299.99', () => {
    const result = calculateShippingCost(true, 450, false);
    expect(result.costEur).toBe(299.99);
    expect(result.type).toBe('veranda_flat');
  });

  it('Scenario: Veranda order to Texel → BLOCKED', () => {
    const isBlocked = isWaddeneiland('1791AB', 'Texel');
    const result = calculateShippingCost(true, 200, isBlocked);
    expect(result.blocked).toBe(true);
    expect(result.type).toBe('blocked');
  });

  it('Scenario: LED spots only to Amsterdam → €29.99', () => {
    const result = calculateShippingCost(false, 120, false);
    expect(result.costEur).toBe(29.99);
    expect(result.type).toBe('accessories');
  });

  it('Scenario: Veranda + heater to Rotterdam (~80km) → FREE', () => {
    // Mixed cart uses veranda rules
    const result = calculateShippingCost(true, 80, false);
    expect(result.costEur).toBe(0);
    expect(result.type).toBe('free');
  });

  it('Scenario: Veranda + accessories to Berlin (~650km) → €299.99', () => {
    const result = calculateShippingCost(true, 650, false);
    expect(result.costEur).toBe(299.99);
    expect(result.type).toBe('veranda_flat');
  });
});
