import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { authAPI } from '../api/endpoints';
import { connectSocket, disconnectSocket } from '../utils/socket';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isCheckingAuth: true,

            setUser: (user) => set({ user, isAuthenticated: !!user }),

            // Role helpers
            isEngineer: () => get().user?.role === 'engineer',
            isAdmin: () => ['engineer', 'admin'].includes(get().user?.role),
            canEdit: () => ['engineer', 'admin'].includes(get().user?.role),
            isReadOnly: () => get().user?.role === 'user',

            checkAuth: async () => {
                try {
                    const res = await authAPI.getMe();
                    set({ user: res.data.data.user, isAuthenticated: true, isCheckingAuth: false });
                    connectSocket();
                } catch (_error) {
                    disconnectSocket();
                    set({ user: null, isAuthenticated: false, isCheckingAuth: false });
                }
            },

            logout: () => {
                disconnectSocket();
                authAPI.logout().catch(() => {});
                set({ user: null, isAuthenticated: false, isCheckingAuth: false });
            },
        }),
        {
            name: 'auth-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;
