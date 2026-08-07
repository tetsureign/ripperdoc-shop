import Link from "next/link";
import { fetchPublic } from "@/lib/api";
import type { PaginatedProductResponse, PaginatedCategoryResponse, PaginatedBrandResponse, ProductDto } from "@/lib/types";
import { ProductGrid } from "@/components/product-card";
import { ArrowRight } from "lucide-react";
import FeaturedWall from "@/components/featured-wall";

async function getFeatured(): Promise<ProductDto[]> {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 2500);
    const r = await fetch(`${base}/api/products/featured`, { next: { revalidate: 20 }, signal: controller.signal });
    clearTimeout(t);
    if (!r.ok) return [];
    return await r.json();
  } catch { return []; }
}

export default async function HomePage() {
  const [featured, productsData, categoriesData, brandsData] = await Promise.all([
    getFeatured(),
    fetchPublic<PaginatedProductResponse>("/api/products?page=1&pageSize=8"),
    fetchPublic<PaginatedCategoryResponse>("/api/categories?page=1&pageSize=12"),
    fetchPublic<PaginatedBrandResponse>("/api/brands?page=1&pageSize=12"),
  ]);

  const products = productsData?.products ?? [];
  const categories = categoriesData?.categories ?? [];
  const brands = brandsData?.brands ?? [];

  return (
    <div>
      {/* HERO - scanner wall, full-width. Headline kept as top bar, old left column removed */}
      <section className="border-b border-[#232738]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="py-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase">
                <span className="w-2 h-2 bg-[#ff2a6d] animate-pulse" /> Watson · Open 24h · Walk-ins — No appointment required
              </div>
              <h1 className="mt-2 text-[36px] sm:text-[44px] font-black leading-[0.9] tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                CHROME <span className="text-[#00ffd0]">THAT KEEPS</span> YOU ALIVE.
              </h1>
            </div>
            <div className="flex gap-3">
              <Link href="/shop" className="inline-flex items-center gap-2 bg-[#00ffd0] text-black px-6 h-11 font-bold uppercase tracking-wide text-sm hover:bg-[#00e6bc]">
                Browse Ware <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#featured" className="hidden sm:inline-flex items-center gap-2 border border-white/15 text-white px-6 h-11 font-bold uppercase tracking-wide text-sm hover:bg-white hover:text-black">
                Featured
              </Link>
            </div>
          </div>
          <div className="bg-[#0f1117] border border-[#232738] relative overflow-hidden">
            <FeaturedWall products={featured} />
            <div className="absolute top-2 left-1/2 -translate-x-1/2 lg:left-[188px] lg:translate-x-0 bg-[#ff2a6d] text-white text-[10px] font-black tracking-widest px-2 py-1 font-mono z-10 pointer-events-none">LIVE INVENTORY</div>
          </div>
        </div>
      </section>

      {/* CATEGORIES - horizontal strip, not 3-card grid */}
      <section id="categories" className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-black tracking-tight uppercase" style={{ fontFamily: "var(--font-display)" }}>Browse by System</h2>
          <Link href="/shop" className="text-xs font-bold tracking-widest uppercase text-[#00ffd0] hover:underline">All ware →</Link>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.slice(0, 8).map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="group bg-[#0f1117] border border-[#232738] p-4 hover:border-[#00ffd0]/30">
              <div className="text-xs font-mono tracking-widest text-[#00ffd0] uppercase">SYS // {c.slug.slice(0, 12)}</div>
              <div className="mt-1 font-bold text-[15px] leading-tight group-hover:text-[#00ffd0]">{c.name}</div>
              <div className="mt-1 text-xs text-[#8b8fa3] line-clamp-2">{c.description || "Cyberware category"}</div>
            </Link>
          ))}
          {!categories.length && <div className="col-span-full py-8 text-sm text-[#8b8fa3] border border-dashed border-[#232738] text-center">No categories indexed.</div>}
        </div>
      </section>

      {/* BRANDS */}
      <section id="brands" className="max-w-[1280px] mx-auto px-4 sm:px-6 py-2">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-black tracking-tight uppercase" style={{ fontFamily: "var(--font-display)" }}>Manufacturers</h2>
          <span className="text-xs font-mono text-[#8b8fa3]">{brands.length} licensed</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {brands.map((b) => (
            <Link key={b.slug} href={`/brand/${b.slug}`} className="px-3 py-2 bg-[#0f1117] border border-[#232738] text-sm font-bold uppercase tracking-wide hover:border-white/20 hover:text-white text-[#8b8fa3]">
              {b.name}
            </Link>
          ))}
          {!brands.length && <span className="text-sm text-[#8b8fa3]">No manufacturers registered.</span>}
        </div>
      </section>

      {/* FEATURED / LATEST */}
      <section id="featured" className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-black tracking-tight uppercase" style={{ fontFamily: "var(--font-display)" }}>Latest Ware</h2>
          <Link href="/shop" className="text-xs font-bold tracking-widest uppercase bg-white text-black px-3 py-1.5 hover:bg-[#00ffd0]">View all</Link>
        </div>
        <div className="mt-4">
          <ProductGrid products={products} />
        </div>
      </section>

      {/* Notice bar - distinct, not card grid */}
      <section className="border-y border-[#ff2a6d]/20 bg-[#ff2a6d]/5">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-2 sm:items-center justify-between text-sm">
          <span className="font-bold uppercase tracking-wide"><span className="text-[#ff2a6d]">Warning:</span> Unlicensed chrome voids warranty and may cause cyberpsychosis. Install only at certified clinics.</span>
          <span className="text-xs font-mono text-[#8b8fa3]">Need a consult? Visit Watson clinic — no appointment.</span>
        </div>
      </section>
    </div>
  );
}
