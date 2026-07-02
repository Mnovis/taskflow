import { api } from "./api";
import type { User } from "@/types";

interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authService = {
  async register(input: { name: string; email: string; password: string }) {
    const { data } = await api.post<AuthResponse>("/auth/register", input);
    return data;
  },

  async login(input: { email: string; password: string }) {
    const { data } = await api.post<AuthResponse>("/auth/login", input);
    return data;
  },

  async refresh() {
    const { data } = await api.post<{ accessToken: string }>("/auth/refresh");
    return data;
  },

  async logout() {
    await api.post("/auth/logout");
  },

  async me() {
    const { data } = await api.get<{ user: User }>("/auth/me");
    return data.user;
  },
};
