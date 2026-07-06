"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@task-app/shared";
import { api } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (token, user) => {
        localStorage.setItem("token", token);
        set({ token, user, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem("token");
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export const initAuth = async (): Promise<User | null> => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const user = await api.auth.me();
    useAuthStore.setState({ user, token, isAuthenticated: true });
    return user;
  } catch {
    useAuthStore.getState().logout();
    return null;
  }
};
