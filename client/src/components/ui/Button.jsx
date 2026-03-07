import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const variants = {
    primary: 'bg-[#F5F4F0] text-[#161616] hover:bg-[#E8E7E3] dark:bg-[#F5F4F0] dark:text-[#161616] dark:hover:bg-[#E8E7E3]',
    secondary: 'bg-transparent border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]',
    danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20',
    ghost: 'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]',
    success: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20',
};

const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
};

const Button = forwardRef(({ variant = 'primary', size = 'md', children, className = '', disabled, loading, ...props }, ref) => {
    return (
        <motion.button
            ref={ref}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
            className={`
                inline-flex items-center justify-center gap-2 font-medium rounded-lg
                transition-all duration-150 ease-out
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]
                disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
                ${variants[variant]} ${sizes[size]} ${className}
            `}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            )}
            {children}
        </motion.button>
    );
});

Button.displayName = 'Button';
export default Button;
