import { create } from "zustand";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isRestoring: boolean
  setSession: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
  finishRestoring: () => void;
}

// Guarda apenas o access token em memória (nunca em localStorage) —
// o refresh token vive num cookie httpOnly, fora do alcance do JS.
// Isso significa que um F5 na página perde a sessão até o interceptor
// do axios chamar /auth/refresh usando o cookie; ver useAuth.ts.
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isRestoring: true,

  setSession: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),

  setAccessToken: (accessToken) => set({ accessToken, isAuthenticated: true }),

  clearSession: () => set({ user: null, accessToken: null, isAuthenticated: false }),

  finishRestoring: () => set({ isRestoring: false }),
}));
