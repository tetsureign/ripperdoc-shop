const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

function apiBase() {
  // Use Next.js rewrite proxy when no env is set
  if (API_URL) return API_URL;
  return "";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${apiBase()}${path}`;
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json() as Promise<T>;
  return undefined as T;
}

// Client-side axios-like helper for mutations (uses fetch with credentials)
export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body !== undefined ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

// Server-side helpers (no credentials, public endpoints) — with short timeout so build doesn't stall when API is down
export async function fetchPublic<T>(path: string): Promise<T | null> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${base}${path}`, { next: { revalidate: 30 }, signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
