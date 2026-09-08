# Backend Architecture & Domain Modeling

Reference for backend development in `backend/RipperdocShop.*`.

## Structure

The backend consists of three projects targeting .NET 8:
- `RipperdocShop.Api`: Web API application organized into vertical slice modules under `Modules/`.
- `RipperdocShop.Shared`: Cross-cutting DTOs and request/response contracts consumed by API and frontends.
- `RipperdocShop.Tests`: Unit and integration test suite using xUnit and EF Core InMemory.

## Local Development & Infrastructure

When developing locally, run PostgreSQL via Docker/Podman and run the .NET API directly on the host with `dotnet run`. Do not run the API container in Docker during local dev.

### 1. Database (PostgreSQL)
Start the PostgreSQL container from `compose.yaml`:
```bash
docker compose up -d postgres
# or using podman:
podman compose up -d postgres
```
- **Port**: `5432`
- **Default credentials** (from `appsettings.Development.json`): User `admin`, Password `password123`, Database `ripperdoc_shop`.

### 2. Running the API
Run the Web API using the `http` launch profile (listens on `http://localhost:5133`):
```bash
dotnet run --project backend/RipperdocShop.Api --launch-profile http
```
- **Automatic Migrations & Seeding**: `Program.cs` automatically executes `context.Database.MigrateAsync()` and seeds default roles and the initial admin user on boot.
- **Swagger UI**: Accessible at `http://localhost:5133/swagger` when running in `Development`.
- **Health Check**: `GET http://localhost:5133/health` returns `"Healthy"`.

### 3. Running Tests
Run the xUnit test suite:
```bash
dotnet test backend/RipperdocShop.sln
```

## Tiered Domain Modeling

Apply architecture according to entity lifecycle complexity:

### 1. Tactical DDD (Lifecycle Entities)
Use for business-critical entities with invariants and state machines (e.g., `Order`, `CartItem`).

- **Aggregate Root Encapsulation**: Keep child collections private (e.g., `_orderItems`), exposing only `IReadOnlyList<T>`. Never allow external code to instantiate or mutate child items directly.
- **Explicit Mutation Methods**: Invariants must be enforced on the root. Mutate state only through intention-revealing methods (e.g., `Order.Place(cartItems)`, `Order.Cancel()`, `Order.Ship()`). Guard all state transitions against invalid enum steps.
- **Domain Events**:
  - Define domain events as records implementing `IDomainEvent` under `Modules/<Module>/Events/`.
  - Store raised events on the aggregate root via `IReadOnlyList<IDomainEvent> DomainEvents`.
  - In command handlers, inspect or log events after calling `SaveChangesAsync()`, then clear them with `order.ClearDomainEvents()`.
- **Typed Errors**:
  - Inherit from `DomainException(string message, int statusCode)` under `Infrastructure/Errors/DomainException.cs`.
  - Co-locate domain errors in `Modules/<Module>/Errors/` (e.g., `InvalidOrderTransitionException`, `EmptyCartException`).
  - `ApiExceptionHandler` automatically maps any `DomainException` to its assigned status code.

### 2. Lightweight CQRS (Reference & CRUD Entities)
Use for catalog and lookup entities (e.g., `Brand`, `Category`, `Product`).

- **Vertical Slice Organization**: Place feature logic under `Modules/<Module>/Commands/` and `Modules/<Module>/Queries/`.
- **Direct DbContext Access**: Inject `ApplicationDbContext` directly into handlers. Avoid aggregate ceremonies or event tracking when performing basic CRUD operations.
- **Explicit Mappers**: Use static mapper classes (e.g., `ProductMapper.cs`) to convert between entities and DTOs.

## Service Registration

- Register all command and query handlers directly in `Modules/AppModulesServiceCollectionExtensions.cs` using `AddScoped`.
- Avoid mediator libraries (no MediatR); keep handler invocations explicit and directly injected into controllers.

## Contract Compatibility

- Define all shared contracts in `RipperdocShop.Shared/DTOs/`.
- Keep DTO modifications additive. Adding optional or nullable fields is preferred; avoid renaming or removing properties consumed by existing frontend apps.

## Database & Migrations

- Manage schema changes using EF Core migrations.
- Keep migrations additive and non-destructive. Never drop existing columns or tables without explicit user confirmation.

## Verification

Before completing backend tasks:
1. Run `dotnet test backend/RipperdocShop.sln` — all tests must pass with zero failures.
2. For new domain invariants or state transitions, add corresponding unit tests in `RipperdocShop.Tests/Modules/<Module>/`.
