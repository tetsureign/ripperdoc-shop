"use client";
import { useState } from "react";
import type { PaginatedRatingResponse } from "@/lib/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuthStore } from "@/hooks/use-auth";

export default function Ratings({ slug, initial }: { slug: string; initial: PaginatedRatingResponse | null }) {
  const [ratings, setRatings] = useState(initial);
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const { user } = useAuthStore();

  const refresh = async () => {
    try {
      const data = await api.get<PaginatedRatingResponse>(`/api/ratings/by-product/${slug}?page=1&pageSize=20`);
      setRatings(data);
    } catch {}
  };

  const submit = async () => {
    if (!user) { toast.error("Jack in to leave a rating"); return; }
    try {
      await api.post("/api/ratings", { productSlug: slug, score, comment: comment || undefined });
      toast.success("Rating installed");
      setComment("");
      refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="border border-[#232738] bg-[#0f1117]">
      <div className="p-4 border-b border-[#232738] flex items-baseline justify-between">
        <h2 className="font-black uppercase tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Field Reports</h2>
        <span className="text-xs font-mono text-[#8b8fa3]">{ratings?.totalCount ?? 0} reports</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-0">
        <div className="p-4 space-y-3 max-h-[420px] overflow-auto">
          {ratings?.ratings.length ? ratings.ratings.map((r) => (
            <div key={r.id} className="border border-[#232738] bg-[#07080c] p-3">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="bg-[#00ffd0] text-black px-1.5 py-0.5 font-bold">{r.score}/5</span>
                <span className="text-[#8b8fa3]">{r.userId.slice(0, 8)}…</span>
              </div>
              {r.comment && <div className="mt-2 text-sm leading-relaxed">{r.comment}</div>}
            </div>
          )) : <div className="py-10 text-center text-sm text-[#8b8fa3] border border-dashed border-[#232738]">No field reports yet. Be the first to test this chrome.</div>}
        </div>

        <div className="border-t lg:border-t-0 lg:border-l border-[#232738] p-4 bg-[#07080c]">
          <div className="text-xs font-bold uppercase tracking-widest">Leave a report</div>
          {!user && <div className="mt-2 text-xs text-[#ff2a6d]">You must be jacked in (Customer role) to submit.</div>}
          <div className="mt-3 flex gap-1">
            {[1,2,3,4,5].map((n) => (
              <button key={n} onClick={() => setScore(n)} className={`w-9 h-9 border font-black ${n===score ? "bg-[#00ffd0] text-black border-[#00ffd0]" : "border-[#232738] text-[#8b8fa3] hover:text-white"}`}>{n}</button>
            ))}
          </div>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How does it feel? Any rejection? (optional)" className="mt-3" />
          <Button onClick={submit} className="w-full mt-3" disabled={!user}>Submit Report</Button>
        </div>
      </div>
    </div>
  );
}
