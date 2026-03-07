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
    admin: '#C4785C',
    user: '#71717A',
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
            animate={{ width: sidebarCollapsed ? 64 : 240 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="hidden md:flex flex-col h-screen sticky top-0 bg-[var(--color-bg-card)] border-r border-[var(--color-border)] z-30"
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 h-14 border-b border-[var(--color-border)]">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xs shrink-0">
                    M
                </div>
                <AnimatePresence>
                    {!sidebarCollapsed && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden">
                            <span className="text-sm font-semibold text-[var(--color-text-primary)] whitespace-nowrap tracking-tight">MSM Kitchen</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
                {allNavItems.map(({ path, label, icon: Icon }) => {
                    const isActive = location.pathname.startsWith(path);
                    return (
                        <NavLink
                            key={path}
                            to={path}
                            className={`
                                flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ease-out relative
                                ${isActive
                                    ? 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] font-medium'
                                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]'
                                }
                            `}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[var(--color-primary)]"
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                />
                            )}
                            <Icon size={18} className="shrink-0" />
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
            <div className="px-2 pb-3 space-y-0.5 border-t border-[var(--color-border)] pt-3">
                {/* User info */}
                {user && (
                    <div className="flex items-center gap-3 px-3 py-2 mb-1">
                        <div
                            className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: ROLE_COLORS[user.role] || ROLE_COLORS.user }}
                        >
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <AnimatePresence>
                            {!sidebarCollapsed && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden min-w-0">
                                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{user.name}</p>
                                    <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                                        {user.role}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                <button
                    onClick={toggleDarkMode}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)] w-full transition-all duration-150"
                >
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    {!sidebarCollapsed && <span>{darkMode ? 'Light' : 'Dark'}</span>}
                </button>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-400 w-full transition-all duration-150"
                >
                    <LogOut size={18} />
                    {!sidebarCollapsed && <span>Logout</span>}
                </button>

                <button
                    onClick={toggleSidebar}
                    className="flex items-center justify-center w-full py-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] transition-all duration-150"
                >
                    {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
