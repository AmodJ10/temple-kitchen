import { useLocation, NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Package, Store } from 'lucide-react';

const items = [
    { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { path: '/events', label: 'Events', icon: Calendar },
    { path: '/master/sevekaris', label: 'Sevekaris', icon: Users },
    { path: '/master/inventory', label: 'Inventory', icon: Package },
    { path: '/vendors', label: 'Vendors', icon: Store },
];

const BottomNav = () => {
    const location = useLocation();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-bg-card)] border-t border-[var(--color-border)] safe-area-pb">
            <div className="flex items-center justify-around h-16">
                {items.map(({ path, label, icon: Icon }) => {
                    const isActive = location.pathname.startsWith(path);
                    return (
                        <NavLink
                            key={path}
                            to={path}
                            className={`
                flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg min-w-[56px]
                transition-colors duration-200
                ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}
              `}
                        >
                            <Icon size={22} />
                            <span className="text-[10px] font-medium">{label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
