import { create } from 'zustand';
import { authAPI } from '../api/endpoints';
import { connectSocket, disconnectSocket } from '../utils/socket';

const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    isCheckingAuth: true, // Start true so App waits

    setUser: (user) => set({ user, isAuthenticated: !!user }),

    // Role helpers
    isEngineer: () => get().user?.role === 'engineer',
    isAdmin: () => ['engineer', 'admin'].includes(get().user?.role),
    canEdit: () => ['engineer', 'admin'].includes(get().user?.role),
    isReadOnly: () => get().user?.role === 'user',

    checkAuth: async () => {
        try {
            const res = await authAPI.getMe();
            set({ user: res.data.data, isAuthenticated: true, isCheckingAuth: false });
            // Connect socket after successful auth
            connectSocket();
        } catch (error) {
            set({ user: null, isAuthenticated: false, isCheckingAuth: false });
        }
    },

    logout: () => {
        // Disconnect socket before clearing auth state
        disconnectSocket();
        authAPI.logout().catch(() => { });
        set({ user: null, isAuthenticated: false });
    },
}));

export default useAuthStore;
