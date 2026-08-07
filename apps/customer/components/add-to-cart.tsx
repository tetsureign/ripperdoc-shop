"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { useCartStore } from "@/hooks/use-cart";
import { useAuthStore } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";

export function AddToCart({ productId, slug }: { productId?: string; slug: string }) {
  const [qty, setQty] = useState(1);
  const { add } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // We don't have productId in ProductDto (only slug). Need to fetch via mapping? API expects productId GUID.
  // For now we will try to resolve productId by fetching product detail? Fallback: show message if no productId.
  // The products listing doesn't expose id, but detail fetch via slug may need to return id. We'll call cart with productId if available else warn.

  const handle = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!productId) {
      // Resolve via fetching product? For MVP, alert that API needs productId - we will try to get id via requesting /api/products/{slug} and hoping backend returns id
      // Attempt fetch
      try {
        setLoading(true);
        // fetch product to get id (server returns ProductDto without id, but we can try to fetch admin shape? fallback)
        const res = await fetch(`/api/products/${slug}`, { credentials: "include" });
        const data = await res.json();
        const id = data.id || data.Id;
        if (!id) throw new Error("Product ID not exposed by public API");
        await add(id, qty);
        toast.success("Added to loadout");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed";
        toast.error(msg);
      } finally { setLoading(false); }
      return;
    }
    setLoading(true);
    try {
      await add(productId, qty);
      toast.success("Added to loadout");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add");
    } finally { setLoading(false); }
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
