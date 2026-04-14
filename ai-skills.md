# AI Skills / Project Notes

## Project overview

- Next.js App Router project (`app/` directory)
- React 19
- Uses Mongoose (`mongoose`) for DB access
- Has API routes under `app/api/**/route.ts`

## UI / Admin area conventions

- Admin pages live under `app/admin/**` and are generally client components (`"use client"`).
- UI primitives are shadcn-style wrappers under `components/ui/**` (Radix UI components + Tailwind classes).
- Common admin list layout pattern:
  - Top section: title + optional action button
  - Controls row: search input (with `lucide-react` icon) + optional filters (`Select`)
  - Content: `Table` inside `rounded-md border bg-card`
- Example list pages:
  - Orders: `app/admin/orders/page.tsx`
  - Categories: `app/admin/categories/page.tsx`

## TanStack React Table usage

- Installed package:
  - `@tanstack/react-table`
- Orders list is implemented with TanStack Table state for:
  - Sorting (`SortingState` + `getSortedRowModel`)
  - Filtering:
    - Global search (`globalFilter` + `globalFilterFn`)
    - Status filter via column filters (`ColumnFiltersState`)
- Rendering pattern:
  - Headers: `table.getHeaderGroups()` + `flexRender`
  - Rows: `table.getRowModel()` + `flexRender`

## TanStack React Query setup

- Installed packages:
  - `@tanstack/react-query`
  - `@tanstack/react-query-devtools`

### Provider wiring

- Query client provider is implemented in:
  - `app/providers.tsx`
- Root layout wraps the app with the provider:
  - `app/layout.tsx` imports `Providers` from `./providers` and wraps existing providers

### Devtools

- React Query Devtools are enabled only in development:
  - `process.env.NODE_ENV === "development"`

### Default query options

- Config lives in `app/providers.tsx` (QueryClient construction)
- Current defaults:
  - `staleTime: 30_000`
  - `refetchOnWindowFocus: false`
  - `retry: 1`

## Existing global providers

- Auth provider:
  - `lib/auth-context.tsx`
- Data provider:
  - `lib/data-context.tsx`
- Provider composition in `app/layout.tsx`:
  - `Providers` (React Query)
  - `AuthProvider`
  - `DataProvider`

## DataContext notes

- Many admin pages use `useData()` from `lib/data-context.tsx` for list data (e.g. orders, categories).
- Data is initialized from `localStorage` and falls back to `initial*` datasets when not present.
- When wiring tables, prefer using TanStack Table filtering/sorting state instead of pre-filtering arrays in render.

## API routes (examples)

- Products API:
  - `app/api/products/route.ts`
  - `app/api/products/[id]/route.ts`
  - `app/api/products/search/route.ts`

## Suggested patterns for API fetching

- Put client-side fetch functions in a small API layer (e.g. `lib/api/*.ts`) and consume via React Query hooks.
- Use stable query keys:
  - List: `["products", params]`
  - Detail: `["products", id]`
- Use mutations for create/update/delete and invalidate relevant keys afterward.

## Install / troubleshooting

- If TypeScript shows module-not-found errors for TanStack packages, run:
  - `pnpm install` (or `npm install` / `yarn` depending on the package manager)

## Package manager

- Repo includes `pnpm-lock.yaml` and `pnpm-workspace.yaml`, so `pnpm` is the expected package manager.
