import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { formatEUR } from '../../src/utils/money';

interface ActiveFiltersProps {
    activeBrands: string[];
    onRemoveBrand: (brand: string) => void;
    onClearAll: () => void;
    // Veranda-specific filters
    priceMin?: string;
    priceMax?: string;
    activeWidths?: number[];
    activeDepths?: number[];
    onRemoveWidth?: (w: number) => void;
    onRemoveDepth?: (d: number) => void;
    onClearPrice?: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
    activeBrands,
    onRemoveBrand,
    onClearAll,
    priceMin,
    priceMax,
    activeWidths = [],
    activeDepths = [],
    onRemoveWidth,
    onRemoveDepth,
    onClearPrice,
}) => {
    const hasBrands = activeBrands.length > 0;
    const hasWidths = activeWidths.length > 0;
    const hasDepths = activeDepths.length > 0;
    const hasPrice = (priceMin && priceMin !== '') || (priceMax && priceMax !== '');

    if (!hasBrands && !hasWidths && !hasDepths && !hasPrice) return null;

    return (
        <div className="active-filters">
            <div className="active-filters__scroll-container">
                <div className="active-filters__list">
                    {/* Brand badges */}
                    {activeBrands.map((brand) => (
                        <div key={brand} className="filter-badge">
                            <span className="filter-badge__label">Merk: {brand}</span>
                            <button
                                onClick={() => onRemoveBrand(brand)}
                                className="filter-badge__remove"
                                aria-label={`Verwijder filter ${brand}`}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}

                    {/* Price badge */}
                    {hasPrice && onClearPrice && (
                        <div className="filter-badge">
                            <span className="filter-badge__label">
                                Prijs: {priceMin ? formatEUR(Number(priceMin) * 100, 'cents') : '...'} - {priceMax ? formatEUR(Number(priceMax) * 100, 'cents') : '...'}
                            </span>
                            <button
                                onClick={onClearPrice}
                                className="filter-badge__remove"
                                aria-label="Verwijder prijsfilter"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {/* Width badges */}
                    {activeWidths.map((w) => (
                        <div key={`width-${w}`} className="filter-badge">
                            <span className="filter-badge__label">Breedte: {w} cm</span>
                            <button
                                onClick={() => onRemoveWidth?.(w)}
                                className="filter-badge__remove"
                                aria-label={`Verwijder breedte ${w}`}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}

                    {/* Depth badges */}
                    {activeDepths.map((d) => (
                        <div key={`depth-${d}`} className="filter-badge">
                            <span className="filter-badge__label">Diepte: {d} cm</span>
                            <button
                                onClick={() => onRemoveDepth?.(d)}
                                className="filter-badge__remove"
                                aria-label={`Verwijder diepte ${d}`}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={onClearAll}
                className="clear-filters-btn"
            >
                <RotateCcw size={14} />
                <span>Wis filters</span>
            </button>
        </div>
    );
};

export default ActiveFilters;
