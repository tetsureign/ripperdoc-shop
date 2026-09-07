# Ripperdoc Shop — Customer Storefront Redesign & Cyberware Builder Plan

## Executive Summary

The current customer frontend (`apps/customer`) functions as a working prototype with functioning routing, proxy rewrites, authentication cookies, and Zustand stores. However, the visual layer relies on generic, AI-generated cyberpunk clichés (Orbitron font, synthwave cyan/magenta neon, global scanlines, and rigid 1px box stacks) and lacks core e-commerce catalog depth.

This plan outlines an iterative, 3-phase overhaul that preserves existing headless logic while transforming the storefront into a distinctive, high-craft digital experience centered around a signature **Cyberware Loadout Builder**.

---

## Architecture Seam & Boundary Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        EXISTING HEADLESS CORE                          │
│  - lib/api.ts (Proxy-aware typed fetch client)                         │
│  - lib/types.ts (Data contracts)                                       │
│  - hooks/use-auth.tsx (Zustand auth session & cookies)                 │
│  - hooks/use-cart.tsx (Zustand loadout & cart operations)              │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Preserved
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       REDESIGNED PRESENTATION LAYER                    │
│                                                                        │
│  Phase 1: Foundations                                                  │
│  ├─ Tailwind 4 Design Tokens (@theme inline)                           │
│  ├─ Custom Primitives (Chamfered buttons, telemetry badges, inputs)     │
│  └─ Typography: Industrial Grotesque + Technical Monospace             │
│                                                                        │
│  Phase 2: Shell & Catalog Redesign                                     │
│  ├─ HUD Header with Slide-Over Cart Drawer                             │
│  ├─ Shop Catalog: Faceted filters, search, and Grid/Datasheet toggle   │
│  ├─ Product Page: Medical blueprint schematic view                     │
│  └─ Cart / Checkout: Installation waiver & order tracking              │
│                                                                        │
│  Phase 3: Signature Cyberware Loadout Builder (/builder)               │
│  ├─ Interactive Anatomical Mannequin (SVG/Canvas slot targets)         │
│  ├─ Real-time Cyberware Capacity & Humanity meter                      │
│  └─ One-click "Install Loadout" batch checkout                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 0: Backend Contract Unblocking (Prerequisite)

Before rebuilding customer components, resolve the data contract gap where `ProductDto` omits its database identifier:

1. **DTO Update (`backend/RipperdocShop.Shared/DTOs/Products/ProductDto.cs`)**:
   - Add `public Guid Id { get; set; }` to `ProductDto`.
2. **Mapper Update (`backend/RipperdocShop.Api/Modules/Products/ProductMapper.cs`)**:
   - Map `Id = product.Id` in `ToDto()` and collection projections.
3. **Frontend Cart Cleanup (`apps/customer/components/add-to-cart.tsx`)**:
   - Remove the secondary `/api/products/{slug}` fetch workaround; receive and pass `product.id` directly.
4. **Verification**:
   - Run `dotnet test backend/RipperdocShop.sln` to guarantee 0 regressions across existing test suites.

---

## Phase 1: Design Tokens & UI Primitives (1–2 Days)

### 1.1 Aesthetic Direction & Typography
- **Retire**: `Orbitron`, `Rajdhani`, and artificial CSS scanline overlays (`body::before`).
- **Adopt**:
  - **Display / Headers**: *Chakra Petch* or *Geist Mono* (dense, technical, sharp).
  - **Body Text**: *Inter* or *Geist Sans* (ultra-readable, high contrast).
  - **Data / Metrics**: *JetBrains Mono* (retained for numeric telemetry, serial numbers, and prices).
- **Color Palette (Diegetic Medical Terminal)**:
  - Base Surfaces: Deep carbon `#090a0f`, slate card `#11141c`, elevated surface `#181c26`.
  - Border Accents: Muted steel `#252a3a`, active border `#3d445c`.
  - Primary Accent: Clinical hazard amber `#f59e0b` or surgical warning orange `#ff5500` (replacing generic neon cyan).
  - Secondary Accent: Subdued terminal teal `#06b6d4` for status indicators.

### 1.2 Component Primitives
Rebuild [apps/customer/components/ui/](file:///home/tetsureign/Development/RipperdocShop/apps/customer/components/ui) to establish tactile, industrial controls:
- **Button**: Angular chamfered corners using CSS `clip-path: polygon(...)`, active press indent, tactile hover state.
- **Badge / Chip**: Serial-number styling (`SYS // 04`, `STATUS: VERIFIED`), rarity tier coloring.
- **Drawer / Sheet**: Reusable slide-over container for mobile navigation and the persistent cart tray.
- **Input / Select**: Dark inset telemetry styling with focus brackets.

---

## Phase 2: Core E-Commerce Shell & Catalog (3–4 Days)

### 2.1 Navigation & Global Shell
- **Top HUD**: Compact diagnostic bar showing clinic location status, real-time clock, quick link to `/builder`, and cart count trigger.
- **Slide-Over Cart Tray**: Replaces the static `/cart` redirect with a slide-out drawer accessible from any product page without interrupting the browsing flow.

### 2.2 Catalog Experience (`/shop`)
- **Faceted Filtering**:
  - Filter by **Body System** (mapped to existing categories: Neural, Ocular, Circulatory, Skeletal, etc.).
  - Filter by **Manufacturer / Brand** (Dynalar, Arasaka, Militech, Kiroshi, etc.).
  - Price range slider and in-stock toggle.
- **Layout Modes**:
  - **Grid View**: High-impact cards with technical specs and installation difficulty.
  - **Datasheet / Table View**: High-density engineering view displaying slot requirements, price, manufacturer, and quick-add buttons.
- **Live Search**: URL-synchronized query parameter search with debounced backend queries.

### 2.3 Product Detail Page (`/product/[slug]`)
- Layout inspired by medical blueprints and engineering cutaways.
- Technical specification breakdown:
  - Body Slot / System
  - Installation Risk Rating
  - Compatibility Index
  - Manufacturer Origin
- Authentic customer review breakdown and verified ripperdoc endorsements.

### 2.4 Cart & Checkout
- "Loadout Manifest" summary itemizing all selected cyberware.
- Pre-installation health waiver checkbox.
- Clinic appointment slot selector and custom installation notes for the ripperdoc.

---

## Phase 3: The Signature Feature — Cyberware Loadout Builder (3–5 Days)

A dedicated route (`/builder` or `/loadout`) that functions as an interactive configurator.

```
┌────────────────────────────────────────────────────────────────────────┐
│                    CYBERWARE LOADOUT CONFIGURATOR                      │
├───────────────────────────────┬────────────────────────────────────────┤
│      ANATOMICAL MANNEQUIN     │         SLOT INSPECTOR & WARE          │
│                               │                                        │
│         [ Ocular ]            │  SLOT: OCULAR SYSTEM                   │
│             │                 │  Current: Kiroshi Optics Mk.3          │
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

### 3.1 Anatomy Mapping
- Body slots mapped directly to categories:
  - **Frontal Cortex / Operating System**
  - **Ocular System**
  - **Circulatory System**
  - **Integumentary System**
  - **Skeletal Structure**
  - **Arms / Hands**
  - **Legs**
- Interactive SVG mannequin highlighting equipped vs empty slots.

### 3.2 Real-time Telemetry & Game Mechanics
- **Cyberware Capacity Meter**: Each item consumes capacity (e.g. derived from tier or price). If capacity exceeds 100%, trigger warning state with cyberpsychosis alerts.
- **Cost Accumulator**: Live total price + estimated installation fee.
- **Export & Share**: Generate a unique URL or loadout code to share builds with other users.

### 3.3 Batch Cart Integration
- An "Install Full Loadout" button that commits all configured implants into the user's cart in one action via `useCartStore.add()`.

---

## Verification & Quality Gates

1. **Backend Tests**:
   - `dotnet test backend/RipperdocShop.sln` passes with 0 failures.
   - Tests verify that `ProductDto.Id` is populated on single and list queries.
2. **Frontend Quality**:
   - `pnpm --filter ripperdoc-shop-customer lint` reports 0 errors.
   - `pnpm --filter ripperdoc-shop-customer build` succeeds without SSR timeouts.
3. **Dead Code Elimination**:
   - Prune obsolete components (`featured-carousel.tsx`).
   - Remove hardcoded static telemetry numbers in favor of real DTO properties.
