# Wipu — Agent Development Guide

This document is the single source of truth for architectural decisions, coding conventions, and best practices when working on the Wipu codebase. Follow these guidelines to maintain consistency and quality.

---

## 1. Project Context

**Wipu** is a Progressive Web App (PWA) for shared expense/income tracking among couples and small groups (max 8 per space). It prioritizes logical date inheritance, high-density visibility, and rapid data entry.

**Current Phase:** Frontend-only with mock data (`lib/data.ts` acting as a local database persisted to `localStorage`).

**Future Phase:** Supabase backend (PostgreSQL, Auth, Realtime, Row Level Security). The migration path is designed to be straightforward: replace mock query functions with Supabase client calls. Zustand stores and UI components should remain largely unchanged.

---

## 2. Tech Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Package Manager | pnpm | 10.10.0 | Fast, disk-space efficient |
| Framework | Next.js | 16.1.6 | App Router, React Compiler opt-in, Turbopack |
| UI Library | React / React DOM | 19.1.0 | Required by Next.js 16 |
| Language | TypeScript | 5.9.3 | Strict mode |
| Styling | Tailwind CSS | 4.1.4 | Custom design tokens via `@theme` |
| Client State | Zustand | 5.0.3 | Auth, spaces, UI state |
| Server State | TanStack Query (React) | 5.71.10 | Mock data fetching, caching, mutations |
| Drag & Drop | @dnd-kit/core + sortable | 6.3.1 / 10.0.0 | Touch-friendly, accessible |
| Animations | Framer Motion | 12.6.3 | Layout animations, transitions |
| Date Utils | luxon | 3.6.1 | Period grouping, formatting |
| Icons | lucide-react | 0.487.0 | MIT license |
| Forms | Native + Zod | 3.24.3 | Validation |
| Server Boundaries | server-only | 0.0.1 | Prevents client imports of server-only modules |

---

## 3. Architecture Principles

### 3.1 Domain-Organized Structure

The `src/` directory is organized by domain/feature, not by technical role:

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
│   ├── ui/                 # Shared UI primitives (Button, Input, Modal, etc.)
│   ├── layout/             # Header, navigation, shell components
│   ├── auth/               # Auth-specific components
│   ├── ledger/             # Ledger domain components
│   │   ├── row/            # Row sub-components
│   │   ├── period/         # Period group sub-components
│   │   └── forms/          # Shared form components
│   └── spaces/             # Spaces domain components
├── hooks/
│   ├── shared/             # Cross-domain reusable hooks
│   ├── use-auth.ts         # Domain-specific hooks
│   ├── use-ledger.ts
│   └── use-spaces.ts
├── stores/                 # Zustand stores
├── lib/
│   ├── utils.ts            # cn() ONLY
│   ├── animations.ts       # Spring presets
│   ├── formatting.ts       # Currency, date formatting
│   ├── grouping.ts         # Period grouping logic
│   ├── id-utils.ts         # ID generation
│   ├── api-simulation.ts   # Mock delay utilities
│   ├── session.ts          # Cookie session helpers (server-only)
│   ├── types.ts            # Shared TypeScript types
│   ├── constants.ts        # App constants
│   └── data.ts             # MOCK DATABASE — DO NOT MODIFY STRUCTURE
└── ...
```

### 3.2 Single Responsibility

- **Components should not exceed ~80 lines.** Extract early and often.
- **Lib files should have one purpose.** `lib/utils.ts` contains ONLY `cn()`. Formatting goes in `lib/formatting.ts`, grouping in `lib/grouping.ts`, etc.
- **Hooks should do one thing.** A hook that fetches data AND manages local UI state is a candidate for splitting.

### 3.3 Presentation / Data Decoupling

**NEVER** import `mockDb` (or future API clients) directly into `.tsx` presentation components.

**Correct:** Enrich data in the hook layer.

```typescript
// hooks/use-ledger.ts — CORRECT
const { data: items } = useQuery({
  queryKey: ["ledger", activeSpaceId],
  queryFn: async () => {
    const rawItems = mockDb.getLedgerItems(activeSpaceId);
    return rawItems.map((item) => ({
      ...item,
      updatedByName: mockDb.getUserById(item.updatedBy)?.name || "Unknown",
    }));
  },
});
```

**Incorrect:** Calling `mockDb` inside a component render.

```typescript
// components/ledger/some-component.tsx — INCORRECT
const user = mockDb.getUserById(item.updatedBy); // ❌ Never do this
```

---

## 4. Component Architecture

### 4.1 Atomic Decomposition Patterns

When a component grows too large, decompose following these patterns:

| Pattern | Example | Responsibility |
|---|---|---|
| **Content** | `LedgerRowContent.tsx` | Shared presentation markup (amount, description, category, date, avatar) |
| **Platform Variants** | `LedgerRowDesktop.tsx` / `LedgerRowMobile.tsx` | Platform-specific layout and interactions |
| **DnD Wrapper** | `SortableLedgerRow.tsx` | Drag-and-drop logic wrapping the presentational component |
| **Form Fields** | `LedgerFormFields.tsx` | Shared form input grid used by add and edit rows |
| **Animated Shell** | `AuthFormLayout.tsx` | Reusable motion wrapper with shake/success animations |

### 4.2 Shared UI Primitives

The `components/ui/` directory contains reusable, unopinionated primitives. **Always reuse them.** Do not duplicate AnimatePresence + backdrop logic.

Key primitives:
- `Dropdown` — AnimatePresence + backdrop + positioning
- `Menu` / `MenuItem` — Composed on top of `Dropdown`
- `SkeletonPulse` — Reusable loading pulse animation
- `HighlightText` — Text highlighting with query matching
- `SuggestionDropdown` — Animated suggestion list

### 4.3 Barrel Exports

`components/ui/index.ts` exports all UI primitives for clean imports:

```typescript
import { Button, Input, Modal, Dropdown } from "@/components/ui";
```

---

## 5. Hooks & Logic Extraction

### 5.1 Shared Hooks (`hooks/shared/`)

Place hooks here when used by 2+ domains or components:

| Hook | Purpose |
|---|---|
| `useClickOutside` | Detect clicks outside a ref, with configurable events |
| `useLongPress` | Touch long-press detection with configurable duration |
| `useKeyboardNavigation` | Arrow key + Enter navigation for lists |
| `useMutationWithToast` | Factory for TanStack Query mutations with auto-invalidation and toast |
| `useLedgerForm` | Shared form state logic for ledger add/edit |

### 5.2 Domain Hooks (`hooks/*.ts`)

Feature-specific hooks live at the root of `hooks/`:

| Hook | Responsibility |
|---|---|
| `useAuth` | Login, register, logout, session management |
| `useLedger` | Fetch, add, update, delete, reorder ledger items |
| `useSpaces` | Fetch, create, delete, leave spaces |
| `useGroupedLedger` | Period grouping, pagination, sorting logic |

### 5.3 Hook Conventions

- **Explicit return types** on custom hooks.
- **No inline delays:** Use `simulateDelay(ms)` from `lib/api-simulation.ts` instead of `await new Promise((resolve) => setTimeout(resolve, 300))`.
- **Mutation factory:** Use `useMutationWithToast` for all mutations to ensure consistent invalidation and user feedback.

### 5.4 API Route Conventions

HTTP API routes live under `app/api/` and follow these patterns:

| Convention | Rule |
|---|---|
| **Flat structure** | `app/api/auth/login/route.ts` — no route groups for APIs |
| **Method handlers** | Export `GET`, `POST`, `PUT`, `DELETE` as named async functions |
| **Error format** | Always return `{ error: string }` JSON with appropriate status codes |
| **Validation** | Manual validation for now; add Zod schemas when integrating real backend |
| **Cookie handling** | Use `next/headers` `cookies()` in route handlers; never in proxy.ts |
| **Data enrichment** | Compute derived values (e.g., `defaultSpaceId`) server-side before responding |

**Correct:** Route handler returns enriched data.
```typescript
// app/api/auth/login/route.ts — CORRECT
export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await authenticate(body.email, body.password);
  const spaces = await getUserSpaces(user.id);
  return NextResponse.json({ user, defaultSpaceId: spaces[0]?.id ?? null });
}
```

**Incorrect:** Route returns raw user, hook computes spaces.
```typescript
// app/api/auth/login/route.ts — INCORRECT
return NextResponse.json({ user }); // ❌ Hook should not call mockDb after mutation
```

---

## 6. State Management

### 6.1 Zustand — Client State Only

Stores manage purely client-side state:

| Store | State |
|---|---|
| `auth-store.ts` | User session, token, authentication status |
| `space-store.ts` | Spaces list, active space ID |
| `ui-store.ts` | Period type, smart date toggle, sort preferences, custom date range |

### 6.2 TanStack Query — Server State

All data fetching and mutations go through TanStack Query:

```typescript
const { data, isLoading } = useQuery({
  queryKey: ["ledger", activeSpaceId],
  queryFn: async () => { ... },
  enabled: !!activeSpaceId,
});
```

### 6.3 Mutation Patterns

Use the `useMutationWithToast` factory for consistent behavior:

```typescript
const addItem = useMutationWithToast({
  mutationFn: mockDb.createLedgerItem,
  successMessage: "Item added",
  invalidateKeys: [["ledger", activeSpaceId]],
});
```

### 6.4 Auth Architecture

Two-tier defense for route protection:

| Layer | Mechanism | Purpose |
|---|---|---|
| **Server** | `proxy.ts` | Redirects unauthenticated users before page renders |
| **Client** | `AuthGuard` component | Fallback redirect for edge cases |

**Cookie sessions:** 7-day expiry, `httpOnly: false` (client reads for Zustand hydration), `sameSite: lax`.

**No Zustand persist for auth:** The auth store is hydrated from the cookie on mount, not from localStorage. This prevents stale session state and hydration mismatches.

**Pattern:** Hooks call HTTP API routes (`/api/auth/*`) via `fetch()`, not server actions. This aligns with the Supabase migration path and eliminates bundler boundary issues.

---

## 7. Animation Standards

### 7.1 Spring Presets

**All springs must be imported from `lib/animations.ts`.** Never hardcode spring configs.

| Preset | Stiffness | Damping | Use Case |
|---|---|---|---|
| `SPRING_DEFAULT` | 400 | 30 | Dropdowns, menus, general UI |
| `SPRING_BOUNCE` | 400 | 35 | Slightly bouncy interactions |
| `SPRING_SNAP` | 500 | 30 | Snappy feedback |
| `SPRING_GENTLE` | 300 | 25 | Subtle, gentle transitions |

### 7.2 Reduced Motion

Respect `prefers-reduced-motion`. The global CSS already handles this:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Component-level motion should still be wrapped where appropriate.

---

## 8. `lib/` Organization (Strict Single Responsibility)

| File | Responsibility | What NOT to put here |
|---|---|---|
| `lib/utils.ts` | `cn()` utility ONLY | Formatting, grouping, IDs |
| `lib/animations.ts` | Spring presets | Component logic |
| `lib/formatting.ts` | `formatCurrency()`, `formatDate()` | Anything else |
| `lib/grouping.ts` | Period grouping, sorting | UI logic |
| `lib/id-utils.ts` | `generateId()`, `generateInviteCode()` | Business logic |
| `lib/api-simulation.ts` | `simulateDelay()` | Real API calls |
| `lib/types.ts` | Shared TypeScript interfaces | Runtime code |
| `lib/constants.ts` | App-wide constants | Component-specific values |
| `lib/data.ts` | **MOCK DATABASE** | UI code, hooks, components |

**`lib/data.ts` is sacred.** It will be replaced by a real backend. Do not modify its structure. Do not import it in `.tsx` components.

---

## 9. TypeScript Conventions

- **Strict mode** is enabled in `tsconfig.json`.
- **Explicit return types** on all custom hooks.
- **Optional enrichment fields** on types when data is enriched in hooks:
  ```typescript
  interface LedgerItem {
    // ...core fields
    updatedByName?: string; // Enriched in useLedger, not in the DB
  }
  ```
- **Path aliases:** Use `@/` imports (configured in `tsconfig.json`).

---

## 10. File Naming Conventions

| Type | Pattern | Example |
|---|---|---|
| Components | `kebab-case.tsx` | `ledger-row.tsx` |
| Component exports | `PascalCase` | `export function LedgerRow() {}` |
| Hooks | `use-domain.ts` or `use-shared-name.ts` | `use-ledger.ts`, `use-click-outside.ts` |
| Utilities | `kebab-case.ts` | `id-utils.ts` |
| Directories | `kebab-case` | `row/`, `forms/`, `shared/` |

---

## 11. Forms & Inputs

### 11.1 Consolidate Shared Structure

When two forms share 80%+ of their structure, extract a shared form component:

```typescript
// components/ledger/forms/ledger-form-fields.tsx
export function LedgerFormFields({ amount, description, ... }) { ... }
```

Used by both `AddItemRow` and `InlineEditRow`.

### 11.2 Autocomplete Decomposition

An autocomplete input should decompose into:
- `AutocompleteInput` — Container + input logic + keyboard handling
- `SuggestionDropdown` — Animated list wrapper
- `HighlightText` — Query highlighting

---

## 12. Data Layer Rules

1. **`lib/data.ts` is the mock DB.** It will be replaced.
2. **Never import `mockDb` in `.tsx` components.**
3. **Enrich data in hooks or API routes.** If a component needs user names, the hook should attach them. Server-side enrichment happens in API routes.
4. **Use `simulateDelay()` for mock latency.** Do not write inline `setTimeout` promises.
5. **Consistent mutation pattern:** `useMutationWithToast` + invalidate queries.

### 12.1 Server-Only Boundaries

Modules that import `next/headers`, `next/cookies`, or other server-only APIs must include `import "server-only"` at the top:

```typescript
// lib/session.ts
import "server-only";
import { cookies } from "next/headers";
```

This throws a build-time error if any client component accidentally imports the module.

**Critical:** Never import server-only utilities into `proxy.ts`. Proxy files run in a different compilation context and Turbopack cannot resolve the server-only boundary across contexts. Inline cookie parsing directly in proxy.ts instead.

```typescript
// proxy.ts — CORRECT
const cookie = req.cookies.get("wipu_session")?.value;

// proxy.ts — INCORRECT
import { getSession } from "@/lib/session"; // ❌ Causes Turbopack module graph stall
```

---

## 13. Common Pitfalls

| Pitfall | Solution |
|---|---|
| Hardcoded spring configs | Import from `lib/animations.ts` |
| `mockDb` calls in components | Move to hooks, enrich data there |
| `mockDb` calls in hook `onSuccess` | Move to API routes, return enriched data |
| Inline `await new Promise(...)` | Use `simulateDelay()` from `lib/api-simulation.ts` |
| Importing server-only modules in proxy.ts | Inline cookie parsing directly in proxy.ts |
| Duplicated form structures | Extract `*FormFields` component |
| Duplicated dropdown/menu logic | Reuse `Dropdown` primitive |
| Components over 80 lines | Decompose into atomic sub-components |
| Mixing concerns in `lib/utils.ts` | Split into domain-specific files |

---

## 14. Testing Approach (To Be Defined)

When tests are added:
- Unit tests for `lib/` utilities (pure functions).
- Hook tests with `@testing-library/react-hooks`.
- Component tests with `@testing-library/react`.
- E2E tests for critical user flows (auth, ledger CRUD, space management).

---

## 15. Quick Reference

### Adding a New Feature

1. Identify the domain (`ledger/`, `spaces/`, `auth/`).
2. If shared UI is needed, check `components/ui/` first.
3. If shared logic is needed, check `hooks/shared/` first.
4. Keep components under 80 lines; decompose early.
5. Enrich data in hooks or API routes, not components.
6. Use spring presets from `lib/animations.ts`.
7. Run `pnpm build` before committing.

### Commit Messages

Use descriptive, batch-style commits:

```
refactor: Batch X — what changed
feat: Add Y component
fix: Resolve Z bug
```

---

*Last updated: May 2026*
