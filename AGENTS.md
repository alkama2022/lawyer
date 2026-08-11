# Lexfolio — Legal Case Management

TanStack Start (React + Vite + Nitro) application. Fully self-hosted; no
external platform is required to develop, build, or deploy.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start the dev server (http://localhost:5173)
- `npm run build` — production build (client + nitro server in `.output/`)
- `npm run start` — serve the production build (node `.output/server/index.mjs`)
- `npm run preview` — preview the production build with vite
- `npm run typecheck` — TypeScript check (`tsc --noEmit`)
- `npm run lint` — ESLint (prettier included)
- `npm run format` — Prettier write

## Conventions

- Route tree is generated (`src/routeTree.gen.ts`) by the TanStack router
  plugin on dev/build — do not edit by hand.
- UI components live in `src/components/ui` (shadcn-style); only add a
  component here when it is actually used.
- All screens talk to the API layer in `src/lib/api.ts` — never import mock
  data directly.
- Environment variables are read via `import.meta.env.VITE_*`. See
  `.env.example` for the full list.

## Structure

- `src/routes/` — file-based routing (`__root.tsx` is the app shell)
- `src/lib/` — api, auth, types, formatting, error handling
- `src/components/` — layout, features, and ui primitives
- `src/lib/mock/data.ts` — mock data backing the current mock API layer
