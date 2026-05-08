# Wipu

<p align="center">
  <strong>Shared expense & income tracking for couples and small groups</strong>
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

Wipu is a Progressive Web App (PWA) designed for couples and small teams (up to 8 members per space) who want to track shared expenses and income together. It features period-based grouping, smart date inheritance during drag-and-drop reordering, and a high-density, mobile-first interface built for rapid data entry.

**Key features:**
- **Period-based grouping** — Organize items by Monthly, Weekly, Bi-Weekly, or Custom date ranges
- **Smart Date Inheritance** — Toggle smart date updating when reordering items via drag & drop
- **Multi-user transparency** — See who added or last modified each item via avatars and timestamps
- **Rapid data entry** — Inline add/edit rows with tab-navigable fields and autocomplete suggestions
- **Responsive design** — Optimized for mobile with stacked layout, desktop with table layout
- **Drag & drop sorting** — Reorder items within period groups with keyboard and touch support
- **Swipe & context menus** — Swipe-to-delete on mobile, right-click or long-press on desktop
- **Infinite scroll** — Load older periods as you scroll through the ledger

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
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Route group: login, register
│   ├── api/                # HTTP API routes (auth, future endpoints)
│   │   └── auth/
│   │       ├── login/route.ts
│   │       ├── register/route.ts
│   │       └── logout/route.ts
│   ├── ledger/             # Main ledger page
│   └── spaces/             # Spaces management page
├── components/
│   ├── ui/                 # Shared UI primitives (Button, Input, Modal, Dropdown, etc.)
│   ├── layout/             # Header, space selector, user menu
│   ├── auth/               # Login/register forms
│   ├── ledger/             # Ledger domain: rows, period groups, controls
│   │   ├── row/            # Ledger row sub-components
│   │   ├── period/         # Period group sub-components
│   │   └── forms/          # Shared form field layouts
│   └── spaces/             # Space cards, modals, invite flows
├── hooks/
│   ├── shared/             # Reusable hooks (click-outside, long-press, mutation factory)
│   ├── use-auth.ts         # Auth logic
│   ├── use-ledger.ts       # Ledger CRUD + data enrichment
│   ├── use-spaces.ts       # Space management
│   └── use-grouped-ledger.ts # Period grouping + pagination
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
│   └── data.ts             # Mock database (will be replaced by backend)
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

All data is currently stored in `src/lib/data.ts` (mock database) and persisted to `localStorage`. TanStack Query treats this as the "backend" via async mock functions.

The architecture is designed for a smooth migration to a real backend (planned: **Supabase** with PostgreSQL, Auth, Realtime, and Row Level Security). The migration path involves replacing mock query functions with Supabase client calls, while Zustand stores and UI components remain largely unchanged.

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
- **Phase 2** Supabase backend, real authentication, real-time sync
- **Phase 3** Budgets screen
- **Phase 4** Analytics screen
- **Phase 5** AI category suggestions, profile pictures, push notifications, dark mode

---

## License

MIT
