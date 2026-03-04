import { forwardRef } from 'react';

const Select = forwardRef(({ label, error, options = [], placeholder = 'Select...', className = '', ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                    {label}
                </label>
            )}
            <select
                ref={ref}
                className={`
          w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)]
          bg-[var(--color-bg-card)] text-[var(--color-text-primary)]
          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
          transition-all duration-200 appearance-none
          ${error ? 'border-red-400 focus:ring-red-400' : ''}
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
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
});

Select.displayName = 'Select';
export default Select;
