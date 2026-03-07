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
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 8 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className={`
                            relative w-full ${sizes[size]}
                            bg-[var(--color-bg-card)] rounded-xl
                            border border-[var(--color-border)]
                            max-h-[90vh] overflow-y-auto
                            shadow-2xl
                        `}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4">
                            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                                {title}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-md hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] transition-colors duration-150"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="mx-6 border-t border-[var(--color-border)]" />

                        {/* Body */}
                        <div className="px-6 py-4">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
