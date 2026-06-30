# Orders Module Plan

Tactical DDD applied to the e-com Orders flow.

## DDD Concepts This Module Unlocks

| Concept | Application |
|---|---|
| **Aggregate Root** | `Order` owns `OrderItems` — items can't exist without an order, all mutations go through `Order` |
| **Value Objects** | `Money`, `ShippingAddress` (if added later) |
| **State Machine** | `OrderStatus` transitions with guards — can't cancel a Completed order, can't ship a Cancelled one |
| **Domain Events** | `OrderPlaced`, `OrderCancelled`, `OrderShipped` — decouple side effects |
| **Invariants** | Can't place an empty order. Total is computed by the aggregate, not stored raw |
| **Transaction boundary** | Cart → Order is one atomic EF operation (create order, clear cart) |

> **Core design rule:** `OrderItems` is a private collection. Nothing should ever `new OrderItem()` directly — only `Order.Place(cartItems)` can add items. That single decision is what makes it a real aggregate vs. just a parent-child relationship.

---

## Week Plan

### Day 1-2: Domain Layer
- [x] Redesign `Order.cs` as a proper aggregate root
  - Private `List<OrderItem>` collection
  - `Order.Place(cartItems)` — validates cart non-empty, computes total, populates items
  - `Order.Cancel()` — guard: only if `Pending`
  - `Order.Ship()` — guard: only if `Pending`
  - `Order.Complete()` — guard: only if `Shipping`
- [x] `OrderItem` — no public constructor, only creatable via `Order`
- [ ] Typed error hierarchy: `OrderNotFoundError`, `OrderAlreadyCancelledError`, `InvalidOrderTransitionError`
- [ ] Domain events as simple records on the aggregate (inspectable in tests, no event bus needed yet)

### Day 3: Application Layer
- [ ] `PlaceOrderCommand` — atomic: validate cart, create order from cart items, clear cart
- [ ] `CancelOrderCommand` — customer-facing, only if `Pending`
- [ ] `UpdateOrderStatusCommand` — admin: `Ship`, `Complete`
- [ ] `ListMyOrdersQuery` — customer's own orders
- [ ] `GetOrderDetailsQuery` — order + items
- [ ] `ListAdminOrdersQuery` — with status filter + pagination
- [ ] Register all handlers in `AppModulesServiceCollectionExtensions.cs`

### Day 4: API + Tests
- [ ] `OrdersController` — customer routes + admin routes
- [ ] Unit tests for aggregate state machine transitions
- [ ] Integration test for full `PlaceOrder` flow (add to cart -> checkout -> order exists, cart cleared)
- [ ] Add `dotnet test` step to `.github/workflows/publish-ghcr.yml`

### Day 5: Frontend (Admin)
- [ ] Orders list page with status badges
- [ ] Order detail view with line items
- [ ] Status update action (Ship / Complete / Cancel)

### Day 6-7: Polish
- [ ] Wire everything up end-to-end
- [ ] README update explaining the architecture decisions
- [ ] Review for any missing edge cases

---

## Interview Story

> "Orders was the hardest part to model. I used an aggregate root to enforce that order items can only be mutated through the order itself. The `Order.Place()` method validates the cart isn't empty, computes the total atomically, and raises a domain event. State transitions are guarded — you can't cancel a completed order, you can't ship a cancelled one. The checkout is a single EF transaction."

---

## Patterns to Reuse from Obsync

- Step transition guards (`startStepOrThrow`) -> `Order` status transition guards
- Typed error hierarchy -> `OrderNotFoundError`, `InvalidOrderTransitionError`
- Best-effort persistence pattern -> if a notification fails post-order, don't roll back the order
