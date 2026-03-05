import { Menu, Bell, LogOut } from 'lucide-react';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { authAPI } from '../../api/endpoints';

const Topbar = () => {
    const toggleSidebar = useUIStore((s) => s.toggleSidebar);
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    const handleLogout = async () => {
        try { await authAPI.logout(); } catch { }
        logout();
    };

    return (
        <header className="sticky top-0 z-20 bg-[var(--color-bg-card)]/80 backdrop-blur-md border-b border-[var(--color-border)] h-16">
            <div className="flex items-center justify-between h-full px-4 md:px-6">
                {/* Mobile menu toggle */}
                <button
                    onClick={toggleSidebar}
                    className="md:hidden p-2 rounded-xl hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] transition-colors"
                >
                    <Menu size={22} />
                </button>

                {/* Mobile logo */}
                <div className="md:hidden flex items-center gap-2">
                    <span className="text-lg">🙏</span>
                    <span className="font-display font-semibold text-[var(--color-text-primary)]">Temple Kitchen</span>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-3 ml-auto">
                    {/* Notifications */}
                    <button className="p-2 rounded-xl hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] relative transition-colors hidden sm:block">
                        <Bell size={20} />
                    </button>

                    {/* Mobile Logout */}
                    <button
                        onClick={handleLogout}
                        className="md:hidden p-2 flex items-center justify-center rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>

                    {/* User avatar */}
                    {user && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white text-sm font-bold">
                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <span className="hidden md:block text-sm font-medium text-[var(--color-text-secondary)]">
                                {user.name}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
