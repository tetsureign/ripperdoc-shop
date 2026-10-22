"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { ProductDto } from "@/lib/types";

export default function FeaturedCarousel({ products }: { products: ProductDto[] }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((n: number) => {
    setIdx((i) => (n + products.length) % products.length);
  }, [products.length]);

  useEffect(() => {
    if (paused || products.length <= 1) return;
    timer.current = setInterval(() => go(idx + 1), 4000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [idx, paused, go, products.length]);

  // reset when products change
  useEffect(() => { setIdx(0); }, [products.length]);

  if (!products.length) {
    return (
      <div className="h-full min-h-[360px] flex flex-col justify-center p-8">
        <div className="w-full h-48 border border-dashed border-[#232738] flex items-center justify-center text-[#8b8fa3] font-mono text-xs">NO FEATURED CHROME — CHECK BACK AFTER CURFEW</div>
        <div className="mt-4 text-sm text-[#8b8fa3]">Our ripperdocs are calibrating the next drop. Meanwhile, browse the full ware.</div>
        <Link href="/shop" className="mt-4 inline-flex bg-white text-black px-5 h-10 items-center font-bold uppercase text-sm w-fit">Go to shop</Link>
      </div>
    );
  }

  const p = products[idx];

  return (
    <div
      className="relative flex flex-col h-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Link href={`/product/${p.slug}`} className="block group">
        <div className="aspect-[4/3.2] bg-[#07080c] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
        </div>
        <div className="p-5">
          <div className="text-[11px] font-mono tracking-widest uppercase text-[#00ffd0] flex items-center gap-2">
            <span>Featured — {p.category.name}</span>
            <span className="text-[#8b8fa3]">{idx + 1} / {products.length}</span>
          </div>
          <div className="mt-1 font-black text-xl leading-tight group-hover:text-[#00ffd0]" style={{ fontFamily: "var(--font-display)" }}>{p.name}</div>
          <div className="mt-1 text-sm text-[#8b8fa3] line-clamp-2">{p.description}</div>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-black text-xl">{formatPrice(p.price)}</span>
            <span className="text-xs font-bold uppercase tracking-widest border border-[#00ffd0]/30 text-[#00ffd0] px-3 py-1.5 group-hover:bg-[#00ffd0] group-hover:text-black">View implant →</span>
          </div>
        </div>
      </Link>

      {products.length > 1 && (
        <>
          <div className="absolute top-2 left-2 flex gap-1">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 transition-all ${i === idx ? "w-6 bg-[#00ffd0]" : "w-3 bg-white/30 hover:bg-white/50"}`}
              />
            ))}
          </div>
          <button
            onClick={() => go(idx - 1)}
            aria-label="Previous"
            className="absolute left-2 top-[38%] -translate-y-1/2 w-8 h-8 bg-black/60 border border-white/15 text-white flex items-center justify-center hover:bg-black/80 hover:border-white/30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => go(idx + 1)}
            aria-label="Next"
            className="absolute right-2 top-[38%] -translate-y-1/2 w-8 h-8 bg-black/60 border border-white/15 text-white flex items-center justify-center hover:bg-black/80 hover:border-white/30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}
