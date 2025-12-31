import React from 'react';
import { MAX_QUANTITY, MIN_QUANTITY, normalizeQuantity } from '../../src/lib/cart/quantity';

type QuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
};

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  min = MIN_QUANTITY,
  max = MAX_QUANTITY,
  className,
}) => {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      step={1}
      value={value}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onFocus={(e) => e.stopPropagation()}
      onChange={(e) => onChange(normalizeQuantity(e.target.value, { min, max }))}
      onBlur={(e) => onChange(normalizeQuantity(e.target.value, { min, max }))}
      className={
        className ||
        'w-full rounded-md py-2 sm:py-3 text-[11px] sm:text-sm font-bold text-center border border-gray-200 bg-gray-50 outline-none focus:border-hett-primary'
      }
      aria-label="Aantal"
    />
  );
};

export default QuantitySelector;
