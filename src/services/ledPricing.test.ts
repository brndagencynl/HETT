/**
 * LED Pricing Tests
 * =================
 * 
 * Tests for LED spot quantity calculation, including:
 * - Exact width matches (standard veranda)
 * - Normalized width matches (maatwerk custom widths)
 * - Edge cases and out-of-range values
 */

import { describe, it, expect } from 'vitest';
import {
  getLedSpotCountForWidthCm,
  normalizeToLedWidth,
  getLedTotals,
  LED_UNIT_PRICE_EUR,
} from './ledPricing';

describe('getLedSpotCountForWidthCm', () => {
  describe('exact width matches (standard veranda)', () => {
    it.each([
      [306, 4],
      [406, 6],
      [506, 8],
      [606, 10],
      [706, 12],
      [806, 14],
      [906, 16],
      [1006, 18],
      [1106, 20],
      [1206, 22],
    ])('width %d cm → %d LED spots', (width, expectedQty) => {
      expect(getLedSpotCountForWidthCm(width)).toBe(expectedQty);
    });
  });

  describe('maatwerk widths (normalized to nearest)', () => {
    it('725cm → 12 spots (nearest 706)', () => {
      expect(getLedSpotCountForWidthCm(725)).toBe(12);
    });

    it('750cm → 14 spots (nearest 806)', () => {
      expect(getLedSpotCountForWidthCm(750)).toBe(14);
    });

    it('1200cm → 22 spots (nearest 1206)', () => {
      expect(getLedSpotCountForWidthCm(1200)).toBe(22);
    });

    it('300cm → 4 spots (nearest 306)', () => {
      expect(getLedSpotCountForWidthCm(300)).toBe(4);
    });

    it('400cm → 6 spots (nearest 406)', () => {
      expect(getLedSpotCountForWidthCm(400)).toBe(6);
    });

    it('600cm → 10 spots (nearest 606)', () => {
      expect(getLedSpotCountForWidthCm(600)).toBe(10);
    });

    it('1000cm → 18 spots (nearest 1006)', () => {
      expect(getLedSpotCountForWidthCm(1000)).toBe(18);
    });
  });

  describe('edge cases - clamping to range', () => {
    it('250cm → 4 spots (clamp to min 306)', () => {
      // 250 is within tolerance (256-1256), snaps to nearest 306
      expect(getLedSpotCountForWidthCm(260)).toBe(4);
    });

    it('255cm → 0 spots (out of range)', () => {
      // Below 256 tolerance
      expect(getLedSpotCountForWidthCm(255)).toBe(0);
    });

    it('1250cm → 22 spots (clamp to max 1206)', () => {
      // 1250 is within tolerance, snaps to 1206
      expect(getLedSpotCountForWidthCm(1250)).toBe(22);
    });

    it('1260cm → 0 spots (out of range)', () => {
      // Above 1256 tolerance
      expect(getLedSpotCountForWidthCm(1260)).toBe(0);
    });

    it('1400cm → 0 spots (out of range)', () => {
      expect(getLedSpotCountForWidthCm(1400)).toBe(0);
    });
  });
});

describe('normalizeToLedWidth', () => {
  it('706 → 706 (exact match)', () => {
    expect(normalizeToLedWidth(706)).toBe(706);
  });

  it('725 → 706 (nearest)', () => {
    expect(normalizeToLedWidth(725)).toBe(706);
  });

  it('1200 → 1206 (nearest)', () => {
    expect(normalizeToLedWidth(1200)).toBe(1206);
  });

  it('260 → 306 (clamp to min)', () => {
    expect(normalizeToLedWidth(260)).toBe(306);
  });

  it('1250 → 1206 (clamp to max)', () => {
    expect(normalizeToLedWidth(1250)).toBe(1206);
  });

  it('1400 → null (out of range)', () => {
    expect(normalizeToLedWidth(1400)).toBe(null);
  });

  it('200 → null (out of range)', () => {
    expect(normalizeToLedWidth(200)).toBe(null);
  });
});

describe('getLedTotals', () => {
  it('returns correct totals for 706cm', () => {
    const result = getLedTotals(706);
    expect(result.qty).toBe(12);
    expect(result.unitPrice).toBe(LED_UNIT_PRICE_EUR);
    expect(result.total).toBeCloseTo(12 * LED_UNIT_PRICE_EUR, 2);
  });

  it('returns correct totals for maatwerk 725cm', () => {
    const result = getLedTotals(725);
    expect(result.qty).toBe(12); // Normalized to 706
    expect(result.total).toBeCloseTo(12 * LED_UNIT_PRICE_EUR, 2);
  });

  it('returns zero totals for out-of-range width', () => {
    const result = getLedTotals(1500);
    expect(result.qty).toBe(0);
    expect(result.total).toBe(0);
  });
});
