import { PackageOpen } from 'lucide-react';

const EmptyState = ({ title = 'No data found', description = '', icon: Icon = PackageOpen, action }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-secondary)] flex items-center justify-center mb-4">
                <Icon size={22} className="text-[var(--color-text-muted)]" />
            </div>
            <h3 className="text-[var(--text-base)] font-medium text-[var(--color-text-primary)] mb-1">{title}</h3>
            {description && (
                <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] max-w-sm">{description}</p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
};

export default EmptyState;
