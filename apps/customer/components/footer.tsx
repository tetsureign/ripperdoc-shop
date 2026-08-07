"use client";
import Link from "next/link";
import { useAuthStore } from "@/hooks/use-auth";
import { useEffect } from "react";

export default function Footer() {
  const { user, check } = useAuthStore();
  useEffect(() => { check(); }, [check]);
  return (
    <footer className="border-t border-[#232738] bg-[#0a0b0f] mt-12">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="font-black text-lg" style={{ fontFamily: "var(--font-display)" }}>RIPPERDOC</div>
          <div className="text-xs font-mono tracking-widest text-[#00ffd0]">CLINIC // SHOP</div>
          <p className="mt-3 text-sm text-[#8b8fa3] leading-relaxed max-w-[28ch]">
            Street-grade cyberware, neural lace, and chrome. Installed by licensed ripperdocs. No questions asked.
          </p>
          <div className="mt-4 flex gap-2 text-[11px] font-mono">
            <span className="px-2 py-1 border border-[#00ffd0]/20 text-[#00ffd0]">MEDICAL LICENSE #2077-RC</span>
            <span className="px-2 py-1 border border-white/10 text-[#8b8fa3]">Watson, NC</span>
          </div>
        </div>
        <div>
          <div className="text-xs font-bold tracking-widest uppercase text-white mb-3">Inventory</div>
          <div className="space-y-1.5 text-sm text-[#8b8fa3]">
            <Link href="/shop" className="block hover:text-white">All Ware</Link>
            <Link href="/shop?featured=1" className="block hover:text-white">Featured Chrome</Link>
            <Link href="/#categories" className="block hover:text-white">By Category</Link>
            <Link href="/#brands" className="block hover:text-white">By Manufacturer</Link>
          </div>
        </div>
        <div>
          <div className="text-xs font-bold tracking-widest uppercase text-white mb-3">Client</div>
          <div className="space-y-1.5 text-sm text-[#8b8fa3]">
            <Link href="/cart" className="block hover:text-white">Loadout / Cart</Link>
            <Link href="/orders" className="block hover:text-white">Installations</Link>
            {!user && <Link href="/login" className="block hover:text-white">Jack In</Link>}
            <span className="block text-xs font-mono text-[#8b8fa3]/60">Support: ripper@night.city</span>
          </div>
        </div>
        <div className="bg-[#0f1117] border border-[#232738] p-4">
          <div className="text-xs font-bold tracking-widest uppercase flex items-center gap-2"><span className="w-2 h-2 bg-[#00ffd0] animate-pulse" /> Clinic Status</div>
          <div className="mt-3 space-y-2 text-xs font-mono">
            <div className="flex justify-between"><span className="text-[#8b8fa3]">Surgeries today</span><span className="text-white">014</span></div>
            <div className="flex justify-between"><span className="text-[#8b8fa3]">Chrome in stock</span><span className="text-[#00ffd0]">1,248 units</span></div>
            <div className="flex justify-between"><span className="text-[#8b8fa3]">Rejection rate</span><span className="text-white">0.4%</span></div>
          </div>
          <div className="mt-3 text-[11px] text-[#8b8fa3]">Walk-ins welcome. Bring your own ice.</div>
        </div>
      </div>
      <div className="border-t border-[#232738] py-4">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row gap-2 justify-between text-xs font-mono text-[#8b8fa3]">
          <span>© 2077 Ripperdoc Clinic. Not liable for cyberpsychosis.</span>
          <span>Built for the street. Stay chrome, choom.</span>
        </div>
      </div>
    </footer>
  );
}
