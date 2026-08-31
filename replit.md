# Finalflash Streetwear Store

متجر Finalflash لعرض قطع الستريت وير والثريفت المنتقاة مع طلب مباشر عبر واتساب داخل الجزائر.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/finalflash-store run dev` — run the storefront preview
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/finalflash-store/src/App.tsx` — storefront UI, local product catalog, cart, favorites, quick view, checkout, size guide, feedback lightbox, and FAQ
- `artifacts/finalflash-store/src/index.css` — Finalflash visual tokens, type system, responsive layout utilities, and fallback artwork
- `artifacts/finalflash-store/public/` — static favicon and crawler files

## Architecture decisions

- The first release is a static React storefront; cart and favorites persist in the browser with localStorage.
- Checkout deliberately creates a readable WhatsApp order message instead of collecting online payment.
- Product image paths are intentionally easy to replace; missing uploads render a branded fallback rather than broken image icons.
- Delivery copy uses the verified 58-wilaya scope consistently across the storefront.

## Product

Visitors can browse five curated pieces plus a bundle, search and filter the collection, inspect condition and sizing details, save favorites, build a cart, choose home/desk delivery by wilaya, and send the final order to Finalflash on WhatsApp.

## User preferences

- Keep the storefront authored and human-made in tone; avoid generic AI-generated copy, excessive visual effects, and unnecessary UI ornament.
- Preserve the Arabic/English retail mix where it feels natural.

## Gotchas

- The full product `images/` folder was not uploaded with the original snapshot, so the storefront currently uses graceful branded fallbacks until the real images are copied into a public `/images/` folder.
- `App.tsx` is intentionally self-contained for this small static storefront; add a backend only when order management or inventory synchronization is actually required.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
