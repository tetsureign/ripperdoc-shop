"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PaginatedOrderSummaryResponse } from "@/lib/types";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const [data, setData] = useState<PaginatedOrderSummaryResponse | null>(null);
  const [page, setPage] = useState(1);
  const { user, check } = useAuthStore();
  const router = useRouter();

  useEffect(() => { check(); }, [check]);
  useEffect(() => {
    if (user === null) return;
    api.get<PaginatedOrderSummaryResponse>(`/api/orders?page=${page}&pageSize=10`).then(setData).catch(() => setData({ orders: [], totalCount: 0, totalPages: 1 }));
  }, [page, user]);

  if (!user) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12">
        <div className="border border-[#232738] bg-[#0f1117] p-8 text-center">
          <div className="font-black uppercase">Jack in required</div>
          <div className="text-sm text-[#8b8fa3] mt-1">You need to be authenticated to view installations.</div>
          <Link href="/login" className="inline-flex mt-4 bg-[#00ffd0] text-black px-6 h-10 items-center font-bold uppercase text-sm">Jack In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-black uppercase" style={{ fontFamily: "var(--font-display)" }}>Installations</h1>
      <div className="mt-6 space-y-3">
        {data?.orders.map((o) => (
          <Link key={o.id} href={`/orders/${o.id}`} className="flex flex-wrap items-center gap-4 bg-[#0f1117] border border-[#232738] p-4 hover:border-white/20">
            <div className="font-mono text-xs text-[#8b8fa3]">{o.id.slice(0, 8)}…</div>
            <div className={`px-2 py-0.5 text-xs font-bold uppercase border ${o.status === "Cancelled" ? "border-[#ff2a6d]/30 text-[#ff2a6d] bg-[#ff2a6d]/10" : o.status === "Completed" ? "border-[#00ffd0]/30 text-[#00ffd0] bg-[#00ffd0]/10" : "border-white/15 text-white"}`}>{o.status}</div>
            <div className="text-sm">{o.itemCount} items</div>
            <div className="font-bold">{formatPrice(o.totalPrice)}</div>
            <div className="ml-auto text-xs font-mono text-[#8b8fa3]">{formatDate(o.createdAt)}</div>
          </Link>
        ))}
        {!data?.orders.length && <div className="py-12 text-center border border-dashed border-[#232738] text-sm text-[#8b8fa3]">No installations yet. Your first chrome awaits.</div>}
      </div>
      {data && data.totalPages > 1 && (
        <div className="mt-6 flex gap-2 justify-center">
          {Array.from({ length: data.totalPages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 border font-bold text-sm ${page === i + 1 ? "bg-white text-black border-white" : "border-[#232738] text-[#8b8fa3]"}`}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
