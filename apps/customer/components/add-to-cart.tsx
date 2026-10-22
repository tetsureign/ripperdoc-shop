"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { useCartStore } from "@/hooks/use-cart";
import { useAuthStore } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";

export function AddToCart({ slug }: { slug: string; productId?: string }) {
  const [qty, setQty] = useState(1);
  const { add } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      await add(slug, qty);
      toast.success("Added to loadout");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center border border-[#232738] bg-[#0f1117]">
        <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-white/5"><Minus className="w-3 h-3" /></button>
        <span className="w-10 text-center font-mono text-sm font-bold">{qty}</span>
        <button onClick={() => setQty((q) => q + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-white/5"><Plus className="w-3 h-3" /></button>
      </div>
      <Button onClick={handle} disabled={loading} className="flex-1">
        {loading ? "..." : "Add to Loadout"}
      </Button>
    </div>
  );
}
