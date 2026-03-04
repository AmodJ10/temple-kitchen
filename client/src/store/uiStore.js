import { create } from 'zustand';

const useUIStore = create((set) => ({
    sidebarCollapsed: false,
    darkMode: false,

    toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

    toggleDarkMode: () =>
        set((s) => {
            const next = !s.darkMode;
            document.documentElement.classList.toggle('dark', next);
            localStorage.setItem('theme', next ? 'dark' : 'light');
            return { darkMode: next };
        }),

    initTheme: () => {
        const saved = localStorage.getItem('theme');
        const dark = saved === 'dark';
        document.documentElement.classList.toggle('dark', dark);
        set({ darkMode: dark });
    },
}));

export default useUIStore;
