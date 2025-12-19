import React, { useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, SlidersHorizontal } from 'lucide-react';

interface MobileFilterSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: () => void;
    children: React.ReactNode;
}

const MobileFilterSheet: React.FC<MobileFilterSheetProps> = ({
    isOpen,
    onClose,
    onApply,
    children,
}) => {
    const sheetRef = useRef<HTMLDivElement>(null);

    const handleDragEnd = useCallback(
        (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            // Close if dragged down more than 100px or with high velocity
            if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
            }
        },
        [onClose]
    );

    const handleApply = () => {
        onApply();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="bottom-sheet__overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Sheet */}
                    <motion.div
                        ref={sheetRef}
                        className="bottom-sheet__content"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.5 }}
                        onDragEnd={handleDragEnd}
                    >
                        {/* Header */}
                        <div className="bottom-sheet__header">
                            <div className="bottom-sheet__drag-handle" />
                            <div className="bottom-sheet__title">
                                <SlidersHorizontal size={20} />
                                <span>Filters</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="bottom-sheet__close"
                                aria-label="Sluiten"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="bottom-sheet__body">
                            {children}
                        </div>

                        {/* Footer */}
                        <div className="bottom-sheet__footer">
                            <button onClick={handleApply} className="btn btn-primary btn-lg">
                                Filters toepassen
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MobileFilterSheet;
