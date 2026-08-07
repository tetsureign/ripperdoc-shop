import { fetchPublic } from "@/lib/api";
import type { ProductDto, PaginatedRatingResponse } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { AddToCart } from "@/components/add-to-cart";
import Ratings from "./ratings";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchPublic<ProductDto>(`/api/products/${slug}`);
  if (!product) {
    return <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-16 text-center border border-dashed border-[#232738] mt-8"><div className="font-black text-xl">WARE NOT FOUND</div><div className="text-sm text-[#8b8fa3] mt-2">The chrome you&apos;re looking for was scrapped or never existed.</div><Link href="/shop" className="inline-flex mt-4 bg-white text-black px-5 h-10 items-center font-bold uppercase text-sm">Back to ware</Link></div>;
  }
  const ratings = await fetchPublic<PaginatedRatingResponse>(`/api/ratings/by-product/${slug}?page=1&pageSize=10`);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      <div className="text-xs font-mono">
        <Link href="/shop" className="text-[#8b8fa3] hover:text-white">WARE</Link>
        <span className="text-[#8b8fa3]"> / </span>
        <Link href={`/category/${product.category.slug}`} className="text-[#8b8fa3] hover:text-white">{product.category.name}</Link>
        <span className="text-[#8b8fa3]"> / </span>
        <span className="text-white">{product.name}</span>
      </div>

      <div className="mt-4 grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="bg-[#0f1117] border border-[#232738] overflow-hidden">
          <div className="aspect-[4/3] bg-[#07080c]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-3 flex items-center gap-2 text-[11px] font-mono border-t border-[#232738]">
            <span className="px-2 py-1 bg-[#00ffd0] text-black font-bold">{product.category.name}</span>
            {product.brand && <span className="px-2 py-1 border border-white/15 text-[#8b8fa3]">{product.brand.name}</span>}
            {product.isFeatured && <span className="px-2 py-1 bg-[#ff2a6d] text-white font-bold">FEATURED</span>}
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-black leading-tight" style={{ fontFamily: "var(--font-display)" }}>{product.name}</h1>
          <div className="text-sm leading-relaxed text-[#8b8fa3]">{product.description}</div>

          <div className="flex items-baseline gap-3 border-y border-[#232738] py-4">
            <span className="text-3xl font-black">{formatPrice(product.price)}</span>
            <span className="text-xs font-mono text-[#8b8fa3]">+ installation · Taxes included</span>
          </div>

          <AddToCart slug={product.slug} />

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#0f1117] border border-[#232738] p-3">
              <div className="font-bold uppercase tracking-widest">Install</div>
              <div className="text-[#8b8fa3] mt-1">Licensed ripperdoc. 45 min. Local anesthetic included.</div>
            </div>
            <div className="bg-[#0f1117] border border-[#232738] p-3">
              <div className="font-bold uppercase tracking-widest">Warranty</div>
              <div className="text-[#8b8fa3] mt-1">12 months. Void if you mod it yourself, choom.</div>
            </div>
          </div>

          <div className="text-xs font-mono text-[#8b8fa3] border border-[#232738] p-3 bg-[#0f1117]">
            <div className="font-bold text-white uppercase tracking-widest text-xs">Specs</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between"><span>System</span><span className="text-white">{product.category.name}</span></div>
              <div className="flex justify-between"><span>Manufacturer</span><span className="text-white">{product.brand?.name ?? "— Generic"}</span></div>
              <div className="flex justify-between"><span>Slug</span><span className="text-white">{product.slug}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Ratings slug={slug} initial={ratings} />
      </div>
    </div>
  );
}
