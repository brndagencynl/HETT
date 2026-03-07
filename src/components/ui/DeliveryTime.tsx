import React from 'react';
import { Truck } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  DeliveryTime — unified delivery label used across the site         */
/* ------------------------------------------------------------------ */

export interface DeliveryTimeProps {
    /** The delivery label text, e.g. "1-2 weken" or "5-10 werkdagen". */
    label: string;
    /** Additional CSS classes on the root element. */
    className?: string;
    /** Icon variant (only "truck" is currently used). */
    icon?: 'truck';
    /** Icon size override (default: 14). */
    iconSize?: number;
}

/**
 * Consistent inline delivery-time indicator.
 *
 * Visual: small green Truck icon + muted-green text.
 * Uses the `--success` design-system token for color.
 */
const DeliveryTime: React.FC<DeliveryTimeProps> = ({
    label,
    className = '',
    icon: _icon = 'truck',
    iconSize = 14,
}) => {
    return (
        <span
            className={`inline-flex items-center gap-1.5 text-[13px] font-semibold leading-none ${className}`}
            style={{ color: 'var(--success)' }}
        >
            <Truck size={iconSize} className="flex-shrink-0" />
            <span>{label}</span>
        </span>
    );
};

export default DeliveryTime;
