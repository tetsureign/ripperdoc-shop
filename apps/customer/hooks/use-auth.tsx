"use client";
import { create } from "zustand";
import { api } from "@/lib/api";
import type { WhoAmIDto } from "@/lib/types";

type AuthState = {
  user: WhoAmIDto | null;
  loading: boolean;
  check: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  check: async () => {
    try {
      const u = await api.get<WhoAmIDto>("/api/auth/whoami");
      set({ user: u, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
  login: async (email, password) => {
    await api.post("/api/auth/login", { email, password });
    const u = await api.get<WhoAmIDto>("/api/auth/whoami").catch(() => null);
    set({ user: u });
  },
  register: async (email, password) => {
    await api.post("/api/auth/register", { email, password });
    const u = await api.get<WhoAmIDto>("/api/auth/whoami").catch(() => null);
    set({ user: u });
  },
  logout: async () => {
    await api.post("/api/auth/logout");
    set({ user: null });
  },
}));
