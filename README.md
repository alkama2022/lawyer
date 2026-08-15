# Lexfolio — Legal Case Management

A self-hosted legal case management workspace for counsel: cases, hearings,
clients, documents and performance analytics.

Built with **TanStack Start** (React 19 + Vite 8 + Nitro), **Tailwind CSS 4**
and **TypeScript**. Fully self-contained — no external platform is required to
develop, build, or deploy.

## Features

- Secure sign-in with expiring sessions (45-minute idle timeout)
- Dashboard with case statistics and performance charts
- Case management with search, filtering, sorting and detail timelines
- Client records, hearings calendar, document vault and outcomes
- Reports & analytics, notifications and professional record
- SSR-rendered pages with client-side hydration for authenticated views
- Error boundaries, SSR error pages and structured server error logging
- CSRF protection for server functions

## Requirements

- Node.js 20+ (developed against Node 24)
- npm 10+

## Installation

```sh
git clone <repository-url>
cd <repository-name>
npm install
```

## Development

```sh
npm run dev
```

The dev server runs at http://localhost:5173.

Sign in with the demo credentials shown on the login page
(defaults: `a.musa@haldane-partners.law` / `Chambers2026`, overridable via
`.env`).

## Environment Configuration

Copy `.env.example` to `.env` and adjust values:

```sh
cp .env.example .env
```

| Variable             | Description                             | Default                       |
| -------------------- | --------------------------------------- | ----------------------------- |
| `VITE_API_BASE_URL`  | Base URL of the backend API             | `/api`                        |
| `VITE_DEMO_EMAIL`    | Demo sign-in email (mock auth layer)    | `a.musa@haldane-partners.law` |
| `VITE_DEMO_PASSWORD` | Demo sign-in password (mock auth layer) | `Chambers2026`                |
| `PORT`               | Production server port (nitro)          | `3000`                        |
| `NITRO_HOST`         | Production server bind address (nitro)  | `0.0.0.0`                     |

`.env` is git-ignored. Only `VITE_*` variables are exposed to the browser;
never put secrets in them. See `.env.example` for the complete template.

## Scripts

| Command             | Description                                                  |
| ------------------- | ------------------------------------------------------------ |
| `npm run dev`       | Start the development server                                 |
| `npm run build`     | Production build (client + Nitro server in `.output/`)       |
| `npm run start`     | Serve the production build (`node .output/server/index.mjs`) |
| `npm run preview`   | Preview the production build with Vite                       |
| `npm run typecheck` | TypeScript type checking                                     |
| `npm run lint`      | ESLint (includes Prettier checks)                            |
| `npm run format`    | Format the codebase with Prettier                            |

## Production Build

```sh
npm run build
npm run start
```

The build produces a standalone Node server in `.output/`. The server serves
both the SSR-rendered pages and the static client assets. Set `PORT` and
`NITRO_HOST` in the deployment environment as needed.

## Data Layer

The current data layer is a **mock API** (`src/lib/api.ts` backed by
`src/lib/mock/data.ts`) that mimics a REST backend with simulated latency.
All screens talk exclusively to `src/lib/api.ts`; the mock can be swapped for
a real REST backend by replacing the function bodies with `request()` calls
(see the `request` helper in `src/lib/api.ts`).

The authentication layer (`src/lib/auth.tsx`) is similarly a client-side mock.
Replace `signIn`, `signOut`, `requestReset`, `resetPassword` and
`changePassword` with real API calls to integrate a production auth backend;
the rest of the application only uses the `useAuth` hook.

## Project Structure

```
src/
├── routes/            # File-based routing (__root.tsx is the app shell)
├── components/
│   ├── ui/            # shadcn-style primitives (only used ones are kept)
│   ├── layout/        # App shell, sidebar, global search
│   ├── cases/         # Case table
│   ├── charts/        # Recharts wrappers
│   └── common/        # Page headers, stat cards, badges, dialogs
├── lib/
│   ├── api.ts         # API service layer (single integration point)
│   ├── auth.tsx       # Session/auth context
│   ├── types.ts       # Domain types
│   ├── format.ts      # Date/number formatting
│   ├── mock/data.ts   # Mock data backing the mock API
│   └── error-*.ts     # SSR error capture and fallback pages
├── hooks/
├── server.ts          # Custom server entry (SSR error normalization)
├── start.ts           # TanStack Start instance (CSRF middleware)
├── router.tsx         # Router with QueryClient context
└── styles.css         # Tailwind CSS + design tokens
```

## Deployment

This project is a standard Node.js deployment:

1. Install dependencies: `npm ci`
2. Configure environment variables (see `.env.example`)
3. Build: `npm run build`
4. Run: `npm run start` (or `node .output/server/index.mjs`)

The `.output/` directory is fully self-contained and can be containerized or
shipped to any Node host. Example Dockerfile:

```dockerfile
FROM node:24-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-slim
WORKDIR /app
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

## Troubleshooting

- **Port already in use** — the dev server uses `5173`; set `NITRO_HOST` and
  `PORT` for production, or pass `--port` to Vite.
- **Type errors after route changes** — `src/routeTree.gen.ts` is generated by
  the router plugin on `dev`/`build`; it must never be edited by hand.
- **Login fails** — the mock auth layer only accepts the demo credentials from
  `.env` (see the login page for the current values).
- **API requests 404** — `VITE_API_BASE_URL` points at a real backend that is
  not running; the mock layer (default) does not make network requests.
