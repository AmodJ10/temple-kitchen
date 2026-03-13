import { forwardRef } from 'react';

const Select = forwardRef(({ label, error, options = [], placeholder = 'Select...', className = '', ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-[var(--text-xs)] font-medium text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">
                    {label}
                </label>
            )}
            <select
                ref={ref}
                className={`
                    w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)]
                    bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]
                    transition-[border-color,box-shadow] duration-[var(--duration-fast)]
                    [transition-timing-function:var(--ease-expo)]
                    text-[var(--text-sm)] min-h-[44px] appearance-none
                    bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717A%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')]
                    bg-no-repeat bg-[right_0.75rem_center]
                    pr-10
                    ${error ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]' : ''}
                    ${className}
                `}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {error && <p className="text-[var(--color-danger)] text-[var(--text-xs)] mt-1">{error}</p>}
        </div>
    );
});

Select.displayName = 'Select';
export default Select;
