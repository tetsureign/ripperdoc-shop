# Ripperdoc Shop — Customer Storefront Elevation & Cyberware Builder Plan

## Executive Summary

The customer frontend (`apps/customer`) is a working Next.js 15 App Router storefront connected to the .NET 8 Web API via same-origin proxy rewrites. The authentication, cart mutations, and order lifecycle have been verified end-to-end.

Rather than a destructive ground-up rewrite, this plan focuses on an **in-place aesthetic and functional elevation**:
1. **Ditching AI-Prototype Tropes**: Retiring the wide, dated `Orbitron` font and full-screen CRT scanlines, while keeping and elevating **Rajdhani** as the core typographic identity alongside the vibrant Night City palette (neon cyan `#00ffd0` & hot pink `#ff2a6d`).
2. **Catalog Usability**: Upgrading `/shop` with reactive faceted filtering (by body system and manufacturer) and search.
3. **The Signature Feature**: Implementing an interactive **Cyberware Loadout Builder** (`/builder`) that lets users configure body slots, monitor cyberware capacity/cyberpsychosis risk, and batch-install builds directly into the cart.

---

## Architecture & Boundary Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                   VERIFIED HEADLESS FOUNDATION (PRESERVED)             │
│  - lib/api.ts (Proxy-aware relative fetch client, auth cookies)        │
│  - lib/types.ts (Data contracts matching .NET DTOs)                    │
│  - hooks/use-auth.tsx (Zustand auth session & cookies)                 │
│  - hooks/use-cart.tsx (Zustand loadout & slug-based cart operations)   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   TARGET PRESENTATION LAYER                            │
│                                                                        │
│  Phase 1: Typography & Design Tokens                                   │
│  ├─ Keep Rajdhani as core UI/body font; retire Orbitron & scanlines    │
│  ├─ Display: Rajdhani 700 Heavy (or Chakra Petch) for sharp headers    │
│  └─ Formalize Tailwind 4 theme tokens (replace scattered hexes)        │
│                                                                        │
│  Phase 2: Shell, Catalog & Data Polish                                 │
│  ├─ Fix layout collisions (Next dev badge, text truncation)            │
│  ├─ Reactive faceted filters (Category / Brand / Price) on /shop       │
│  ├─ Clean up database seed relics (remove "Wheeee" / "Hiii" test tags) │
│  └─ Refine Product Detail schematic & Order tracking views             │
│                                                                        │
│  Phase 3: Signature Cyberware Loadout Builder (/builder)               │
│  ├─ Interactive Anatomical Mannequin (Body slot targets)               │
│  ├─ Real-time Cyberware Capacity & Humanity meter                      │
│  └─ One-click batch checkout via useCartStore.add(slug, 1)             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 0: Contract Synchronization (COMPLETED)

- [x] Switched `CartCreateDto` to accept `ProductSlug` instead of requiring database `ProductId`.
- [x] Synchronized `apps/customer/hooks/use-cart.tsx` to pass `{ productSlug, quantity }`.
- [x] Streamlined `apps/customer/components/add-to-cart.tsx` to directly dispatch slugs without fallback probes.
- [x] Fixed `apps/customer/lib/api.ts` so browser client requests always use relative paths (`""`) through the Next.js rewrite proxy, resolving CORS blocks.
- [x] Added missing `.Include(x => x.Product.Category).Include(x => x.Product.Brand)` in backend `GetMyCartQuery` so items render full metadata.
- [x] Verified complete flow: `Register / Login` → `Add to Cart` → `View Cart` → `Place Order` → `Order Details & Snapshots`.

---

## Phase 1: Typography & Design Tokens (1–2 Days)

### 1.1 Typography Strategy
- **Primary Typeface**: **Rajdhani**
  - **Body, UI, & Metadata**: Rajdhani Regular/Medium/SemiBold (500, 600). Clean, condensed, geometric, and highly legible.
  - **Headings & Impact Titles**: Rajdhani Bold / Black (700, 800) with tight tracking (`tracking-tight uppercase`). Eliminates font mismatch and creates an immediate cohesive brand identity.
  - *(Alternative display accent)*: **Chakra Petch** for high-tech badge/tab labels if mechanical cut corners are desired.
- **Monospace**: **JetBrains Mono**
  - Retained strictly for numeric Eurodollar prices, telemetry metrics, timestamps, and serial IDs.
- **Retired**:
  - ❌ `Orbitron`: Causes awkward wrapping, dated arcade feel, and AI-prototype vibes.
  - ❌ Full-screen CRT scanline overlay (`body::before`): Blurs text rendering and adds visual fatigue.

### 1.2 Palette & Tokenization
- **Retain the Core Palette**:
  - Background Base: Pitch carbon `#07080c` / `#090a0f`
  - Cards & Containers: Deep charcoal `#0f1117`
  - Primary Neon Accent: Electric cyan `#00ffd0`
  - Status & Warning Accent: Hot neon pink `#ff2a6d`
  - Inactive / Subtle: Slate grey `#8b8fa3`
- **Tokenize in Tailwind 4 (`globals.css`)**:
  - Replace arbitrary inline hexes (`border-[#232738]`, `bg-[#0f1117]`, `text-[#8b8fa3]`) with semantic utility classes:
    `bg-background`, `bg-card`, `border-border`, `text-primary`, `text-accent`, `text-muted-foreground`.

### 1.3 Tactile UI Primitives
- **Button**: Chamfered corner geometry via `clip-path`, crisp active click indent, high-contrast states.
- **Badge**: Minimalist terminal style (`SYS // 01`, `MFG // KIROSHI`).
- **Cart Sheet / Drawer**: Slide-over quick drawer for the cart so users can check their loadout without leaving their current page.

---

## Phase 2: Shell, Catalog & Data Polish (2–3 Days)

### 2.1 Navigation & Shell Polish
- Resolve layout collision: Adjust z-index / bottom margins so the Next.js dev overlay badge doesn't obscure the scanner controls or warning ribbon.
- Fix text overflow / truncation in the scanner wall vertical selection list.

### 2.2 Catalog & Shop Upgrades (`/shop`)
- **Reactive Sidebar Filters**:
  - Connect the existing Systems (categories) and Manufacturers (brands) into reactive URL search parameters (`?category=...&brand=...`).
  - Add search input for live filtering by product name.
  - Add price sorting (Ascending / Descending Eurodollars).
- **Datasheet / Grid Toggle**:
  - Allow users to switch between visual showcase cards and a dense, technical data-sheet view (reminiscent of clinical hardware manifests).

### 2.3 Data Quality & Seeding
- Remove dummy database entries (`SYS // WHEEEE`, `SYS // HIII`) from local database categories.
- Replace random landscape/pet Picsum photo seeds with themed cyberpunk equipment/tech imagery.

---

## Phase 3: The Signature Feature — Cyberware Loadout Builder (3–5 Days)

A dedicated route (`/builder`) functioning as an interactive character sheet / PCPartPicker for chrome.

```
┌────────────────────────────────────────────────────────────────────────┐
│                    CYBERWARE LOADOUT CONFIGURATOR                      │
├───────────────────────────────┬────────────────────────────────────────┤
│      ANATOMICAL MANNEQUIN     │         SLOT INSPECTOR & WARE          │
│                               │                                        │
│         [ Ocular ]            │  SLOT: OCULAR SYSTEM                   │
│             │                 │  Current: Kiroshi Optics Mk.4          │
│      [ Neural / OS ]          │                                        │
│             │                 │  Available Upgrades:                   │
│      [ Circulatory ]          │  ┌──────────────────────────────────┐  │
│             │                 │  │ Kiroshi Optics Mk.4       § 4,200│  │
│        [ Skeleton ]           │  │ +24% Scan Speed  | Cap: 14       │  │
│        ╱          ╲           │  └──────────────────────────────────┘  │
│   [ Arms ]      [ Legs ]      │  ┌──────────────────────────────────┐  │
│                               │  │ Militech "Stalker" Eye    § 3,800│  │
│                               │  │ +Threat Tracking | Cap: 18       │  │
│                               │  └──────────────────────────────────┘  │
├───────────────────────────────┴────────────────────────────────────────┤
│ TELEMETRY: 6 / 7 Slots Filled | Capacity: 82/100 | Total: § 48,500 ED   │
│ [ Reset Loadout ]                      [ Install Full Loadout → Cart ] │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Slot Architecture
- Categories map naturally to body slots:
  - **Frontal Cortex / Operating System**
  - **Ocular System**
  - **Circulatory System**
  - **Integumentary System**
  - **Skeletal Structure**
  - **Arms / Hands**
  - **Legs**
- Interactive SVG wireframe body with clickable hot spots that open the slot inspector drawer.

### 3.2 Gameified Telemetry
- **Cyberware Capacity & Humanity Meter**: Live accumulator bar. If total capacity exceeds 100%, trigger warning state with cyberpsychosis glitch visuals.
- **Total Install Cost**: Live calculation of hardware total + clinic installation fee.

### 3.3 Zero-Overhead Checkout Integration
- Takes advantage of the slug-based cart API:
  - Clicking `"Install Full Loadout"` iterates through all equipped slots:
    ```typescript
    for (const [slot, slug] of Object.entries(loadout)) {
      if (slug) await useCartStore.getState().add(slug, 1);
    }
    router.push("/cart");
    ```
  - Requires zero backend migrations or new aggregate endpoints.

---

## Verification & Completion Criteria

1. **Backend**:
   - `dotnet test backend/RipperdocShop.sln` passes with 0 failures.
2. **Frontend**:
   - `pnpm --filter ripperdoc-shop-customer lint` reports 0 warnings/errors.
   - `pnpm --filter ripperdoc-shop-customer build` completes successfully.
3. **Usability**:
   - Typography renders cleanly with Rajdhani + JetBrains Mono across all screen resolutions.
   - Cart, Order, and Builder flows operate reliably without CORS issues or page reloads.
