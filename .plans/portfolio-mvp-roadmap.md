# RipperdocShop Portfolio Sprint Roadmap

Prioritized implementation guide for completing RipperdocShop as a high-impact .NET 8 / fullstack portfolio showcase.

---

## Sprint Overview

```
Phase 1: Domain Invariant Tests (Order Aggregate)
   │
   ▼
Phase 2: Contract Alignment & E-Commerce Flow (ProductDto.Id + Cart/Checkout)
   │
   ▼
Phase 3: CI/CD Quality Gate (GitHub Actions for Tests & Linting)
   │
   ▼
Phase 4: Event-Driven Architecture (MassTransit + RabbitMQ + EF Core Outbox)
   │
   ▼
Phase 5: Production Readiness & Showcase Media (Live Demo + README Demo GIF)
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
- `dotnet test backend/RipperdocShop.sln` passes with 0 failures and includes new order tests.

---

## Phase 2: Contract Alignment & End-to-End Storefront Flow

**Goal:** Complete Phase 0 of [.plans/customer-frontend-redesign.md](customer-frontend-redesign.md), removing slug lookups and ensuring the complete purchasing loop works.

### Steps
1. Update `backend/RipperdocShop.Shared/DTOs/Products/ProductDto.cs`:
   - Add `public Guid Id { get; set; }`.
2. Update `backend/RipperdocShop.Api/Modules/Products/ProductMapper.cs`:
   - Map `Id = product.Id` in `ToDto()` and collection projections.
3. Update `apps/customer/components/add-to-cart.tsx` (and related stores):
   - Receive and use `product.id` directly; remove secondary slug fetch calls.
4. Verify Happy Path manually or via integration test:
   - Browse catalog $\rightarrow$ Add to Cart $\rightarrow$ Place Order $\rightarrow$ Order Details view.
   - Verify status updates in `apps/admin` propagate back to customer order status.

### Completion Criteria
- `dotnet test backend/RipperdocShop.sln` passes with 0 failures.
- `pnpm --filter ripperdoc-shop-customer lint` reports 0 errors.
- A user can create an order end-to-end without client-side console errors.

---

## Phase 3: CI/CD Quality Gate (GitHub Actions)

**Goal:** Automate test execution and linting on every push and pull request.

### Steps
1. Create `.github/workflows/ci.yml`:
   - Trigger on `push` to `main` and all `pull_request` events.
   - Job 1: .NET Build & Test (`dotnet test backend/RipperdocShop.sln --configuration Release`).
   - Job 2: Frontend Lint & Typecheck (`pnpm lint` and `pnpm build` across apps).
2. Add passing status badge to `README.md`.

### Completion Criteria
- Workflow validates successfully on GitHub Actions runner with green status.

---

## Phase 4: Event-Driven Processing (MassTransit & RabbitMQ)

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
   - Create `backend/RipperdocShop.Api/Modules/Orders/Consumers/OrderPlacedConsumer.cs` to handle post-order processing (e.g., mock invoice generation, inventory sync, or notification dispatch).

### Completion Criteria
- Order placement saves order and outbox message in a single transaction.
- Consumer executes asynchronously from RabbitMQ queue with retry/DLQ configured.
- RabbitMQ management console displays queue topology and message flow.

---

## Phase 5: Production Readiness & Showcase Media

**Goal:** Deploy demo instance and capture high-leverage media for the repository `README.md`.

### Steps
1. Real Health Checks:
   - Add `AspNetCore.HealthChecks.Npgsql` to `RipperdocShop.Api`.
   - Update `Program.cs` from static string to `app.MapHealthChecks("/health")` verifying database connectivity.
2. Demo Deployment:
   - Deploy Docker Compose stack to a low-cost VPS (Caddy/Traefik reverse proxy handling SSL and CORS).
3. Showcase Media:
   - Record a 30–45 second demo clip (Loom or screen-to-GIF) showing:
     1. Cyberware browsing & cart addition.
     2. Checkout & order creation.
     3. Admin order status management.
   - Embed GIF directly at the top of the root `README.md`.

### Completion Criteria
- `/health` responds with database liveness checks.
- Root `README.md` features embedded demo GIF, architecture overview, and setup commands.
