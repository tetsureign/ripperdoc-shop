"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/hooks/use-auth";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Jacked in");
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-[480px] mx-auto px-4 sm:px-6 py-12">
      <div className="border border-[#232738] bg-[#0f1117] p-6">
        <div className="text-[11px] font-mono tracking-widest uppercase text-[#00ffd0]">Authentication // Jack In</div>
        <h1 className="mt-2 text-2xl font-black uppercase" style={{ fontFamily: "var(--font-display)" }}>Welcome back, choom</h1>
        <p className="mt-1 text-sm text-[#8b8fa3]">Use your Night City credentials. New here? <Link href="/register" className="text-[#00ffd0] underline">Create account</Link></p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@night.city" type="email" required className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest">Password</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-1" />
          </div>
          <Button type="submit" disabled={loading} className="w-full mt-2">{loading ? "Connecting..." : "Jack In"}</Button>
        </form>
        <div className="mt-4 text-xs font-mono text-[#8b8fa3]">Demo: register a new Customer account, then log in. Admin accounts are separate.</div>
      </div>
    </div>
  );
}
