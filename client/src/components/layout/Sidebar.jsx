import { useEffect, useState } from 'react';
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

    // Track mobile breakpoint for drawer vs. width animation behaviour
    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    const handleLogout = async () => {
        try { await authAPI.logout(); } catch { }
        logout();
    };

    const allNavItems = [
        ...navItems,
        ...(isAdmin() ? adminNavItems : []),
    ];

    // On mobile: slide in/out via x-translate (overlay drawer, width stays 240)
    // On desktop: animate width between collapsed (64) and expanded (240)
    const sidebarAnimate = isMobile
        ? { x: sidebarCollapsed ? -240 : 0 }
        : { width: sidebarCollapsed ? 64 : 240 };

    return (
        <>
            {/* Mobile backdrop — tapping it closes the drawer */}
            <AnimatePresence>
                {isMobile && !sidebarCollapsed && (
                    <motion.div
                        key="sidebar-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
                        onClick={toggleSidebar}
                    />
                )}
            </AnimatePresence>

            <motion.aside
                animate={sidebarAnimate}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={
                    isMobile
                        ? 'fixed top-0 left-0 w-60 flex flex-col h-screen bg-[var(--color-bg-card)] border-r border-[var(--color-border)] z-40 overflow-hidden'
                        : 'hidden md:flex flex-col h-screen sticky top-0 bg-[var(--color-bg-card)] border-r border-[var(--color-border)] z-30 overflow-hidden'
                }
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 h-14 border-b border-[var(--color-border)] shrink-0">
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

                {/* Scrollable section: nav + bottom actions */}
                <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
                    {/* Navigation */}
                    <nav className="py-3 px-2 space-y-0.5">
                        {allNavItems.map(({ path, label, icon: Icon }) => {
                            const isActive = location.pathname.startsWith(path);
                            return (
                                <NavLink
                                    key={path}
                                    to={path}
                                    onClick={isMobile ? toggleSidebar : undefined}
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
                                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
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

                    {/* Spacer pushes bottom actions to bottom of scroll area */}
                    <div className="flex-1" />

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
                                            <p className="text-[10px] tracking-wide text-[var(--color-text-muted)] capitalize">
                                                {user.role}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        <button
                            onClick={toggleDarkMode}
                            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)] w-full transition-all duration-150"
                        >
                            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                            {!sidebarCollapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-400 w-full transition-all duration-150"
                        >
                            <LogOut size={18} />
                            {!sidebarCollapsed && <span>Logout</span>}
                        </button>

                        {/* Only show collapse button on desktop */}
                        {!isMobile && (
                            <button
                                onClick={toggleSidebar}
                                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                                className="flex items-center justify-center w-full py-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] transition-all duration-150"
                            >
                                {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                            </button>
                        )}
                    </div>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
