export const DEFAULT_QUANTITY = 1;
export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 99;

export function normalizeQuantity(
  input: unknown,
  {
    min = MIN_QUANTITY,
    max = MAX_QUANTITY,
  }: { min?: number; max?: number } = {}
): number {
  const parsed =
    typeof input === 'number'
      ? input
      : typeof input === 'string'
        ? Number.parseInt(input, 10)
        : Number.NaN;

  if (!Number.isFinite(parsed)) return min;

  const integer = Math.trunc(parsed);
  if (integer < min) return min;
  if (integer > max) return max;
  return integer;
}
