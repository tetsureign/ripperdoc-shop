# Ripperdoc Shop — Customer Storefront (Next.js)

Night City clinic storefront. Next.js 15 App Router + Tailwind 4 + Zustand. Connects to the existing .NET API (`RipperdocShop.Api`).

## Run

```bash
cd apps/customer
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL if needed (default: http://localhost:5000 via rewrites)
pnpm i
pnpm dev   # -> http://localhost:3001
pnpm build # production build
```

`next.config.ts` proxies `/api/*` to `NEXT_PUBLIC_API_URL` so browser requests stay same-origin (no CORS needed). Server components fetch directly with a 2.5s abort timeout so `next build` stays fast when the API is down.

## Theme

Derived from the admin's "Ripperdoc's Terminal" — dark base `#07080c`, neon cyan `#00ffd0` (primary), pink `#ff2a6d` (accent), mono `JetBrains Mono` + display `Orbitron` + body `Rajdhani`, subtle scanlines. Avoids AI-slop defaults (no purple gradients, no hero pill+2CTAs, no bento grid).

## Routes & API wiring

| Page | Route | API |
|------|-------|-----|
| Home (hero + featured) | `/` | `GET /api/products/featured`, `GET /api/products`, `GET /api/categories`, `GET /api/brands` |
| Shop (paginated) | `/shop?page=1`, `?featured=1` | `GET /api/products?page&pageSize=12` |
| Product | `/product/[slug]` | `GET /api/products/{slug}`, `GET /api/ratings/by-product/{slug}` + `POST /api/ratings` |
| Category | `/category/[slug]` | `GET /api/categories/{slug}`, `GET /api/products/category/{slug}` |
| Brand | `/brand/[slug]` | `GET /api/brands/{slug}`, `GET /api/products/brand/{slug}` |
| Cart | `/cart` | `GET /api/carts`, `POST /api/carts`, `POST /api/carts/{id}/quantity`, `DELETE /api/carts/{id}` |
| Orders | `/orders`, `/orders/[id]` | `GET /api/orders`, `GET /api/orders/{id}`, `POST /api/orders`, `POST /api/orders/cancel/{id}` |
| Auth | `/login`, `/register` | `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`, `GET /api/auth/whoami` |

Auth uses `AccessToken` HttpOnly cookie (`withCredentials: include` / `credentials: "include"`). Cart & Orders require Customer role.

## Known API gap

`ProductDto` (`RipperdocShop.Shared/DTOs/Products/ProductDto.cs`) currently omits `Id`. `POST /api/carts` requires `productId: Guid`, so the storefront cannot resolve the GUID from the public listing. `components/add-to-cart.tsx` is forward-compatible — it fetches `GET /api/products/{slug}` and reads `id`/`Id` once the DTO is fixed.

**Proposed fix (minimal):**

```csharp
// RipperdocShop.Shared/DTOs/Products/ProductDto.cs
public class ProductDto {
    public Guid Id { get; set; }  // add
    public string Name { get; set; } = string.Empty;
    // ...
}
// RipperdocShop.Api/Modules/Products/ProductMapper.cs
return new ProductDto {
    Id = product.Id, // add
    Name = product.Name,
    // ...
};
```

No breaking change for existing clients (additive).

## CORS

`Program.cs` `DevCors` currently allows only `AdminSite:URL`. With the Next.js rewrite proxy no browser CORS is triggered. If you set `NEXT_PUBLIC_API_URL` to a cross-origin URL directly, add the customer origin:

```csharp
policy.WithOrigins(
    builder.Configuration["AdminSite:URL"] ?? "",
    builder.Configuration["CustomerSite:URL"] ?? "http://localhost:3001"
)
```

## Structure

```
app/            — App Router pages & layout
components/     — header, footer, product-card, add-to-cart, ui/*
hooks/          — use-auth (zustand), use-cart (zustand)
lib/            — api helpers, types, utils
```
