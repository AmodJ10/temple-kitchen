import { Menu, LogOut } from 'lucide-react';
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
        <header className="sticky top-0 z-20 bg-[var(--color-bg-card)]/90 backdrop-blur-xl border-b border-[var(--color-border)] h-14">
            <div className="flex items-center justify-between h-full px-4 md:px-6">
                {/* Mobile menu toggle */}
                <button
                    onClick={toggleSidebar}
                    className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] transition-colors duration-[var(--duration-fast)] [transition-timing-function:var(--ease-expo)]"
                >
                    <Menu size={20} />
                </button>

                {/* Mobile logo */}
                <div className="md:hidden flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[var(--color-primary)] flex items-center justify-center text-white text-[10px] font-bold">M</div>
                    <span className="text-sm font-semibold text-[var(--color-text-primary)] tracking-tight">MSM Kitchen</span>
                </div>

                {/* Spacer for desktop */}
                <div className="hidden md:block" />

                {/* Right section */}
                <div className="flex items-center gap-2 ml-auto">
                    {/* Mobile Logout */}
                    <button
                        onClick={handleLogout}
                        className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)] transition-colors duration-[var(--duration-fast)] [transition-timing-function:var(--ease-expo)]"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>

                    {/* User avatar */}
                    {user && (
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-md bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-semibold">
                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <span className="hidden md:block text-sm text-[var(--color-text-secondary)]">
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
