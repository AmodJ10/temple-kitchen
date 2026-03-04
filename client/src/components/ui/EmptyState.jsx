import { PackageOpen } from 'lucide-react';

const EmptyState = ({ title = 'No data found', description = '', icon: Icon = PackageOpen, action }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center mb-4">
                <Icon size={28} className="text-[var(--color-text-muted)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-1">{title}</h3>
            {description && <p className="text-sm text-[var(--color-text-muted)] mb-4 max-w-sm">{description}</p>}
            {action && action}
        </div>
    );
};

export default EmptyState;
