import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { ProductDto } from "@/lib/types";
import { Badge } from "./ui/badge";

export function ProductCard({ p }: { p: ProductDto }) {
  return (
    <Link href={`/product/${p.slug}`} className="group bg-[#0f1117] border border-[#232738] hover:border-[#00ffd0]/30 transition-colors flex flex-col overflow-hidden">
      <div className="aspect-[4/3] bg-[#0a0b0f] overflow-hidden relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.imageUrl || "https://via.placeholder.com/600x400?text=NO+IMAGE"} alt={p.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
        <div className="absolute top-2 left-2 flex gap-1.5">
          {p.isFeatured && <Badge>Featured</Badge>}
          <span className="px-2 py-0.5 bg-black/70 backdrop-blur text-[11px] font-bold tracking-widest uppercase border border-white/10 text-white">{p.category.name}</span>
        </div>
        {p.brand && <div className="absolute bottom-2 right-2 text-[10px] font-mono tracking-widest bg-[#00ffd0] text-black px-1.5 py-0.5 font-bold">{p.brand.name}</div>}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="font-bold leading-tight text-[15px] line-clamp-2 group-hover:text-[#00ffd0] transition-colors" style={{ fontFamily: "var(--font-display)" }}>{p.name}</div>
        <div className="mt-1 text-xs text-[#8b8fa3] line-clamp-2 leading-relaxed">{p.description}</div>
        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="font-black text-lg tracking-tight">{formatPrice(p.price)}</div>
          <span className="text-[11px] font-bold tracking-widest uppercase border border-[#00ffd0]/30 text-[#00ffd0] px-2 py-1 group-hover:bg-[#00ffd0] group-hover:text-black transition-colors">View →</span>
        </div>
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: ProductDto[] }) {
  if (!products.length) return <div className="py-16 text-center border border-dashed border-[#232738] text-[#8b8fa3] text-sm">No chrome found in this sector.</div>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((p) => <ProductCard key={p.slug} p={p} />)}
    </div>
  );
}
