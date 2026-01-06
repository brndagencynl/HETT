import React from 'react';
import { Minus, Plus } from 'lucide-react';
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
  const dec = () => onChange(normalizeQuantity(String(value - 1), { min, max }));
  const inc = () => onChange(normalizeQuantity(String(value + 1), { min, max }));

  return (
    <div
      className={
        className ||
        'w-full rounded-md border border-gray-200 bg-gray-50 overflow-hidden flex items-stretch'
      }
      onMouseDown={(e) => {
        // Allow focus/drag inside, but don't let the parent Link handle it.
        e.stopPropagation();
      }}
      onClick={(e) => {
        // Prevent Link navigation when clicking inside the selector.
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          dec();
        }}
        className="w-8 sm:w-9 flex items-center justify-center text-hett-dark hover:bg-gray-100 transition-colors"
        aria-label="Aantal verlagen"
      >
        <Minus size={16} />
      </button>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onMouseDown={(e) => {
          // Keep input focus working, but don't bubble to Link.
          e.stopPropagation();
        }}
        onClick={(e) => {
          // Clicking the input should not navigate the Link.
          e.preventDefault();
          e.stopPropagation();
        }}
        onFocus={(e) => {
          e.stopPropagation();
        }}
        onChange={(e) => onChange(normalizeQuantity(e.target.value, { min, max }))}
        onBlur={(e) => onChange(normalizeQuantity(e.target.value, { min, max }))}
        className="flex-1 min-w-0 bg-transparent outline-none text-center font-bold text-[11px] sm:text-sm py-2 sm:py-3"
        aria-label="Aantal"
      />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          inc();
        }}
        className="w-8 sm:w-9 flex items-center justify-center text-hett-dark hover:bg-gray-100 transition-colors"
        aria-label="Aantal verhogen"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

export default QuantitySelector;
