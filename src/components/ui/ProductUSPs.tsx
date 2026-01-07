import React from 'react';
import { CheckCircle } from 'lucide-react';

type Props = {
  items: string[];
  maxItems?: number;
  className?: string;
};

const ProductUSPs: React.FC<Props> = ({ items, maxItems = 4, className }) => {
  const safeItems = (items ?? [])
    .map((x) => (typeof x === 'string' ? x.trim() : ''))
    .filter(Boolean)
    .slice(0, maxItems);

  if (safeItems.length === 0) return null;

  return (
    <div className={['mt-4 space-y-2', className].filter(Boolean).join(' ')}>
      {safeItems.map((text, index) => (
        <div key={`${index}-${text}`} className="flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="text-hett-muted font-bold leading-snug">{text}</span>
        </div>
      ))}
    </div>
  );
};

export default ProductUSPs;
