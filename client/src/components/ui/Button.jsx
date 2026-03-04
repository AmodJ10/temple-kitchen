import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const variants = {
    primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white',
    secondary: 'bg-transparent border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-bg-secondary)]',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    ghost: 'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]',
    success: 'bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white',
};

const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
};

const Button = forwardRef(({ variant = 'primary', size = 'md', children, className = '', disabled, loading, ...props }, ref) => {
    return (
        <motion.button
            ref={ref}
            whileTap={{ scale: 0.95 }}
            className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-xl
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
