import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-[var(--text-xs)] font-medium text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={`
                    w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)]
                    bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]
                    placeholder:text-[var(--color-text-muted)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]
                    transition-[border-color,box-shadow] duration-[var(--duration-fast)]
                    [transition-timing-function:var(--ease-expo)]
                    text-[var(--text-sm)] min-h-[44px]
                    ${error ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]' : ''}
                    ${className}
                `}
                {...props}
            />
            {error && <p className="text-[var(--color-danger)] text-[var(--text-xs)] mt-1">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';
export default Input;
