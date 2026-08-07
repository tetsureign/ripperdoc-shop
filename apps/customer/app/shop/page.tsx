import { fetchPublic } from "@/lib/api";
import type { PaginatedProductResponse, PaginatedCategoryResponse, PaginatedBrandResponse } from "@/lib/types";
import { ProductGrid } from "@/components/product-card";
import Link from "next/link";

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ page?: string; featured?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const isFeaturedOnly = params.featured === "1";

  const [productsData, categoriesData, brandsData] = await Promise.all([
    isFeaturedOnly
      ? (async () => {
          const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          try {
            const r = await fetch(`${base}/api/products/featured`, { next: { revalidate: 20 } });
            const list = r.ok ? await r.json() : [];
            return { products: list, totalCount: list.length, totalPages: 1 } as PaginatedProductResponse;
          } catch { return { products: [], totalCount: 0, totalPages: 1 }; }
        })()
      : fetchPublic<PaginatedProductResponse>(`/api/products?page=${page}&pageSize=12`),
    fetchPublic<PaginatedCategoryResponse>("/api/categories?page=1&pageSize=20"),
    fetchPublic<PaginatedBrandResponse>("/api/brands?page=1&pageSize=20"),
  ]);

  const products = productsData?.products ?? [];
  const totalPages = productsData?.totalPages ?? 1;
  const categories = categoriesData?.categories ?? [];
  const brands = brandsData?.brands ?? [];

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#232738] pb-4">
        <h1 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          {isFeaturedOnly ? "Featured Chrome" : "All Ware"}
        </h1>
        <div className="text-xs font-mono text-[#8b8fa3]">{productsData?.totalCount ?? 0} units indexed · Page {page}/{totalPages}</div>
      </div>

      <div className="mt-6 grid lg:grid-cols-[220px_1fr] gap-6">
        <aside className="space-y-6">
          <div className="bg-[#0f1117] border border-[#232738] p-4">
            <div className="text-xs font-bold tracking-widest uppercase">Systems</div>
            <div className="mt-3 space-y-1">
              <Link href="/shop" className={`block text-sm px-2 py-1.5 border ${!isFeaturedOnly ? "bg-white text-black border-white" : "text-[#8b8fa3] border-transparent hover:text-white"}`}>All</Link>
              <Link href="/shop?featured=1" className={`block text-sm px-2 py-1.5 border ${isFeaturedOnly ? "bg-white text-black border-white" : "text-[#8b8fa3] border-transparent hover:text-white"}`}>Featured</Link>
              {categories.map((c) => (
                <Link key={c.slug} href={`/category/${c.slug}`} className="block text-sm px-2 py-1.5 text-[#8b8fa3] hover:text-white hover:bg-white/5">{c.name}</Link>
              ))}
            </div>
          </div>
          <div className="bg-[#0f1117] border border-[#232738] p-4">
            <div className="text-xs font-bold tracking-widest uppercase">Manufacturers</div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {brands.map((b) => (
                <Link key={b.slug} href={`/brand/${b.slug}`} className="text-xs font-bold uppercase tracking-wide border border-[#232738] px-2 py-1 hover:border-white/20 text-[#8b8fa3] hover:text-white">{b.name}</Link>
              ))}
            </div>
          </div>
          <div className="border border-[#00ffd0]/20 bg-[#00ffd0]/5 p-3 text-xs leading-relaxed text-[#8b8fa3]">
            Tip: All prices in Eurodollars. Installation fee not included. Street cred required for military-grade ware.
          </div>
        </aside>

        <div>
          <ProductGrid products={products} />
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).slice(0, 8).map((_, i) => {
                const p = i + 1;
                return (
                  <Link key={p} href={`/shop?page=${p}`} className={`w-9 h-9 flex items-center justify-center text-sm font-bold border ${p === page ? "bg-[#00ffd0] text-black border-[#00ffd0]" : "border-[#232738] text-[#8b8fa3] hover:text-white hover:border-white/20"}`}>
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
