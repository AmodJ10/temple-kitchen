const Badge = ({ children, color = '#A1A1AA', className = '' }) => {
    return (
        <span
            className={`
                inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium
                ${className}
            `}
            style={{
                backgroundColor: `${color}12`,
                color: color,
                border: `1px solid ${color}20`,
            }}
        >
            {children}
        </span>
    );
};

export default Badge;
