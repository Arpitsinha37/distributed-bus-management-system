import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId?: string;
}

interface AuthState {
    user: AuthUser | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    sidebarOpen: boolean;
    darkMode: boolean;

    setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    toggleSidebar: () => void;
    toggleDarkMode: () => void;
}

export const useStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            sidebarOpen: true,
            darkMode: false,

            setAuth: (user, accessToken, refreshToken) =>
                set({ user, accessToken, refreshToken, isAuthenticated: true }),

            logout: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('cms_token');
                    window.location.href = '/';
                }
                set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
            },

            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

            toggleDarkMode: () =>
                set((state) => {
                    const newDark = !state.darkMode;
                    if (typeof document !== 'undefined') {
                        document.documentElement.classList.toggle('dark', newDark);
                    }
                    return { darkMode: newDark };
                }),
        }),
        { name: 'cms-admin-store' },
    ),
);
