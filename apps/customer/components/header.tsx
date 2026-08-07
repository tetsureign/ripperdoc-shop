"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ShoppingCart, User, LogOut, Menu, X, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/hooks/use-auth";
import { useCartStore } from "@/hooks/use-cart";
import { Button } from "./ui/button";

const nav = [
  { href: "/shop", label: "WARE" },
  { href: "/shop?featured=1", label: "FEATURED" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isFeatured = searchParams.get("featured") === "1";
  const isWare = pathname === "/shop" && !isFeatured;
  const { user, check, logout } = useAuthStore();
  const { items } = useCartStore();
  const count = items.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    check();
    // refresh cart on mount
    useCartStore.getState().refresh();
  }, [check]);

  return (
    <header className="sticky top-0 z-40 bg-[#07080c]/95 backdrop-blur border-b border-[#232738]">
      {/* top bar */}
      <div className="border-b border-[#00ffd0]/10 bg-[#00ffd0]/5">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex items-center justify-between h-7 text-[11px] tracking-widest uppercase font-mono">
          <span className="text-[#8b8fa3]">System: <span className="text-[#00ffd0]">ONLINE</span> — Night City — Watson District</span>
          <span className="hidden sm:inline text-[#8b8fa3]">Est. 2077 · Chrome certified · Trauma Team partner</span>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-[64px] flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 bg-[#00ffd0] flex items-center justify-center font-black text-black text-sm" style={{ fontFamily: "var(--font-display)" }}>R</div>
          <div className="leading-none">
            <div className="font-black tracking-tight text-[18px]" style={{ fontFamily: "var(--font-display)" }}>RIPPERDOC</div>
            <div className="text-[10px] tracking-[0.28em] text-[#00ffd0] font-mono -mt-0.5">CLINIC // SHOP</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-6">
          {nav.map((n) => {
            const active = (n.label === "WARE" && isWare) || (n.label === "FEATURED" && isFeatured && pathname === "/shop");
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`px-3 py-1.5 text-sm font-semibold tracking-wide uppercase border ${active ? "bg-white text-black border-white" : "text-[#8b8fa3] border-transparent hover:text-white hover:border-white/15"}`}
              >
                {n.label}
              </Link>
            );
          })}
          <Link href="/#categories" className="px-3 py-1.5 text-sm font-semibold tracking-wide uppercase text-[#8b8fa3] hover:text-white">CATALOG</Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/shop" className="hidden sm:inline-flex w-9 h-9 items-center justify-center border border-[#232738] hover:border-[#00ffd0]/40 hover:text-[#00ffd0] text-[#8b8fa3]">
            <Search className="w-4 h-4" />
          </Link>
          <Link href="/cart" className="relative w-9 h-9 flex items-center justify-center border border-[#232738] hover:border-[#00ffd0]/40 text-[#8b8fa3] hover:text-[#00ffd0]">
            <ShoppingCart className="w-4 h-4" />
            {count > 0 && <span className="absolute -top-1.5 -right-1.5 bg-[#ff2a6d] text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center px-1">{count}</span>}
          </Link>

          {user ? (
            <div className="hidden sm:flex items-center gap-2 ml-1">
              <Link href="/orders" className="h-9 px-3 flex items-center gap-2 border border-[#232738] text-xs font-bold tracking-widest uppercase hover:border-white/20">
                <User className="w-3.5 h-3.5" /> {user.username.split("@")[0].slice(0, 12)}
              </Link>
              <button
                onClick={async () => { await logout(); router.refresh(); }}
                className="w-9 h-9 flex items-center justify-center border border-[#232738] hover:border-[#ff2a6d]/40 hover:text-[#ff2a6d] text-[#8b8fa3]"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 ml-1">
              <Link href="/login"><Button size="sm" variant="ghost">Jack In</Button></Link>
              <Link href="/register"><Button size="sm">Register</Button></Link>
            </div>
          )}

          <button onClick={() => setOpen(!open)} className="md:hidden w-9 h-9 flex items-center justify-center border border-[#232738] text-[#8b8fa3]">
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#232738] bg-[#0f1117] px-4 py-4 space-y-3">
          <Link href="/shop" onClick={() => setOpen(false)} className="block py-2 font-bold uppercase tracking-wide">Ware</Link>
          <Link href="/#categories" onClick={() => setOpen(false)} className="block py-2 font-bold uppercase tracking-wide">Catalog</Link>
          <Link href="/cart" onClick={() => setOpen(false)} className="block py-2 font-bold uppercase tracking-wide">Cart ({count})</Link>
          {user ? (
            <>
              <Link href="/orders" onClick={() => setOpen(false)} className="block py-2 font-bold uppercase tracking-wide">Orders</Link>
              <button onClick={async () => { await logout(); setOpen(false); }} className="block py-2 font-bold uppercase tracking-wide text-[#ff2a6d]">Jack Out</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/login" onClick={() => setOpen(false)} className="flex-1"><Button className="w-full" variant="outline">Jack In</Button></Link>
              <Link href="/register" onClick={() => setOpen(false)} className="flex-1"><Button className="w-full">Register</Button></Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
