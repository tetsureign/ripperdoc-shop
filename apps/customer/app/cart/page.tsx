"use client";
import { useCartStore } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trash2, Minus, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/use-auth";

export default function CartPage() {
  const { items, refresh, remove, updateQty } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => { refresh(); }, [refresh]);

  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const placeOrder = async () => {
    if (!user) { router.push("/login"); return; }
    if (!items.length) return;
    setPlacing(true);
    try {
      const order = await api.post<{ id: string }>("/api/orders", { note: note || undefined });
      toast.success("Installation queued — order placed");
      await refresh();
      router.push(`/orders/${order.id}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to place order");
    } finally { setPlacing(false); }
  };

  if (!items.length) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-black uppercase" style={{ fontFamily: "var(--font-display)" }}>Loadout</h1>
        <div className="mt-6 border border-dashed border-[#232738] py-16 text-center">
          <div className="text-sm text-[#8b8fa3]">Your loadout is empty. No chrome selected.</div>
          <Link href="/shop" className="inline-flex mt-4 bg-[#00ffd0] text-black px-6 h-10 items-center font-bold uppercase text-sm">Browse ware</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-black uppercase" style={{ fontFamily: "var(--font-display)" }}>Loadout <span className="text-[#8b8fa3] font-mono text-sm normal-case">({items.length} items)</span></h1>
      <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-[#0f1117] border border-[#232738] p-3 flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.product.imageUrl} alt={item.product.name} className="w-24 h-24 object-cover bg-[#07080c] shrink-0" />
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.product.slug}`} className="font-bold leading-tight hover:text-[#00ffd0]">{item.product.name}</Link>
                <div className="text-xs text-[#8b8fa3]">{item.product.category.name} {item.product.brand ? `· ${item.product.brand.name}` : ""}</div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center border border-[#232738] bg-[#07080c]">
                    <button onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))} className="w-7 h-7 flex items-center justify-center hover:bg-white/5"><Minus className="w-3 h-3" /></button>
                    <span className="w-8 text-center font-mono text-xs font-bold">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-white/5"><Plus className="w-3 h-3" /></button>
                  </div>
                  <span className="font-bold">{formatPrice(item.product.price * item.quantity)}</span>
                  <span className="text-xs text-[#8b8fa3]">({formatPrice(item.product.price)} ea)</span>
                </div>
              </div>
              <button onClick={() => remove(item.id)} className="self-start w-8 h-8 flex items-center justify-center border border-[#232738] hover:border-[#ff2a6d]/40 hover:text-[#ff2a6d] text-[#8b8fa3]"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-[#0f1117] border border-[#232738] p-4">
            <div className="font-bold uppercase tracking-widest text-sm">Summary</div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#8b8fa3]">Subtotal</span><span className="font-bold">{formatPrice(total)}</span></div>
              <div className="flex justify-between"><span className="text-[#8b8fa3]">Installation</span><span className="text-[#00ffd0]">Included</span></div>
              <div className="border-t border-[#232738] pt-2 flex justify-between text-base"><span className="font-black">Total</span><span className="font-black">{formatPrice(total)}</span></div>
            </div>
            <div className="mt-4">
              <label className="text-xs font-bold uppercase tracking-widest">Note (optional)</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any install notes for the ripperdoc..." className="mt-1 w-full min-h-[72px] p-2 bg-[#07080c] border border-[#232738] text-sm placeholder:text-[#8b8fa3] focus:outline-none focus:border-[#00ffd0]/40" />
            </div>
            <Button onClick={placeOrder} disabled={placing} className="w-full mt-4">{placing ? "Queuing..." : "Place Installation Order"}</Button>
            <div className="mt-2 text-[11px] text-[#8b8fa3] text-center">By placing you agree to our chrome waiver.</div>
          </div>
          <div className="border border-[#232738] p-3 text-xs text-[#8b8fa3] leading-relaxed">
            All chrome is installed at Watson clinic. You&apos;ll get a holo-call when your slot is ready. Bring creds and a strong stomach.
          </div>
        </div>
      </div>
    </div>
  );
}
