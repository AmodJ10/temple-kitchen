const PageHeader = ({ title, description, actions, className = '', eyebrow }) => {
    return (
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}>
            <div className="space-y-1.5">
                {eyebrow ? (
                    <p className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                        {eyebrow}
                    </p>
                ) : null}
                <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">{title}</h1>
                {description ? (
                    <p className="text-[var(--color-text-muted)] text-sm mt-1">{description}</p>
                ) : null}
            </div>
            {actions ? <div className="w-full sm:w-auto">{actions}</div> : null}
        </div>
    );
};

export default PageHeader;
