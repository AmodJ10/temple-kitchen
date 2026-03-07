import { PackageOpen } from 'lucide-react';

const EmptyState = ({ title = 'No data found', description = '', icon: Icon = PackageOpen, action }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-secondary)] flex items-center justify-center mb-4">
                <Icon size={22} className="text-[var(--color-text-muted)]" />
            </div>
            <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-1">{title}</h3>
            {description && <p className="text-xs text-[var(--color-text-muted)] mb-4 max-w-xs">{description}</p>}
            {action && action}
        </div>
    );
};

export default EmptyState;
