import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Calendar, Users, Package, Store, ChevronLeft,
    ChevronRight, Sun, Moon, LogOut, Shield, UserCog,
} from 'lucide-react';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { authAPI } from '../../api/endpoints';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/events', label: 'Events', icon: Calendar },
    { path: '/master/sevekaris', label: 'Sevekaris', icon: Users },
    { path: '/master/inventory', label: 'Inventory', icon: Package },
    { path: '/vendors', label: 'Vendors', icon: Store },
];

const adminNavItems = [
    { path: '/admin/users', label: 'Users', icon: UserCog },
];

const ROLE_COLORS = {
    engineer: '#8B5CF6',
    admin: '#3B82F6',
    user: '#6B7280',
};

const Sidebar = () => {
    const { sidebarCollapsed, toggleSidebar, darkMode, toggleDarkMode } = useUIStore();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const isAdmin = useAuthStore((s) => s.isAdmin);
    const location = useLocation();

    const handleLogout = async () => {
        try { await authAPI.logout(); } catch { }
        logout();
    };

    const allNavItems = [
        ...navItems,
        ...(isAdmin() ? adminNavItems : []),
    ];

    return (
        <motion.aside
            animate={{ width: sidebarCollapsed ? 64 : 260 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="hidden md:flex flex-col h-screen sticky top-0 bg-[var(--color-bg-card)] border-r border-[var(--color-border)] z-30"
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--color-border)]">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white font-bold text-lg shrink-0">
                    🙏
                </div>
                <AnimatePresence>
                    {!sidebarCollapsed && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden">
                            <span className="font-display text-lg font-semibold text-[var(--color-text-primary)] whitespace-nowrap">Temple Kitchen</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                {allNavItems.map(({ path, label, icon: Icon }) => {
                    const isActive = location.pathname.startsWith(path);
                    return (
                        <NavLink
                            key={path}
                            to={path}
                            className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                                    ? 'bg-[var(--color-bg-secondary)] text-[var(--color-primary)] border-l-[3px] border-[var(--color-primary)]'
                                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]'
                                }
              `}
                        >
                            <Icon size={20} className="shrink-0" />
                            <AnimatePresence>
                                {!sidebarCollapsed && (
                                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="whitespace-nowrap overflow-hidden"
                                    >
                                        {label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="px-2 pb-4 space-y-1 border-t border-[var(--color-border)] pt-4">
                {/* User info */}
                {user && (
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: ROLE_COLORS[user.role] || ROLE_COLORS.user }}
                        >
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <AnimatePresence>
                            {!sidebarCollapsed && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden min-w-0">
                                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{user.name}</p>
                                    <p className="text-xs capitalize" style={{ color: ROLE_COLORS[user.role] || ROLE_COLORS.user }}>
                                        <Shield size={10} className="inline mr-1" />{user.role}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                <button
                    onClick={toggleDarkMode}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] w-full transition-colors"
                >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    {!sidebarCollapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 w-full transition-colors"
                >
                    <LogOut size={20} />
                    {!sidebarCollapsed && <span>Logout</span>}
                </button>

                <button
                    onClick={toggleSidebar}
                    className="flex items-center justify-center w-full py-2 rounded-xl hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] transition-colors"
                >
                    {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
