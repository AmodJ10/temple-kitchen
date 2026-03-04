const Badge = ({ children, color = '#5B9BD5', className = '' }) => {
    return (
        <span
            className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${className}
      `}
            style={{
                backgroundColor: `${color}18`,
                color: color,
                border: `1px solid ${color}30`,
            }}
        >
            {children}
        </span>
    );
};

export default Badge;
