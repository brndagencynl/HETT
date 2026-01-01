// Single source of truth for money handling (EUR)
// Rule: display always € 1.234,56 (nl-NL) and keep all calculations in cents.

export type MoneyMode = 'cents' | 'euros';

const EUR_FORMATTER = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function normalizeNumericString(input: string): string {
  // Keep digits, separators, minus sign
  const s = input
    .trim()
    .replace(/\s/g, '')
    .replace(/€/g, '')
    .replace(/[^0-9,\.-]/g, '');

  // If both '.' and ',' exist, assume nl-NL: '.' thousands, ',' decimals
  const hasDot = s.includes('.');
  const hasComma = s.includes(',');
  if (hasDot && hasComma) {
    // remove thousands dots
    return s.replace(/\./g, '').replace(',', '.');
  }

  // If only comma exists, treat as decimal separator
  if (!hasDot && hasComma) {
    return s.replace(',', '.');
  }

  // If only dot exists, it might be decimal separator; keep as-is
  return s;
}

function parseToCentsFromString(input: string): number {
  const normalized = normalizeNumericString(input);
  if (!normalized) return 0;

  const negative = normalized.startsWith('-');
  const raw = negative ? normalized.slice(1) : normalized;

  const [intPartRaw, fracPartRaw = ''] = raw.split('.');
  const intPart = (intPartRaw || '0').replace(/^0+(?=\d)/, '');

  const frac = (fracPartRaw + '00').slice(0, 2);

  const cents = Number(intPart || '0') * 100 + Number(frac);
  return negative ? -cents : cents;
}

export function toCents(amount: number | string): number {
  if (typeof amount === 'number') {
    if (!Number.isFinite(amount)) return 0;
    // Convert via string parsing to avoid float * 100 rounding issues.
    return parseToCentsFromString(String(amount));
  }
  return parseToCentsFromString(amount);
}

export function fromCents(cents: number): number {
  if (!Number.isFinite(cents)) return 0;
  return cents / 100;
}

export function formatEUR(amountOrCents: number, mode: MoneyMode = 'euros'): string {
  const euros = mode === 'cents' ? fromCents(amountOrCents) : amountOrCents;
  return EUR_FORMATTER.format(Number.isFinite(euros) ? euros : 0);
}

export function addCents(...cents: number[]): number {
  return cents.reduce((sum, c) => sum + (Number.isFinite(c) ? c : 0), 0);
}

export function mulCents(cents: number, qty: number): number {
  const safeCents = Number.isFinite(cents) ? cents : 0;
  const safeQty = Number.isFinite(qty) ? qty : 0;
  return safeCents * safeQty;
}
