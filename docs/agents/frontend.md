# Frontend Architecture & Tooling

Reference for frontend development across `apps/*`.

## Applications

The frontend is managed as a pnpm workspace with two applications:

- `apps/admin`: Admin dashboard built with Vite, React 19, React Router 7, TanStack Query, and TanStack Table.
- `apps/customer`: Customer storefront built with Next.js 15 App Router, React 19, and Zustand. **Note:** This storefront is an experimental prototype and subject to iterative refactoring.

## Tooling & Commands

All commands can be executed from the repository root:

### Development
- Admin: `pnpm --filter ripperdoc-shop-admin dev` (default: `http://localhost:5173/terminal/`)
- Customer: `pnpm --filter ripperdoc-shop-customer dev` (default: `http://localhost:3001`)

### Build & Lint
- Admin lint: `pnpm --filter ripperdoc-shop-admin lint`
- Admin build: `pnpm --filter ripperdoc-shop-admin build`
- Customer lint: `pnpm --filter ripperdoc-shop-customer lint`
- Customer build: `pnpm --filter ripperdoc-shop-customer build`

## API Routing & Authentication

- **Proxy Rewrites (`apps/customer`)**: Next.js proxies `/api/*` requests to the backend API (`http://localhost:5000` by default) via rewrites in `next.config.ts`. Client components make relative requests (`/api/...`) to prevent cross-origin issues.
- **Cookie Authentication**: Both applications utilize HttpOnly cookies (`AccessToken`) for authenticated requests. Pass `credentials: "include"` with fetch or `withCredentials: true` with Axios.

## Verification

Before completing tasks that touch frontend code:
1. Run `pnpm --filter <target-app> lint` — ensure no errors are introduced.
2. Run `pnpm --filter <target-app> build` — ensure type checks and bundling succeed.
