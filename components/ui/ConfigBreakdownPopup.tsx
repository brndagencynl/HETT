import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from './button';
import { Card } from './card';
import { formatMoney } from '../../src/pricing/pricingHelpers';

const MotionDiv = motion.div as any;

type NormalizedRow = {
  label: string;
  amount: number;
};

export type NormalizedBreakdown = {
  basePrice: number;
  rows: NormalizedRow[];
  optionsTotal: number;
  grandTotal: number;
};

/**
 * Detect if a cart item belongs to a configurable category (veranda or sandwichpanelen).
 * Applies multiple fallbacks per requirements.
 */
export function isConfigurableCategory(item: any): boolean {
  const possible = [
    item?.categorySlug,
    item?.category,
    item?.product?.category,
    ...(Array.isArray(item?.product?.categories) ? item.product.categories : []),
  ].filter(Boolean);

  const hasExplicit = possible.some((c) => {
    if (typeof c !== 'string') return false;
    const val = c.toLowerCase();
    return val.includes('veranda') || val.includes('sandwich');
  });

  if (hasExplicit) return true;

  // Fallback: check title heuristics
  const title = item?.title as string | undefined;
  if (title) {
    const lower = title.toLowerCase();
    if (lower.includes('hett veranda') || lower.includes('sandwichpaneel')) return true;
  }

  // Last resort: log once and return false (still safe)
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug('[ConfigModal] uncertain category', { id: item?.id, possible });
  }
  return false;
}

/**
 * Detect if a cart item is specifically a VERANDA (not sandwichpanelen).
 * Used for showing the edit button - only verandas can be reconfigured.
 */
export function isVerandaCategory(item: any): boolean {
  const possible = [
    item?.categorySlug,
    item?.category,
    item?.product?.category,
    item?.config?.category, // From ProductConfig
    ...(Array.isArray(item?.product?.categories) ? item.product.categories : []),
  ].filter(Boolean);

  const hasVeranda = possible.some((c) => {
    if (typeof c !== 'string') return false;
    const val = c.toLowerCase();
    return val.includes('veranda');
  });

  if (hasVeranda) return true;

  // Check if it's a maatwerk veranda
  if (item?.maatwerkPayload?.type === 'maatwerk_veranda') return true;
  if (item?.config?.category === 'maatwerk_veranda') return true;

  // Fallback: check title heuristics (only for veranda, exclude sandwichpaneel)
  const title = item?.title as string | undefined;
  if (title) {
    const lower = title.toLowerCase();
    if (lower.includes('hett veranda') || lower.includes('maatwerk veranda') || (lower.includes('veranda') && !lower.includes('sandwich'))) return true;
  }

  return false;
}

/**
 * Check if an item is a maatwerk veranda (custom configured, not tied to product)
 */
export function isMaatwerkVerandaItem(item: any): boolean {
  return item?.maatwerkPayload?.type === 'maatwerk_veranda' || item?.config?.category === 'maatwerk_veranda';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function normalizeBreakdown(breakdown: unknown): NormalizedBreakdown | null {
  if (!breakdown) return null;

  // 0) Cart item with priceBreakdown property - extract and normalize it
  if (isRecord(breakdown) && 'priceBreakdown' in breakdown && breakdown.priceBreakdown) {
    const result = normalizeBreakdown(breakdown.priceBreakdown);
    if (result) return result;
  }

  // 0b) Maatwerk veranda payload: { maatwerkPayload: MaatwerkCartPayload }
  if (isRecord(breakdown) && 'maatwerkPayload' in breakdown && isRecord(breakdown.maatwerkPayload)) {
    const payload = breakdown.maatwerkPayload as any;
    if (payload.type === 'maatwerk_veranda' && payload.priceBreakdown) {
      const pb = payload.priceBreakdown;
      const basePrice = toNumber(pb.basePrice);
      const optionsTotal = toNumber(pb.optionsTotal);
      const grandTotal = toNumber(pb.grandTotal);
      
      if (basePrice !== null && optionsTotal !== null && grandTotal !== null) {
        const sizeLabel = payload.size ? `Afmeting: ${payload.size.width}×${payload.size.depth}cm` : '';
        const rows: NormalizedRow[] = [];
        
        // Add size as first row if available
        if (sizeLabel) {
          rows.push({ label: sizeLabel, amount: 0 });
        }
        
        // Add selection rows
        if (Array.isArray(pb.selections)) {
          for (const sel of pb.selections) {
            const label = sel.groupLabel && sel.choiceLabel 
              ? `${sel.groupLabel}: ${sel.choiceLabel}` 
              : (sel.choiceLabel || sel.groupLabel || 'Optie');
            const amount = toNumber(sel.price) ?? 0;
            rows.push({ label, amount });
          }
        }
        
        return { basePrice, rows, optionsTotal, grandTotal };
      }
    }
  }

  // 1) New cart payload shape: { pricing: { breakdown: PriceBreakdown } }
  if (isRecord(breakdown) && isRecord(breakdown.breakdown)) {
    return normalizeBreakdown(breakdown.breakdown);
  }

  // 2) pricingHelpers PriceBreakdown: { base: { amount }, rows[], optionsTotal, total }
  if (isRecord(breakdown) && isRecord(breakdown.base) && Array.isArray(breakdown.rows)) {
    const baseAmount = toNumber((breakdown.base as any).amount);
    const optionsTotal = toNumber((breakdown as any).optionsTotal);
    const total = toNumber((breakdown as any).total);
    if (baseAmount === null || optionsTotal === null || total === null) return null;

    const rows: NormalizedRow[] = (breakdown.rows as any[])
      .map((r) => {
        const groupLabel = typeof r?.groupLabel === 'string' ? r.groupLabel : '';
        const choiceLabel = typeof r?.choiceLabel === 'string' ? r.choiceLabel : '';
        const price = toNumber(r?.price);
        if (price === null) return null;

        const label = groupLabel && choiceLabel ? `${groupLabel}: ${choiceLabel}` : (r?.label ?? choiceLabel ?? groupLabel ?? 'Optie');
        return { label: String(label), amount: price };
      })
      .filter(Boolean) as NormalizedRow[];

    return {
      basePrice: baseAmount,
      rows,
      optionsTotal,
      grandTotal: total,
    };
  }

  // 3) verandapricing.ts result: { basePrice, items[], optionsTotal, grandTotal }
  // Items can have either 'price' or 'amount' property
  if (isRecord(breakdown) && Array.isArray((breakdown as any).items)) {
    const basePrice = toNumber((breakdown as any).basePrice);
    const optionsTotal = toNumber((breakdown as any).optionsTotal);
    const grandTotal = toNumber((breakdown as any).grandTotal);
    if (basePrice === null || optionsTotal === null || grandTotal === null) return null;

    const rows: NormalizedRow[] = ((breakdown as any).items as any[])
      .map((it) => {
        // Support both 'price' and 'amount' property names
        const price = toNumber(it?.price) ?? toNumber(it?.amount);
        if (price === null) return null;

        const groupLabel = typeof it?.groupLabel === 'string' ? it.groupLabel : '';
        const choiceLabel = typeof it?.choiceLabel === 'string' ? it.choiceLabel : '';
        const label = groupLabel && choiceLabel ? `${groupLabel}: ${choiceLabel}` : (it?.label ?? it?.choiceLabel ?? it?.groupLabel ?? 'Optie');

        return { label: String(label), amount: price };
      })
      .filter(Boolean) as NormalizedRow[];

    return { basePrice, rows, optionsTotal, grandTotal };
  }

  // 4) lib/cart payload-ish: { basePrice, priceLines[], optionsTotal, totalPrice }
  if (isRecord(breakdown) && Array.isArray((breakdown as any).priceLines)) {
    const basePrice = toNumber((breakdown as any).basePrice);
    const optionsTotal = toNumber((breakdown as any).optionsTotal);
    const grandTotal = toNumber((breakdown as any).totalPrice);
    if (basePrice === null || optionsTotal === null || grandTotal === null) return null;

    const rows: NormalizedRow[] = ((breakdown as any).priceLines as any[])
      .map((pl) => {
        const amount = toNumber(pl?.amount);
        if (amount === null) return null;
        const label = pl?.value ? `${pl.label}: ${pl.value}` : (pl?.label ?? 'Optie');
        return { label: String(label), amount };
      })
      .filter(Boolean) as NormalizedRow[];

    return { basePrice, rows, optionsTotal, grandTotal };
  }

  // 5) CartItem with details[] array - build rows from details
  if (isRecord(breakdown) && Array.isArray((breakdown as any).details)) {
    const basePrice = toNumber((breakdown as any).price) ?? 0;
    const grandTotal = toNumber((breakdown as any).totalPrice) ?? basePrice;
    const optionsTotal = grandTotal - basePrice;

    const rows: NormalizedRow[] = ((breakdown as any).details as any[])
      .map((d) => {
        const label = d?.label ?? 'Optie';
        const value = d?.value ?? '';
        return { label: `${label}: ${value}`, amount: 0 };
      })
      .filter(Boolean) as NormalizedRow[];

    if (rows.length > 0) {
      return { basePrice, rows, optionsTotal, grandTotal };
    }
  }

  // 6) CartItem with config.data object - build rows from config
  if (isRecord(breakdown) && isRecord((breakdown as any).config) && isRecord((breakdown as any).config?.data)) {
    const basePrice = toNumber((breakdown as any).price) ?? 0;
    const grandTotal = toNumber((breakdown as any).totalPrice) ?? basePrice;
    const optionsTotal = grandTotal - basePrice;
    const configData = (breakdown as any).config.data as Record<string, unknown>;

    const labelMap: Record<string, string> = {
      daktype: 'Daktype',
      voorzijde: 'Voorzijde',
      zijwand_links: 'Zijwand links',
      zijwand_rechts: 'Zijwand rechts',
      goot: 'Goot',
      verlichting: 'Verlichting',
    };

    const rows: NormalizedRow[] = Object.entries(configData)
      .filter(([_, v]) => v !== undefined && v !== null && v !== 'geen' && v !== false)
      .map(([key, value]) => ({
        label: `${labelMap[key] || key}: ${value === true ? 'Ja' : String(value)}`,
        amount: 0,
      }));

    if (rows.length > 0 || grandTotal > 0) {
      return { basePrice, rows, optionsTotal, grandTotal };
    }
  }

  return null;
}

function extractBaseAndTotal(breakdown: unknown): { basePrice?: number; grandTotal?: number } {
  if (!breakdown) return {};
  if (isRecord(breakdown)) {
    const asAny: any = breakdown;

    // Try multiple possible property names for base price
    const basePrice = toNumber(asAny.basePrice) 
      ?? toNumber(asAny?.base?.amount) 
      ?? toNumber(asAny.price);
    
    // Try multiple possible property names for total
    const grandTotal = toNumber(asAny.grandTotal) 
      ?? toNumber(asAny.total) 
      ?? toNumber(asAny.totalPrice);

    return { basePrice: basePrice ?? undefined, grandTotal: grandTotal ?? undefined };
  }
  return {};
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();

    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  return isMobile;
}

export function getCartItemPriceBreakdown(item: unknown): NormalizedBreakdown | null {
  if (!isRecord(item)) return null;

  // Preferred: item.priceBreakdown
  if ('priceBreakdown' in item) {
    const normalized = normalizeBreakdown((item as any).priceBreakdown);
    if (normalized) return normalized;
  }

  // Also accept: item.pricing.breakdown
  if (isRecord((item as any).pricing) && 'breakdown' in (item as any).pricing) {
    const normalized = normalizeBreakdown((item as any).pricing);
    if (normalized) return normalized;
  }

  // Also accept: item itself already matches (rare)
  return normalizeBreakdown(item);
}

export default function ConfigBreakdownPopup({
  open,
  onOpenChange,
  productTitle,
  breakdown,
  debugId,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  productTitle: string;
  breakdown: unknown;
  debugId?: string;
}) {
  const isMobile = useIsMobile();

  const normalized = useMemo(() => normalizeBreakdown(breakdown), [breakdown]);
  const fallbackNumbers = useMemo(() => extractBaseAndTotal(breakdown), [breakdown]);

  useEffect(() => {
    if (!open) return;
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug('[ConfigModal]', { id: debugId ?? productTitle, hasBreakdown: Boolean(normalized) });
    }
  }, [open, normalized, debugId, productTitle]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const content = (
    <AnimatePresence>
      {open ? (
        <>
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[120]"
          />

          {isMobile ? (
            <MotionDiv
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed inset-x-0 bottom-0 z-[121]"
            >
              <Card padding="wide" className="max-h-[85vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase tracking-wide text-gray-500">Configuratie</div>
                    <h3 className="text-lg font-black text-hett-dark mt-1">{productTitle}</h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-gray-500">
                    <X size={18} />
                  </Button>
                </div>

                <div className="space-y-3">
                  {normalized ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-gray-700">Basisprijs</span>
                        <span className="font-black text-hett-dark">{formatMoney(normalized.basePrice)}</span>
                      </div>

                      <div className="hr" />

                      <div className="space-y-2">
                        {normalized.rows.map((r, i) => (
                          <div key={i} className="flex justify-between gap-4 text-sm">
                            <span className="text-gray-600 font-medium">{r.label}</span>
                            <span className="text-hett-dark font-bold">{formatMoney(r.amount)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="hr" />

                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-gray-700">Opties totaal</span>
                        <span className="font-black text-hett-dark">{formatMoney(normalized.optionsTotal)}</span>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-end">
                          <span className="text-lg font-black text-gray-800">Totaal</span>
                          <span className="text-2xl font-black text-hett-dark">{formatMoney(normalized.grandTotal)}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 font-medium">Configuratie details (nog niet beschikbaar)</p>
                      {fallbackNumbers.basePrice !== undefined ? (
                        <div className="flex justify-between text-sm">
                          <span className="font-bold text-gray-700">Basisprijs</span>
                          <span className="font-black text-hett-dark">{formatMoney(fallbackNumbers.basePrice)}</span>
                        </div>
                      ) : null}
                      {fallbackNumbers.grandTotal !== undefined ? (
                        <div className="flex justify-between text-sm">
                          <span className="font-bold text-gray-700">Totaal</span>
                          <span className="font-black text-hett-dark">{formatMoney(fallbackNumbers.grandTotal)}</span>
                        </div>
                      ) : null}
                    </div>
                  )}

                  <Button variant="primary" size="lg" className="w-full" onClick={() => onOpenChange(false)}>
                    Sluiten
                  </Button>
                </div>
              </Card>
            </MotionDiv>
          ) : (
            <MotionDiv
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.16 }}
              className="fixed inset-0 z-[121] flex items-center justify-center p-4"
              onClick={() => onOpenChange(false)}
            >
              <div className="w-full max-w-[720px]" onClick={(e) => e.stopPropagation()}>
                <Card padding="wide" className="max-h-[80vh] overflow-y-auto">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-wide text-gray-500">Configuratie</div>
                      <h3 className="text-2xl font-black text-hett-dark mt-1">{productTitle}</h3>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-gray-500">
                      <X size={18} />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {normalized ? (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="font-bold text-gray-700">Basisprijs</span>
                          <span className="font-black text-hett-dark">{formatMoney(normalized.basePrice)}</span>
                        </div>

                        <div className="hr" />

                        <div className="space-y-2">
                          {normalized.rows.map((r, i) => (
                            <div key={i} className="flex justify-between gap-6 text-sm">
                              <span className="text-gray-600 font-medium">{r.label}</span>
                              <span className="text-hett-dark font-bold">{formatMoney(r.amount)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="hr" />

                        <div className="flex justify-between text-sm">
                          <span className="font-bold text-gray-700">Opties totaal</span>
                          <span className="font-black text-hett-dark">{formatMoney(normalized.optionsTotal)}</span>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                          <div className="flex justify-between items-end">
                            <span className="text-lg font-black text-gray-800">Totaal</span>
                            <span className="text-3xl font-black text-hett-dark">{formatMoney(normalized.grandTotal)}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 font-medium">Configuratie details (nog niet beschikbaar)</p>
                        {fallbackNumbers.basePrice !== undefined ? (
                          <div className="flex justify-between text-sm">
                            <span className="font-bold text-gray-700">Basisprijs</span>
                            <span className="font-black text-hett-dark">{formatMoney(fallbackNumbers.basePrice)}</span>
                          </div>
                        ) : null}
                        {fallbackNumbers.grandTotal !== undefined ? (
                          <div className="flex justify-between text-sm">
                            <span className="font-bold text-gray-700">Totaal</span>
                            <span className="font-black text-hett-dark">{formatMoney(fallbackNumbers.grandTotal)}</span>
                          </div>
                        ) : null}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button variant="primary" size="lg" onClick={() => onOpenChange(false)}>
                        Sluiten
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </MotionDiv>
          )}
        </>
      ) : null}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
}
