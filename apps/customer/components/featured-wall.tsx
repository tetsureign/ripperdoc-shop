"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { ProductDto } from "@/lib/types";

export default function FeaturedWall({ products }: { products: ProductDto[] }) {
  const [idx, setIdx] = useState(0);
  const go = useCallback((n: number) => {
    if (!products.length) return;
    setIdx((i) => (n + products.length) % products.length);
  }, [products.length]);

  if (!products.length) {
    return (
      <div className="h-full min-h-[360px] flex flex-col justify-center p-8">
        <div className="w-full h-48 border border-dashed border-[#232738] flex items-center justify-center text-[#8b8fa3] font-mono text-xs">NO FEATURED CHROME — CHECK BACK AFTER CURFEW</div>
        <div className="mt-4 text-sm text-[#8b8fa3]">Our ripperdocs are calibrating the next drop.</div>
        <Link href="/shop" className="mt-4 inline-flex bg-white text-black px-5 h-10 items-center font-bold uppercase text-sm w-fit">Go to shop</Link>
      </div>
    );
  }

  const p = products[idx];

  return (
    <div className="grid lg:grid-cols-[180px_1fr] gap-0 h-full min-h-[360px]">
      {/* Vertical nav - desktop */}
      <div className="hidden lg:flex flex-col border-r border-[#232738] bg-[#07080c]">
        {products.map((prod, i) => {
          const active = i === idx;
          return (
            <button
              key={prod.slug}
              onClick={() => go(i)}
              aria-current={active}
              aria-label={`Show ${prod.name}`}
              className={`text-left px-3 py-3 border-b border-[#232738] flex flex-col gap-1 ${active ? "bg-white text-black border-white hover:bg-white" : "bg-[#07080c] text-[#8b8fa3] hover:bg-white/5 hover:text-white"}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-[11px] tracking-widest">0{i + 1}</span>
                <span className={`h-1.5 w-1.5 ${active ? "bg-black" : "bg-[#00ffd0]"}`} />
              </div>
              <div className={`font-bold text-xs leading-tight truncate ${active ? "text-black" : "text-white"}`}>{prod.brand?.name ?? "GEN"}</div>
              <div className="font-mono text-[11px] truncate">{formatPrice(prod.price)}</div>
              <div className={`text-[11px] leading-tight line-clamp-2 ${active ? "text-black/70" : "text-[#8b8fa3]"}`}>{prod.name}</div>
            </button>
          );
        })}
        <div className="mt-auto p-3 border-t border-[#232738] text-[11px] font-mono text-[#8b8fa3]">
          {String(idx + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")} — SELECT
        </div>
      </div>

      {/* Scanner stage */}
      <div className="flex flex-col">
        <div className="grid grid-cols-[1fr] lg:grid-cols-[140px_1fr_140px] gap-0 flex-1">
          {/* Left stats */}
          <div className="hidden lg:flex flex-col gap-3 p-4 border-r border-[#232738] bg-[#0f1117] text-xs font-mono">
            <div>
              <div className="text-[10px] tracking-widest text-[#8b8fa3]">SYSTEM</div>
              <div className="font-bold text-white mt-1">{p.category.name}</div>
            </div>
            <div>
              <div className="text-[10px] tracking-widest text-[#8b8fa3]">MFG</div>
              <div className="font-bold text-white mt-1">{p.brand?.name ?? "Generic"}</div>
            </div>
            <div className="pt-3 border-t border-[#232738]">
              <div className="text-[10px] tracking-widest text-[#8b8fa3]">COMPAT</div>
              <div className="font-bold text-[#00ffd0] mt-1">98%</div>
              <div className="text-[11px] text-[#8b8fa3]">Rejection 0.4%</div>
            </div>
          </div>

          {/* Center image with scan overlay */}
          <div className="relative bg-[#07080c] overflow-hidden aspect-[4/3] lg:aspect-auto lg:min-h-[280px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
            {/* scan grid */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "linear-gradient(rgba(0,255,208,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,208,1) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            {/* scanline */}
            <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,208,0.04)_2px,rgba(0,255,208,0.04)_4px)]" />
            {/* prev/next */}
            <button onClick={() => go(idx - 1)} aria-label="Previous" className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 border border-white/15 text-white flex items-center justify-center hover:bg-black/80">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => go(idx + 1)} aria-label="Next" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 border border-white/15 text-white flex items-center justify-center hover:bg-black/80">
              <ChevronRight className="w-4 h-4" />
            </button>
            {/* mobile dots inside image */}
            <div className="lg:hidden absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {products.map((_, i) => (
                <button key={i} onClick={() => go(i)} aria-label={`Go to ${i + 1}`} className={`h-1.5 ${i === idx ? "w-6 bg-[#00ffd0]" : "w-3 bg-white/30"}`} />
              ))}
            </div>
          </div>

          {/* Right stats */}
          <div className="hidden lg:flex flex-col gap-3 p-4 border-l border-[#232738] bg-[#0f1117] text-xs font-mono">
            <div>
              <div className="text-[10px] tracking-widest text-[#8b8fa3]">PRICE</div>
              <div className="font-black text-lg text-white mt-1">{formatPrice(p.price)}</div>
              <div className="text-[11px] text-[#8b8fa3]">+ install</div>
            </div>
            <div>
              <div className="text-[10px] tracking-widest text-[#8b8fa3]">STOCK</div>
              <div className="font-bold text-[#00ffd0] mt-1">12 UNITS</div>
            </div>
            <Link href={`/product/${p.slug}`} className="mt-auto inline-flex items-center justify-center bg-[#00ffd0] text-black px-3 h-9 font-bold uppercase text-xs tracking-wide hover:bg-[#00e6bc]">
              View implant →
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#232738] bg-[#0f1117] p-4">
          <div className="text-[11px] font-mono tracking-widest text-[#00ffd0]">Featured — {p.category.name} — 0{idx + 1} / 0{products.length}</div>
          <div className="mt-1 font-black text-lg leading-tight" style={{ fontFamily: "var(--font-display)" }}>{p.name}</div>
          <div className="mt-1 text-sm text-[#8b8fa3] line-clamp-2">{p.description}</div>
          <div className="lg:hidden mt-3 flex items-center justify-between">
            <span className="font-black">{formatPrice(p.price)}</span>
            <Link href={`/product/${p.slug}`} className="text-xs font-bold uppercase tracking-widest border border-[#00ffd0]/30 text-[#00ffd0] px-3 py-1.5">View implant →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
