"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/hooks/use-auth";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password);
      toast.success("Account created — you are jacked in");
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-[480px] mx-auto px-4 sm:px-6 py-12">
      <div className="border border-[#232738] bg-[#0f1117] p-6">
        <div className="text-[11px] font-mono tracking-widest uppercase text-[#00ffd0]">New Client Registration</div>
        <h1 className="mt-2 text-2xl font-black uppercase" style={{ fontFamily: "var(--font-display)" }}>Get chromed</h1>
        <p className="mt-1 text-sm text-[#8b8fa3]">Create a Customer account to add ware to your loadout. Already have one? <Link href="/login" className="text-[#00ffd0] underline">Jack in</Link></p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@night.city" type="email" required className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest">Password</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-1" />
            <div className="text-xs text-[#8b8fa3] mt-1">Min 6 chars. Use a strong one — netrunners are everywhere.</div>
          </div>
          <Button type="submit" disabled={loading} className="w-full mt-2">{loading ? "Registering..." : "Create Account"}</Button>
        </form>
      </div>
    </div>
  );
}
