const Badge = ({ children, color = 'oklch(55% 0.01 65)', className = '' }) => {
    return (
        <span
            className={`
                inline-flex items-center px-2 py-0.5 rounded-md text-[var(--text-xs)] font-medium
                ${className}
            `}
            style={{
                backgroundColor: `color-mix(in oklch, ${color} 14%, transparent)`,
                color: color,
            }}
        >
            {children}
        </span>
    );
};

export default Badge;
