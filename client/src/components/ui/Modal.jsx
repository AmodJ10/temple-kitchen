import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 bg-[oklch(18%_0.01_65_/_60%)]"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 8 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className={`relative ${sizes[size]} w-full bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border)] overflow-hidden z-10`}
                    >
                        {/* Header */}
                        {title && (
                            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
                                <h3 className="text-[var(--text-base)] font-semibold text-[var(--color-text-primary)]">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-[var(--duration-fast)]"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {/* Body */}
                        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
