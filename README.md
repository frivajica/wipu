# Wipu

<p align="center">
  <strong>Shared expense, income, and debt tracking for couples and small groups</strong>
</p>

<p align="center">
  <a href="https://nextjs.org/">Next.js 16</a> •
  <a href="https://react.dev/">React 19</a> •
  <a href="https://www.typescriptlang.org/">TypeScript 5</a> •
  <a href="https://tailwindcss.com/">Tailwind CSS 4</a> •
  <a href="https://pnpm.io/">pnpm</a>
</p>

---

## What is Wipu?

Wipu is a Progressive Web App (PWA) for couples and small teams (up to 15 members per space) to track shared expenses, income, and debts in one place. It prioritizes logical date inheritance, high-density visibility, and rapid data entry — built for people who want clarity over their shared finances without the overhead of traditional budgeting tools.

**Key features:**
- **Shared ledger** — Track expenses and income in collaborative spaces with full transparency
- **Debt tracking** — Organize debts into groups with running balances and category syncing
- **Period-based grouping** — View items by Monthly, Weekly, Bi-Weekly, or Custom date ranges with running balance totals
- **Smart date inheritance** — Items inherit dates from their period group when reordered via drag & drop
- **Multi-user transparency** — See who added or last modified each item via avatars
- **Rapid data entry** — Inline add/edit rows with tab-navigable fields and autocomplete suggestions
- **Column sorting** — Click table headers to sort by amount, description, category, date, or profile
- **Drag & drop reordering** — Manual item ordering within period groups with keyboard and touch support
- **Responsive design** — Mobile-first stacked layout with desktop table layout
- **Swipe & context menus** — Swipe-to-delete on mobile, right-click or long-press on desktop
- **Infinite scroll** — Load older periods progressively

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org/) | React framework with App Router, Turbopack, React Compiler |
| [React 19](https://react.dev/) | UI library |
| [TypeScript 5](https://www.typescriptlang.org/) | Type-safe development (strict mode) |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling with custom design tokens |
| [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight client state management |
| [TanStack Query](https://tanstack.com/query/latest) | Server state, caching, and mutations |
| [Better Auth](https://www.better-auth.com/) | Self-hosted authentication with session management |
| [PostgreSQL](https://www.postgresql.org/) | Database — self-hosted local Postgres (single instance, `wipu` prod / `wipu_dev` dev) |
| [postgres](https://github.com/porsager/postgres) | Postgres.js — wire-protocol driver for Postgres |
| [Drizzle ORM](https://orm.drizzle.team/) | Type-safe SQL ORM with schema-as-code |
| [@dnd-kit](https://dndkit.com/) | Accessible drag & drop for reordering |
| [Framer Motion](https://www.framer.com/motion/) | Layout animations and micro-interactions |
| [luxon](https://moment.github.io/luxon/) | Date utilities and period grouping |
| [lucide-react](https://lucide.dev/) | Consistent, clean icon set |
| [Zod](https://zod.dev/) | Schema validation |
| [server-only](https://www.npmjs.com/package/server-only) | Server-only module boundary enforcement |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- [pnpm](https://pnpm.io/installation) 11.20.0 (managed via `packageManager` field)

### Installation

```bash
# Clone the repository
git clone https://github.com/frivajica/wipu.git
cd wipu

# Install dependencies
pnpm install
```

### Database Setup

The app uses the `postgres` (postgres.js) wire-protocol driver with Drizzle and works against a **self-hosted PostgreSQL** instance. Dev and prod share one instance with separate databases: `wipu_dev` (dev) and `wipu` (prod). In dev the connection points at the local instance's loopback port (`127.0.0.1:55432`); in the Docker deploy it uses the compose service name — only `DATABASE_URL` differs.

**Environment variables** (validated by `assertBackendConfig()` when `USE_REAL_BACKEND=true`):

```env
# Database connection string (local Postgres; same instance, separate DB per environment)
DATABASE_URL=postgresql://user:password@127.0.0.1:55432/wipu_dev

# Auth (Better Auth) — secret must be at least 32 characters
BETTER_AUTH_SECRET=your-32-char-secret-here
BETTER_AUTH_URL=http://localhost:3000

# Public URL baked into the client bundle (build arg in Docker)
NEXT_PUBLIC_APP_URL=https://your-app.domain

# Enable the real backend (mock data otherwise)
USE_REAL_BACKEND=true
```

Generate a secure auth secret:
```bash
openssl rand -base64 32
```

**Local PostgreSQL (dev and prod on one instance):**
1. Stand up a PostgreSQL instance (e.g. the `db` service in the wipu Docker compose stack, which publishes `127.0.0.1:55432`).
2. Create the dev role + database (the compose `db` service does this automatically on a fresh volume via initdb.d; for an existing volume, run the `CREATE ROLE wipu_dev LOGIN PASSWORD '…'` and `CREATE DATABASE wipu_dev OWNER wipu_dev` statements once as the `postgres` user).
3. Point `DATABASE_URL` at it in `.env.local` — the app always reads `DATABASE_URL`/`BETTER_AUTH_SECRET` regardless of environment. The compose stack retrieves the **prod** values from Vaultwarden under `WIPU_DB_PASSWORD_PROD` / `WIPU_BETTER_AUTH_SECRET_PROD`; dev values are self-managed in a gitignored `.env.local`.

**Apply the schema and custom SQL:**

```bash
pnpm db:push
npx tsx scripts/migrate-balance-cutoff.ts
npx tsx scripts/update-period-stats-function.ts
npx tsx scripts/fix-audit-trigger.ts
psql "$DATABASE_URL" -f scripts/attach-triggers.sql
```

**Seed with demo data (optional):**

```bash
pnpm db:seed
```

**Demo login credentials after seed:**
- `sarah@example.com` / `demo12345678`
- `john@example.com` / `demo12345678`

### Development

```bash
# Start the development server (Turbopack enabled)
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Build

```bash
# Production build
pnpm build

# Start production server
pnpm start
```

### Docker

`NEXT_PUBLIC_APP_URL` is baked into the client bundle at build time, so it must be passed as a build arg.

```bash
# Build the image
docker build --build-arg NEXT_PUBLIC_APP_URL=https://your-app.domain -t wipu .

# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e BETTER_AUTH_SECRET=your-secret \
  -e BETTER_AUTH_URL=http://localhost:3000 \
  -e NEXT_PUBLIC_APP_URL=https://your-app.domain \
  -e USE_REAL_BACKEND=true \
  wipu

# Liveness check
curl http://localhost:3000/api/health
```

### Lint

```bash
pnpm lint
```

---

## Project Structure

The codebase follows a **domain-organized** structure (by feature, not by technical role):

```
docs/                       # Architecture documentation & pending work
├── backend-architecture.md # Schema design, migration strategy, API shapes
├── BACKEND_PLAN.md         # Phase-by-phase implementation checklist
├── DEBT_FEATURES.md        # Debt tracking UI/UX specification
├── PENDING.md              # Current gaps between backend and frontend
├── PROJECT_DEFINITION.md   # High-level project definition
├── RECURRING_FRONTEND_FEATURE.md # Recurring items specification
└── REORDER_BY_DATE.md      # Smart date inheritance specification
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Route group: login, register
│   ├── api/                # HTTP API routes (20+ endpoints)
│   │   ├── auth/           # Better Auth catch-all handler
│   │   ├── autocomplete/   # Description/category suggestions
│   │   ├── balances/       # Balance calculations (SQL functions)
│   │   ├── debt-groups/    # Debt group CRUD
│   │   ├── debt-category-sync/  # Bulk category updates
│   │   ├── export/         # CSV generation
│   │   ├── health/         # Liveness probe for container healthchecks
│   │   ├── ledger-items/   # Ledger CRUD + pagination
│   │   ├── recurring/      # Recurring rules & instances
│   │   └── spaces/         # Space management + membership
│   ├── ledger/             # Main ledger page
│   ├── debt/               # Debt tracking page
│   └── spaces/             # Spaces management page
├── components/
│   ├── ui/                 # Shared UI primitives (Button, Input, Modal, etc.)
│   ├── layout/             # Header, space selector, tab navigation
│   ├── auth/               # Login/register forms
│   ├── ledger/             # Ledger domain: rows, period groups, controls
│   ├── debt/               # Debt domain: group cards, item rows
│   └── spaces/             # Space cards, modals, invite flows
├── db/
│   ├── index.ts            # postgres.js client + Drizzle instance
│   ├── schema.ts           # Drizzle schema (all tables + auth tables)
│   ├── migrations/         # SQL functions, triggers, indexes
│   └── seed.ts             # Currency reference data seed
├── hooks/
│   ├── shared/             # Reusable hooks
│   ├── use-auth.ts         # Auth logic (Better Auth client)
│   ├── use-ledger.ts       # Ledger CRUD via API
│   ├── use-debt.ts         # Debt group fetching
│   ├── use-spaces.ts       # Space management
│   └── use-grouped-ledger.ts # Period grouping, sorting
├── stores/                 # Zustand stores (auth, spaces, UI state)
├── lib/
│   ├── auth.ts             # Better Auth configuration (Drizzle adapter)
│   ├── auth-client.ts      # Frontend auth client
│   ├── config.ts           # Feature flags (USE_REAL_BACKEND)
│   ├── utils.ts            # `cn()` utility only
│   ├── animations.ts       # Shared spring presets
│   ├── formatting.ts       # Currency & date formatting
│   ├── grouping.ts         # Period grouping logic
│   ├── id-utils.ts         # ID & invite code generation
│   ├── types.ts            # Shared TypeScript types
│   └── constants.ts        # App constants
scripts/
├── seed-mock-data.ts           # Full database seed (users → ledger items)
├── fix-audit-trigger.ts        # Create audit_trigger_fn (SQL function)
├── migrate-balance-cutoff.ts   # get_space_balances with balance-cutoff param
├── migrate-is-default.ts       # Mark the default space
├── update-period-stats-function.ts # get_period_stats (9-column version)
├── attach-triggers.sql         # CREATE TRIGGER statements for audited tables
└── drop-all-tables.ts          # Clean reset helper
```

---

## Development Guidelines

For detailed conventions, architecture decisions, and best practices, see [**AGENTS.md**](./AGENTS.md).

Key rules at a glance:
- **Keep components under ~80 lines.** Extract early.
- **Never import `mockDb` in `.tsx` components.** Enrich data in hooks instead.
- **Use shared UI primitives** (`Dropdown`, `Menu`, `SkeletonPulse`) instead of duplicating logic.
- **Import spring presets** from `lib/animations.ts` — never hardcode them.
- **Use `useMutationWithToast`** for all mutations to ensure consistent invalidation and user feedback.
- **Keep `lib/utils.ts` for `cn()` only.** Split utilities into domain files (`formatting.ts`, `grouping.ts`, etc.).

---

## Current Phase: PostgreSQL Backend + Better Auth

The app is fully migrated from mock data to a real PostgreSQL backend. The `postgres` (postgres.js) wire-protocol driver works against the self-hosted PostgreSQL instance shared by dev (`wipu_dev`) and prod (`wipu`). Better Auth handles session management. All ledger CRUD, space management, debt tracking, and balance calculations are backed by Drizzle ORM queries and PostgreSQL functions.

The frontend architecture remains unchanged — only `queryFn` internals in hooks were swapped for `fetch()` calls to the API layer.

For the full backend plan, database schema, and migration strategy, see [**docs/backend-architecture.md**](./docs/backend-architecture.md).

---

## Scripts

| Script | Command | Description |
|---|---|---|
| dev | `pnpm dev` | Start dev server with Turbopack |
| build | `pnpm build` | Production build |
| start | `pnpm start` | Start production server |
| lint | `pnpm lint` | Run ESLint |
| db:push | `pnpm db:push` | Push Drizzle schema to database |
| db:studio | `pnpm db:studio` | Open Drizzle Studio |
| db:seed | `pnpm db:seed` | Seed database with demo data |

---

## Roadmap

- **Phase 1** ✅ Frontend-only PWA with mock data
- **Phase 2** ✅ PostgreSQL backend, Better Auth, real-time data
- **Phase 3** Recurring items, CSV export
- **Phase 4** Budgets screen
- **Phase 5** Analytics screen
- **Phase 6** AI category suggestions, profile pictures, push notifications, dark mode

---

## License

MIT
