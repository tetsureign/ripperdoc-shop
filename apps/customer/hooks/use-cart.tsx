"use client";
import { create } from "zustand";
import { api } from "@/lib/api";
import type { CartItemDto } from "@/lib/types";
import { useEffect } from "react";

type CartState = {
  items: CartItemDto[];
  loading: boolean;
  refresh: () => Promise<void>;
  add: (productId: string, qty: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
  updateQty: (id: string, qty: number) => Promise<void>;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: true,
  refresh: async () => {
    try {
      set({ loading: true });
      const data = await api.get<CartItemDto[]>("/api/carts");
      set({ items: data, loading: false });
    } catch {
      set({ items: [], loading: false });
    }
  },
  add: async (productId, qty) => {
    await api.post("/api/carts", { productId, quantity: qty });
    await get().refresh();
  },
  remove: async (id) => {
    await api.del(`/api/carts/${id}`);
    await get().refresh();
  },
  updateQty: async (id, qty) => {
    await api.post(`/api/carts/${id}/quantity`, qty);
    await get().refresh();
  },
}));

export function useCart() {
  const store = useCartStore();
  useEffect(() => {
    store.refresh();
  }, []);
  return store;
}
