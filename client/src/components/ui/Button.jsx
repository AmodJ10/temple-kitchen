import { forwardRef } from 'react';

const variants = {
    primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]',
    secondary: 'bg-transparent border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]',
    danger: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)] hover:bg-[var(--color-danger-soft-hover)] border border-[var(--color-danger-border)]',
    ghost: 'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]',
    success: 'bg-[var(--color-success-soft)] text-[var(--color-success)] hover:bg-[var(--color-success-soft-hover)] border border-[var(--color-success-border)]',
    outline: 'bg-transparent border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]',
};

const sizes = {
    sm: 'px-3 py-1.5 text-[var(--text-xs)]',
    md: 'px-4 py-2.5 text-[var(--text-sm)]',
    lg: 'px-5 py-3 text-[var(--text-sm)]',
};

const Button = forwardRef(({ variant = 'primary', size = 'md', children, className = '', disabled, loading, ...props }, ref) => {
    return (
        <button
            ref={ref}
            className={`
                inline-flex items-center justify-center gap-2 font-medium rounded-lg
                transition-[background-color,color,border-color,transform] duration-[var(--duration-fast)]
                [transition-timing-function:var(--ease-expo)]
                active:scale-[0.98]
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
        </button>
    );
});

Button.displayName = 'Button';
export default Button;
