# shopping-web

React 19 + Vite 8 + TypeScript frontend for the shopping approval flow. Talks to `shopping-api` over REST.

Stack: Tailwind CSS, Base UI (`@base-ui/react`), React Router, Vitest.

> Full setup instructions land in a later task (T14). For now:
>
> ```bash
> pnpm install
> cp .env.example .env   # set VITE_API_URL if shopping-api isn't on localhost:3000
> pnpm dev
> ```
>
> Tests: `pnpm test` · Build: `pnpm build`
