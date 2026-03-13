import { useLocation, NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Package, Store, UserCog } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const items = [
    { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { path: '/events', label: 'Events', icon: Calendar },
    { path: '/master/sevekaris', label: 'Sevekari', icon: Users },
    { path: '/master/inventory', label: 'Inventory', icon: Package },
    { path: '/vendors', label: 'Vendors', icon: Store },
];

const adminItems = [
    { path: '/admin/users', label: 'Users', icon: UserCog },
];

const BottomNav = () => {
    const location = useLocation();
    const isAdmin = useAuthStore(s => s.isAdmin);

    const allItems = [
        ...items,
        ...(isAdmin() ? adminItems : [])
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-bg-card)]/95 backdrop-blur-xl border-t border-[var(--color-border)] safe-area-pb">
            <div className="flex items-center justify-around h-16 px-1">
                {allItems.map(({ path, label, icon: Icon }) => {
                    const isActive = location.pathname.startsWith(path);
                    return (
                        <NavLink
                            key={path}
                            to={path}
                            className={`
                                flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-lg
                                transition-colors duration-[var(--duration-fast)] [transition-timing-function:var(--ease-expo)]
                                min-w-0 min-h-[48px]
                                ${isActive
                                    ? 'text-[var(--color-primary)]'
                                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                                }
                            `}
                        >
                            <Icon size={20} />
                            <span className="text-[10px] font-medium truncate">{label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
