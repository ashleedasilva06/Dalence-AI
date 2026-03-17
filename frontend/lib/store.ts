import { create } from "zustand";
import { authApi } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    const { data } = await authApi.login(email, password);
    localStorage.setItem("token", data.access_token);
    set({ user: data.user, token: data.access_token, isLoading: false });
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    const { data } = await authApi.register(name, email, password);
    localStorage.setItem("token", data.access_token);
    set({ user: data.user, token: data.access_token, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
    window.location.href = "/login";
  },

  loadUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const { data } = await authApi.me();
      set({ user: data });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null });
    }
  },
}));
