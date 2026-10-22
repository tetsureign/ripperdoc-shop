# RipperdocShop Portfolio Sprint Roadmap

Prioritized implementation guide for completing RipperdocShop as a high-impact .NET 8 / fullstack portfolio showcase.

---

## Sprint Overview

```
Phase 1: Domain Invariant Tests (Order Aggregate & Commands)
   │
   ▼
Phase 2: Contract Alignment & Storefront Loop (COMPLETED via ProductSlug)
   │
   ▼
Phase 3: Customer Storefront Elevation & Cyberware Builder (/builder)
   │
   ▼
Phase 4: CI/CD Quality Gate (GitHub Actions for Tests & Linting)
   │
   ▼
Phase 5: Event-Driven Architecture (MassTransit + RabbitMQ + EF Core Outbox)
   │
   ▼
Phase 6: Production Readiness & Showcase Media (Live Demo + README Demo GIF)
```

---

## Phase 1: Domain Invariant Tests (Order Aggregate)

**Goal:** Establish rigorous test coverage for the Tactical DDD [`Order`](../backend/RipperdocShop.Api/Models/Entities/Order.cs) aggregate root and command handlers, proving domain rules without database dependency.

### Steps
1. Create `backend/RipperdocShop.Tests/Modules/Orders/OrderAggregateTests.cs`:
   - Test instantiation via `Order.Place` (calculates total price correctly, records order items, raises `OrderPlacedEvent`).
   - Test valid state transitions:
     - `Order.Ship()` transitions `Pending` $\rightarrow$ `Shipped` and raises `OrderShippedEvent`.
     - `Order.Complete()` transitions `Shipped` $\rightarrow$ `Completed` and raises `OrderCompletedEvent`.
     - `Order.Cancel()` transitions `Pending` $\rightarrow$ `Cancelled` and raises `OrderCancelledEvent`.
   - Test invalid state transitions throw `InvalidOrderStateTransitionException`:
     - Cannot cancel an already completed or shipped order.
     - Cannot ship an order that is not `Pending`.
     - Cannot complete an order that is not `Shipped`.
2. Create `backend/RipperdocShop.Tests/Modules/Orders/PlaceOrderCommandTests.cs`:
   - Test `PlaceOrderCommand.ExecuteAsync` throws `EmptyCartException` when user cart is empty.
   - Test clearing domain events after processing.

### Completion Criteria
- [ ] `dotnet test backend/RipperdocShop.sln` passes with 0 failures and includes new order aggregate and command tests.

---

## Phase 2: Contract Alignment & Storefront Loop (COMPLETED)

**Goal:** Remove prototype duct tape and verify that the complete end-to-end shopping loop functions smoothly across the API and customer storefront.

### Resolution Summary
- **DTO Alignment**: Updated [`CartCreateDto`](../backend/RipperdocShop.Shared/DTOs/Carts/CartCreateDto.cs) to take `ProductSlug` instead of requiring database GUIDs, seamlessly matching the public catalog contracts.
- **Frontend Sync**: Updated [`use-cart.tsx`](../apps/customer/hooks/use-cart.tsx) and [`add-to-cart.tsx`](../apps/customer/components/add-to-cart.tsx) to dispatch slugs directly.
- **Proxy Routing**: Fixed [`lib/api.ts`](../apps/customer/lib/api.ts) to ensure client-side browser requests use relative paths (`""`) through the Next.js rewrite proxy, bypassing CORS restrictions.
- **Data Loading**: Resolved missing `.Include()` in `GetMyCartQuery` so cart items reliably display Category and Brand metadata.

### Completion Criteria
- [x] `dotnet test backend/RipperdocShop.sln` passes with 0 failures.
- [x] `pnpm --filter ripperdoc-shop-customer lint` reports 0 errors.
- [x] Verified full purchasing loop: `Register / Login` $\rightarrow$ `Add to Cart` $\rightarrow$ `View Loadout` $\rightarrow$ `Place Order` $\rightarrow$ `Order Confirmation & Item Snapshots`.

---

## Phase 3: Customer Storefront Elevation & Cyberware Builder

**Goal:** Elevate the customer storefront from an "AI-vibecoded prototype" into a bespoke, high-craft web app featuring a signature **Cyberware Loadout Builder** (consult [.plans/customer-frontend-redesign.md](customer-frontend-redesign.md) for full architectural specs).

### Steps
1. **Typography & Token Polish**:
   - Keep and elevate **Rajdhani** as the primary font (regular/medium for UI & body, bold 700 with tight tracking for headlines).
   - Retire the dated `Orbitron` font and the global CRT scanline overlay (`body::before`) to restore crisp legibility.
   - Retain the signature Night City palette (deep carbon base, electric cyan `#00ffd0`, and hot pink `#ff2a6d`), formalizing them into Tailwind 4 theme tokens.
2. **Catalog Usability (`/shop`)**:
   - Upgrade `/shop` sidebar into reactive faceted filters (filtering by Body System, Brand, and Price via URL search params).
   - Add product search input and toggle between visual grid cards and clinical datasheet table view.
   - Clean up database test entries (`SYS // WHEEEE`, `SYS // HIII`) and replace random stock images with authentic cyberware art.
3. **The Signature Cyberware Builder (`/builder`)**:
   - Implement interactive anatomical mannequin with body slot targets (Ocular, Neural/OS, Circulatory, Skeleton, Limbs).
   - Add real-time telemetry (Eurodollar tally and Cyberware Capacity / Humanity meter with overload warning states).
   - Wire batch checkout directly to `useCartStore.add(slug, 1)` with zero backend friction.

### Completion Criteria
- [ ] `pnpm --filter ripperdoc-shop-customer lint` reports 0 errors.
- [ ] `pnpm --filter ripperdoc-shop-customer build` completes successfully.
- [ ] Cyberware Builder allows selecting slot items and adding the entire build to the cart with one click.

---

## Phase 4: CI/CD Quality Gate (GitHub Actions)

**Goal:** Automate test execution, linting, and build verification on every push and pull request.

### Steps
1. Create `.github/workflows/ci.yml`:
   - Trigger on `push` to `main` and all `pull_request` events.
   - Job 1: .NET Build & Test (`dotnet test backend/RipperdocShop.sln --configuration Release`).
   - Job 2: Frontend Lint & Typecheck (`pnpm lint` and `pnpm build` across apps).
2. Add passing status badge to root `README.md`.

### Completion Criteria
- [ ] Workflow validates successfully on GitHub Actions runner with green status.

---

## Phase 5: Event-Driven Processing (MassTransit & RabbitMQ)

**Goal:** Replace console-logged domain events with resilient, asynchronous message brokering using MassTransit and the EF Core Transactional Outbox.

### Steps
1. Infrastructure:
   - Add `rabbitmq:3-management-alpine` service to `compose.yaml` with ports `5672` and `15672`.
2. Backend Packages:
   - Add `MassTransit.RabbitMQ` and `MassTransit.EntityFrameworkCore` to `RipperdocShop.Api`.
3. Configuration (`Program.cs`):
   - Configure MassTransit with RabbitMQ transport.
   - Configure EF Core Outbox with `ApplicationDbContext` to ensure atomic DB + message commits.
4. Publishing:
   - In `PlaceOrderCommand.cs`, map domain events (`OrderPlacedEvent`) to an integration event (e.g. `OrderPlacedIntegrationEvent`) published via `IPublishEndpoint`.
5. Consumer:
   - Create `backend/RipperdocShop.Api/Modules/Orders/Consumers/OrderPlacedConsumer.cs` to handle post-order processing (e.g., mock invoice generation, inventory sync, or clinic notification dispatch).

### Completion Criteria
- [ ] Order placement saves order and outbox message in a single transaction.
- [ ] Consumer executes asynchronously from RabbitMQ queue with retry/DLQ configured.
- [ ] RabbitMQ management console displays queue topology and message flow.

---

## Phase 6: Production Readiness & Showcase Media

**Goal:** Deploy demo instance and capture high-leverage media for the repository `README.md`.

### Steps
1. Real Health Checks:
   - Add `AspNetCore.HealthChecks.Npgsql` to `RipperdocShop.Api`.
   - Update `Program.cs` from static string to `app.MapHealthChecks("/health")` verifying database connectivity.
2. Demo Deployment:
   - Deploy Docker Compose stack to a low-cost VPS (Caddy/Traefik reverse proxy handling SSL and CORS).
3. Showcase Media:
   - Record a 30–45 second demo clip (Loom or screen-to-GIF) highlighting:
     1. **The Cyberware Loadout Builder**: selecting implants, checking capacity, and batch-installing.
     2. **Checkout & Order Creation**: loadout review, clinic notes, and order placement.
     3. **Admin Dashboard**: order status management and catalog operations.
   - Embed GIF directly at the top of the root `README.md`.

### Completion Criteria
- [ ] `/health` responds with database liveness checks.
- [ ] Root `README.md` features embedded demo GIF, architecture overview, and setup commands.
