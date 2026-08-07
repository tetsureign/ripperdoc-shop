"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { OrderDto } from "@/lib/types";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDto | null>(null);
  const router = useRouter();

  useEffect(() => {
    api.get<OrderDto>(`/api/orders/${id}`).then(setOrder).catch(() => setOrder(null));
  }, [id]);

  const cancel = async () => {
    try {
      await api.post(`/api/orders/cancel/${id}`);
      toast.success("Installation cancelled");
      const updated = await api.get<OrderDto>(`/api/orders/${id}`);
      setOrder(updated);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  if (!order) return <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 text-center text-sm text-[#8b8fa3]">Loading installation…</div>;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      <Link href="/orders" className="text-xs font-bold uppercase tracking-widest text-[#00ffd0] hover:underline">← Back to installations</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-black uppercase" style={{ fontFamily: "var(--font-display)" }}>Order {order.id.slice(0, 8)}</h1>
        <span className={`px-2 py-0.5 text-xs font-bold uppercase border ${order.status === "Cancelled" ? "border-[#ff2a6d]/30 text-[#ff2a6d]" : "border-[#00ffd0]/30 text-[#00ffd0]"}`}>{order.status}</span>
        <span className="text-xs font-mono text-[#8b8fa3]">{formatDate(order.createdAt)}</span>
      </div>

      <div className="mt-6 grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-3">
          {order.items.map((it) => (
            <div key={it.id} className="bg-[#0f1117] border border-[#232738] p-3 flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.productImageUrl} alt={it.productName} className="w-20 h-20 object-cover bg-[#07080c]" />
              <div className="flex-1">
                <Link href={`/product/${it.productSlug}`} className="font-bold hover:text-[#00ffd0]">{it.productName}</Link>
                <div className="text-xs text-[#8b8fa3]">{it.productCategory} {it.productBrand ? `· ${it.productBrand}` : ""}</div>
                <div className="mt-1 text-sm">{it.quantity} × {formatPrice(it.productPriceSnapshot)} = <span className="font-bold">{formatPrice(it.productPriceSnapshot * it.quantity)}</span></div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-[#0f1117] border border-[#232738] p-4 h-fit">
          <div className="font-bold uppercase tracking-widest text-sm">Summary</div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#8b8fa3]">Items</span><span>{order.items.reduce((s, i) => s + i.quantity, 0)}</span></div>
            <div className="flex justify-between font-black text-base border-t border-[#232738] pt-2"><span>Total</span><span>{formatPrice(order.totalPrice)}</span></div>
            {order.note && <div className="text-xs text-[#8b8fa3] border-t border-[#232738] pt-2">Note: {order.note}</div>}
          </div>
          {order.status !== "Cancelled" && order.status !== "Completed" && (
            <Button variant="danger" className="w-full mt-4" onClick={cancel}>Cancel Installation</Button>
          )}
        </div>
      </div>
    </div>
  );
}
