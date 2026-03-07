import { forwardRef } from 'react';

const Select = forwardRef(({ label, error, options = [], placeholder = 'Select...', className = '', ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">
                    {label}
                </label>
            )}
            <select
                ref={ref}
                className={`
                    w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)]
                    bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]
                    focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]
                    transition-all duration-150 ease-out appearance-none text-sm
                    ${error ? 'border-red-400/50 focus:ring-red-400' : ''}
                    ${className}
                `}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
    );
});

Select.displayName = 'Select';
export default Select;
