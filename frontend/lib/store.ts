import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "./api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  setOAuthSession: (token: string, user: User) => void;
  loadUser: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login(email, password);
          set({ token: data.access_token, user: data.user, isLoading: false });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.register(name, email, password);
          set({ token: data.access_token, user: data.user, isLoading: false });
        } finally {
          set({ isLoading: false });
        }
      },

      // Called after OAuth — NextAuth already exchanged tokens with backend
      setOAuthSession: (token, user) => {
        set({ token, user });
      },

      loadUser: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const { data } = await authApi.me();
          set({ user: data });
        } catch {
          set({ token: null, user: null });
        }
      },

      logout: () => {
        set({ token: null, user: null });
        // Also sign out from NextAuth if an OAuth session exists
        try {
          import("next-auth/react").then(({ signOut }) =>
            signOut({ redirect: false })
          );
        } catch {}
      },
    }),
    { name: "auth-storage", partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);