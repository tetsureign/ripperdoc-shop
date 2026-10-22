# Event-Driven Architecture Plan: MassTransit + RabbitMQ + EF Core Outbox

Implementation blueprint to elevate Ripperdoc Shop from clean synchronous CRUD to an asynchronous, distributed event-driven architecture using MassTransit, RabbitMQ, and the Transactional Outbox pattern.

---

## 1. Architectural Architecture & Data Flow

```
[ POST /api/orders ] (PlaceOrderCommand)
        │
        ▼
┌────────────────────────────────────────────────────────┐
│ PostgreSQL Transaction (Atomic Commit)                 │
│  ├── 1. Insert Order (Status: Pending)                 │
│  ├── 2. Remove Items from Cart                         │
│  └── 3. Save Outbox Message (OrderPlacedIntegration)   │
└────────────────────────────────────────────────────────┘
        │
        ▼ (MassTransit Background Publisher / Outbox Worker)
┌────────────────────────────────────────────────────────┐
│ RabbitMQ Exchange & Queues (Docker)                    │
│  Host: localhost:5672 | Web UI: localhost:15672        │
└────────────────────────────────────────────────────────┘
        │
        ├─────────────────────────────────┐
        ▼                                 ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│ ProcessOrderPaymentConsumer   │ │ SendOrderEmailConsumer        │
│ ├── Calls IPaymentGateway     │ │ ├── Calls IEmailNotification  │
│ └── Updates Order Status      │ │ └── Simulates / Dispatches    │
│     (Pending -> Paid / Failed)│ │     Customer Receipt          │
└───────────────────────────────┘ └───────────────────────────────┘
```

---

## 2. Prerequisites & Infrastructure Setup

### Task 2.1: Add RabbitMQ to `compose.yaml`
- Add the `rabbitmq:3-management-alpine` service with default credentials (`guest`/`guest`).
- Expose AMQP port `5672` and management dashboard port `15672`.

### Task 2.2: Add NuGet Dependencies
Add the following packages to `backend/RipperdocShop.Api/RipperdocShop.Api.csproj`:
- `MassTransit.RabbitMQ`
- `MassTransit.EntityFrameworkCore`

### Task 2.3: Configure EF Core Transactional Outbox & Migration
- In `ApplicationDbContext.OnModelCreating`, add MassTransit outbox entities:
  - `builder.AddInboxStateEntity();`
  - `builder.AddOutboxMessageEntity();`
  - `builder.AddOutboxStateEntity();`
- Generate and apply migration:
  ```bash
  dotnet ef migrations add AddMassTransitOutbox --project backend/RipperdocShop.Api
  dotnet ef database update --project backend/RipperdocShop.Api
  ```

---

## 3. MassTransit & Services Configuration

### Task 3.1: Service Registration in `Program.cs`
- Configure MassTransit with Entity Framework Core outbox:
  ```csharp
  builder.Services.AddMassTransit(x =>
  {
      x.AddEntityFrameworkOutbox<ApplicationDbContext>(o =>
      {
          o.UsePostgres();
          o.UseBusOutbox();
      });

      // Register Consumers
      x.AddConsumer<ProcessOrderPaymentConsumer>();
      x.AddConsumer<SendOrderConfirmationEmailConsumer>();

      x.UsingRabbitMq((context, cfg) =>
      {
          var host = builder.Configuration["RabbitMq:Host"] ?? "localhost";
          cfg.Host(host, "/", h =>
          {
              h.Username(builder.Configuration["RabbitMq:Username"] ?? "guest");
              h.Password(builder.Configuration["RabbitMq:Password"] ?? "guest");
          });

          cfg.ConfigureEndpoints(context);
      });
  });
  ```
- Configure connection settings in `appsettings.Development.json`.

---

## 4. Integration Events & Boundary Interfaces

### Task 4.1: Integration Event Contracts
Place shared integration events under `backend/RipperdocShop.Shared/Events/` or `Modules/Orders/Events/`:
- `OrderPlacedIntegrationEvent(Guid OrderId, Guid UserId, decimal TotalPrice, string Note, DateTime PlacedAt)`
- `OrderPaymentProcessedEvent(Guid OrderId, bool Success, string? TransactionId, string? FailureReason)`

### Task 4.2: Boundary Interfaces
Create abstractions for external dependencies:
- **Payment Gateway:**
  - Interface: `IPaymentGateway` with `Task<PaymentResult> ChargeAsync(Guid orderId, decimal amount, CancellationToken ct)`
  - Implementation: `SimulatedPaymentGateway` (configurable latency & success/failure toggle).
- **Email Notification:**
  - Interface: `IEmailService` with `Task SendOrderReceiptAsync(Guid orderId, string recipientEmail, decimal amount, CancellationToken ct)`
  - Implementation: `ConsoleEmailService` / `LocalLoggerEmailService`.

---

## 5. Command & Consumer Implementation

### Task 5.1: Update `PlaceOrderCommand`
- Inject `IPublishEndpoint`.
- Publish `OrderPlacedIntegrationEvent` right before `SaveChangesAsync()`.
- The outbox ensures the order and the message publication commit atomically to PostgreSQL.

### Task 5.2: Implement `ProcessOrderPaymentConsumer`
- Subscribes to `OrderPlacedIntegrationEvent`.
- Invokes `IPaymentGateway.ChargeAsync(...)`.
- On success:
  - Transition order to `Paid` (or mark payment reference).
- On failure:
  - Transition order to `Cancelled` with reason (or emit `OrderPaymentFailedEvent`).

### Task 5.3: Implement `SendOrderConfirmationEmailConsumer`
- Subscribes to `OrderPlacedIntegrationEvent` or `OrderPaymentProcessedEvent`.
- Invokes `IEmailService.SendOrderReceiptAsync(...)`.
- Demonstrates retry policies (e.g., retry 3 times with exponential backoff on transient errors).

---

## 6. Verification & Demo Criteria

1. **Local Test & Execution:**
   - Start RabbitMQ: `docker compose up -d rabbitmq` (or podman).
   - Verify dashboard accessible at `http://localhost:15672`.
   - Run backend API: `dotnet run --project backend/RipperdocShop.Api`.
2. **End-to-End Event Flow:**
   - Execute `POST /api/orders` to place an order.
   - Inspect PostgreSQL `outbox_messages` table to see the message queued and dispatched.
   - Inspect RabbitMQ Management UI to verify queue declarations and message throughput.
   - Verify background consumers log payment processing and email dispatch.
3. **Automated Integration Tests:**
   - Run `dotnet test backend/RipperdocShop.sln` ensuring MassTransit test harnesses verify consumer message handling.
