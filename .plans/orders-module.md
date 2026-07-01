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
- [x] Typed error hierarchy: `OrderNotFoundException`, `InvalidOrderTransitionException` — see **Error Handling** section
- [x] Domain events as simple records on the aggregate (inspectable in tests, no event bus needed yet) — see **Domain Events** section

### Day 3: Application Layer
- [x] `PlaceOrderCommand` — atomic: validate cart, create order from cart items, clear cart
- [x] `CancelOrderCommand` — customer-facing, only if `Pending`
- [x] `ShipOrderCommand` — admin only, `order.Ship()`
- [x] `CompleteOrderCommand` — admin only, `order.Complete()`
- [x] `ListMyOrdersQuery` — customer's own orders
- [x] `GetOrderDetailsQuery` — order + items
- [x] `ListAdminOrdersQuery` — with status filter + pagination
- [x] Register all handlers in `AppModulesServiceCollectionExtensions.cs`

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

## Error Handling

Mental model: **typed exceptions** are for when the only handler is the HTTP layer mapping to a status code. **Result pattern** is for when other business logic inside the app needs to branch on the failure.

Orders only needs typed exceptions — nothing inside the app branches on order failures, the HTTP layer just maps them to status codes.

**Base class** (`Infrastructure/Errors/DomainException.cs`):
```csharp
public abstract class DomainException(string message, int statusCode) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}
```

**Order-specific exceptions** (`Modules/Orders/Errors/`):
```csharp
public class OrderNotFoundException(Guid id)
    : DomainException($"Order {id} not found.", StatusCodes.Status404NotFound);

public class InvalidOrderTransitionException(OrderStatus from, OrderStatus to)
    : DomainException($"Cannot transition order from {from} to {to}.", StatusCodes.Status409Conflict);
```

**Update `ApiExceptionHandler`** to match on `DomainException` first:
```csharp
var (statusCode, title) = exception switch
{
    DomainException domain => (domain.StatusCode, "Domain error"),
    ArgumentException      => (StatusCodes.Status400BadRequest, "Invalid request"),
    _                      => (StatusCodes.Status500InternalServerError, "Unexpected error")
};
```

New exceptions are picked up automatically — the handler never needs to know about specific types.

> **Convention:** errors live in `Modules/Orders/Errors/`, co-located with the use cases that throw them (same as obsync's `vault/errors/`).

---

## Domain Events

No MediatR, no event bus — collect on the aggregate, dispatch after `SaveChangesAsync`.

**Interface** (`Models/IDomainEvent.cs`):
```csharp
public interface IDomainEvent { }
```

**On the aggregate** (`Order.cs`):
```csharp
private readonly List<IDomainEvent> _domainEvents = [];
public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();
public void ClearDomainEvents() => _domainEvents.Clear();
private void Raise(IDomainEvent e) => _domainEvents.Add(e);
```

**Events to raise** (`Modules/Orders/Events/`):

| Method | Event | Payload |
|---|---|---|
| `Place()` | `OrderPlacedEvent` | `OrderId, UserId, Total` |
| `Cancel()` | `OrderCancelledEvent` | `OrderId, UserId` |
| `Ship()` | `OrderShippedEvent` | `OrderId` |
| `Complete()` | `OrderCompletedEvent` | `OrderId` |

**Dispatch in the command** (after save):
```csharp
var events = order.DomainEvents.ToList();
order.ClearDomainEvents();
// for now: log each event
// later: hand off to a real dispatcher
```

Value today: **tests can assert events were raised** by inspecting `order.DomainEvents`. Easy to upgrade to a real dispatcher later without touching the domain.

---

## Interview Story

> "Orders was the hardest part to model. I used an aggregate root to enforce that order items can only be mutated through the order itself. The `Order.Place()` method validates the cart isn't empty, computes the total atomically, and raises a domain event. State transitions are guarded — you can't cancel a completed order, you can't ship a cancelled one. The checkout is a single EF transaction."

---

## Patterns to Reuse from Obsync

- Step transition guards (`startStepOrThrow`) -> `Order` status transition guards
- Typed error hierarchy -> `OrderNotFoundException`, `InvalidOrderTransitionException`
- Best-effort persistence pattern -> if a notification fails post-order, don't roll back the order
