const Card = ({ children, className = '', onClick, hoverable = false }) => {
    return (
        <div
            onClick={onClick}
            className={`
                bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border)]
                transition-[border-color,transform] duration-[var(--duration-fast)]
                [transition-timing-function:var(--ease-expo)]
                ${hoverable ? 'hover:border-[var(--color-text-muted)] hover:-translate-y-px' : ''}
                ${onClick ? 'cursor-pointer' : ''}
                ${className}
            `}
        >
            {children}
        </div>
    );
};

export default Card;
