import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={`
          w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)]
          bg-[var(--color-bg-card)] text-[var(--color-text-primary)]
          placeholder:text-[var(--color-text-muted)]
          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
          transition-all duration-200
          ${error ? 'border-red-400 focus:ring-red-400' : ''}
          ${className}
        `}
                {...props}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';
export default Input;
