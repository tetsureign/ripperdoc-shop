# Agent Operating Guidelines

Repository rules and operational reference for `RipperdocShop`.

## Context Pointers

- **Backend**: Consult [`docs/agents/backend.md`](docs/agents/backend.md) when writing C#, modifying EF Core entities, creating migrations, altering shared DTO contracts, or adding backend tests.
- **Frontend**: Consult [`docs/agents/frontend.md`](docs/agents/frontend.md) when working in `apps/admin` or `apps/customer`, modifying build configs, or updating client API integrations.

## Repository Layout

```
RipperdocShop/
├── backend/
│   ├── RipperdocShop.Api/       # .NET 8 Web API (vertical slice modules under Modules/)
│   ├── RipperdocShop.Shared/    # Shared DTO contracts consumed by API and frontends
│   └── RipperdocShop.Tests/     # xUnit test suite (EF Core InMemory)
├── apps/
│   ├── admin/                   # Vite + React 19 admin dashboard
│   └── customer/                # Next.js 15 customer storefront (experimental prototype)
├── docs/agents/                 # Disclosed agent architecture and tooling references
├── scripts/                     # Utility and data seeding scripts (e.g. scaffold.mjs)
└── compose.yaml                 # Docker configuration for local PostgreSQL & API
```

## Guardrails & Conventions

- **Additive Changes**: Database migrations and DTO schema updates must remain strictly additive and non-destructive. Do not drop database columns or break existing API contract fields without explicit user approval.
- **Secret Hygiene**: Never commit `.env` files or hardcode sensitive tokens/passwords in source code or logs.
- **Git Review Discipline**: Leave changes staged or unstaged for human review. Do not create git commits or switch branches autonomously unless explicitly instructed. When committing, follow Conventional Commits (e.g., `feat:`, `fix:`, `refactor:`).

## Completion Criteria

A task is complete only when all verification criteria for the touched surface pass:

1. **Backend Changes**:
   - `dotnet test backend/RipperdocShop.sln` passes with 0 failures.
   - Any new domain invariants, transition guards, or commands include test coverage in `RipperdocShop.Tests`.
2. **Frontend Changes**:
   - `pnpm --filter <app-name> lint` reports 0 errors.
   - `pnpm --filter <app-name> build` completes successfully.
3. **Contract Changes**:
   - When updating `RipperdocShop.Shared/DTOs/`, verify that both API endpoints and frontend consumers remain synchronized.
