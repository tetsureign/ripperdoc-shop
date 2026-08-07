import { fetchPublic } from "@/lib/api";
import type { PaginatedProductResponse, BrandDto } from "@/lib/types";
import { ProductGrid } from "@/components/product-card";
import Link from "next/link";

export default async function BrandPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const [brand, data] = await Promise.all([
    fetchPublic<BrandDto>(`/api/brands/${slug}`),
    fetchPublic<PaginatedProductResponse>(`/api/products/brand/${slug}?page=${page}&pageSize=12`),
  ]);
  if (!brand) return <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-16 text-center"><div className="font-black text-xl">MANUFACTURER NOT FOUND</div><Link href="/shop" className="inline-flex mt-4 bg-white text-black px-5 h-10 items-center font-bold uppercase text-sm">Back to ware</Link></div>;
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      <div className="border border-[#232738] bg-[#0f1117] p-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase bg-[#00ffd0] text-black px-1.5 py-0.5 w-fit">{brand.name}</div>
          <h1 className="mt-2 text-2xl font-black uppercase" style={{ fontFamily: "var(--font-display)" }}>{brand.name}</h1>
          <div className="text-sm text-[#8b8fa3] mt-1 max-w-[60ch]">{brand.description}</div>
        </div>
        <div className="text-xs font-mono text-[#8b8fa3]">{data?.totalCount ?? 0} units · Page {page}/{data?.totalPages ?? 1}</div>
      </div>
      <div className="mt-6"><ProductGrid products={data?.products ?? []} /></div>
    </div>
  );
}
