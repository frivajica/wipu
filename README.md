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
- [pnpm](https://pnpm.io/installation) 10.10.0 (managed via `packageManager` field)

### Installation

```bash
# Clone the repository
git clone https://github.com/frivajica/wipu.git
cd wipu

# Install dependencies
pnpm install
```

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

### Lint

```bash
pnpm lint
```

---

## Project Structure

The codebase follows a **domain-organized** structure (by feature, not by technical role):

```
docs/                       # Architecture documentation
├── backend-architecture.md # Backend plan, schema, migration strategy
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Route group: login, register
│   ├── api/                # HTTP API routes
│   │   ├── auth/           # Login, register, logout
│   │   ├── balances/       # Balance calculations
│   │   ├── debt-groups/    # Debt group queries
│   │   └── debt-category-sync/  # Bulk debt category updates
│   ├── ledger/             # Main ledger page
│   ├── debt/               # Debt tracking page
│   └── spaces/             # Spaces management page
├── components/
│   ├── ui/                 # Shared UI primitives (Button, Input, Modal, Dropdown, etc.)
│   ├── layout/             # Header, space selector, tab navigation, user menu
│   ├── auth/               # Login/register forms
│   ├── ledger/             # Ledger domain: rows, period groups, controls
│   │   ├── row/            # Ledger row sub-components
│   │   ├── period/         # Period group sub-components
│   │   └── forms/          # Shared form field layouts
│   ├── debt/               # Debt domain: group cards, item rows, balance header
│   └── spaces/             # Space cards, modals, invite flows
├── hooks/
│   ├── shared/             # Reusable hooks (click-outside, long-press, mutation factory)
│   ├── use-auth.ts         # Auth logic
│   ├── use-ledger.ts       # Ledger CRUD + data enrichment
│   ├── use-debt.ts         # Debt group fetching
│   ├── use-spaces.ts       # Space management
│   └── use-grouped-ledger.ts # Period grouping, sorting, pagination
├── stores/                 # Zustand stores (auth, spaces, UI state)
├── lib/
│   ├── utils.ts            # `cn()` utility only
│   ├── animations.ts       # Shared spring presets
│   ├── formatting.ts       # Currency & date formatting
│   ├── grouping.ts         # Period grouping logic
│   ├── id-utils.ts         # ID & invite code generation
│   ├── api-simulation.ts   # Mock delay utilities
│   ├── session.ts          # Cookie session helpers (server-only)
│   ├── types.ts            # Shared TypeScript types
│   ├── constants.ts        # App constants
│   └── data.ts             # Mock database (replaced by real backend in Phase 2)
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

## Current Phase: Frontend-Only

All data currently lives in `src/lib/data.ts` (a mock database class) accessed via TanStack Query hooks with simulated async delay. Client state (auth, active space, UI preferences) is managed by Zustand stores.

The hook/store architecture is designed so that **migrating to a real backend requires swapping only the `queryFn` internals** in hooks and API routes — Zustand stores, React components, and the animation layer remain unchanged.

For the full backend plan, database schema, and migration strategy, see [**docs/backend-architecture.md**](./docs/backend-architecture.md).

---

## Scripts

| Script | Command | Description |
|---|---|---|
| dev | `pnpm dev` | Start dev server with Turbopack |
| build | `pnpm build` | Production build |
| start | `pnpm start` | Start production server |
| lint | `pnpm lint` | Run ESLint |

---

## Roadmap

- **Phase 1** ✅ Frontend-only PWA with mock data (current)
- **Phase 2** PostgreSQL backend, real authentication, real-time sync
- **Phase 3** Recurring items, CSV export
- **Phase 4** Budgets screen
- **Phase 5** Analytics screen
- **Phase 6** AI category suggestions, profile pictures, push notifications, dark mode

---

## License

MIT
