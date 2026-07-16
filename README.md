# shopping-web

React 19 + Vite 8 + TypeScript frontend for the shopping approval flow. Talks to `shopping-api` over REST (JWT).

Stack: Tailwind CSS, Base UI (`@base-ui/react`), React Router, Vitest.

## Install

**Prerequisites:** Node.js ≥ 20, [pnpm](https://pnpm.io/), `shopping-api` running (see [shopping-api README](../shopping-api/README.md)).

```bash
pnpm install
cp .env.example .env
```

## Run

```bash
pnpm dev
```

App at `http://localhost:5173`.

### Login flow

1. Unauthenticated visits to `/` redirect to `/login`.
2. Submit email + password → `POST {VITE_API_URL}/auth/login`.
3. On success, JWT + user profile are stored in `localStorage` (`shopping-web:auth`).
4. User is redirected to `/` (home shell). Protected routes use `ProtectedRoute`.
5. Use seeded API users, e.g. `solicitante@shopping.local` / `Senha123!` (see API README for full list).

Production preview:

```bash
pnpm build
pnpm preview
```

## Test

```bash
pnpm test
```

Watch mode (Vitest default when invoked without `run`):

```bash
pnpm exec vitest
```

Build gate:

```bash
pnpm build
```

## Environment

Copy `.env.example` → `.env`:

| Variable | Purpose |
| -------- | ------- |
| `VITE_API_URL` | Base URL of `shopping-api` (default `http://localhost:3000`) |

Vite exposes only `VITE_*` vars to the client. Never commit `.env`.
