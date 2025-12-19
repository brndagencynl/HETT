import React from 'react';
import { X, RotateCcw } from 'lucide-react';

interface ActiveFiltersProps {
    activeBrands: string[];
    onRemoveBrand: (brand: string) => void;
    onClearAll: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
    activeBrands,
    onRemoveBrand,
    onClearAll,
}) => {
    if (activeBrands.length === 0) return null;

    return (
        <div className="active-filters">
            <div className="active-filters__scroll-container">
                <div className="active-filters__list">
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
