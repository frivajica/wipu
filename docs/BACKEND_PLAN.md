# Backend Implementation Plan

> **Version:** 1.0
> **Based on:** `docs/backend-architecture.md`
> **Estimated Duration:** ~20 days of active development
> **Goal:** Production-ready backend with Neon PostgreSQL, Drizzle ORM, Better Auth, and full API coverage

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Stack & Dependencies](#2-technology-stack--dependencies)
3. [Project Structure](#3-project-structure)
4. [Phase 0: Foundation Setup](#phase-0-foundation-setup)
5. [Phase 1: Database Schema & Drizzle](#phase-1-database-schema--drizzle)
6. [Phase 2: Authentication (Better Auth)](#phase-2-authentication-better-auth)
7. [Phase 3: Core CRUD API Routes](#phase-3-core-crud-api-routes)
8. [Phase 4: Ledger Items with Pagination](#phase-4-ledger-items-with-pagination)
9. [Phase 5: Balances & Period Stats](#phase-5-balances--period-stats)
10. [Phase 6: Audit Trail](#phase-6-audit-trail)
11. [Phase 7: Recurring Items](#phase-7-recurring-items)
12. [Phase 8: Realtime & Conflict Resolution](#phase-8-realtime--conflict-resolution)
13. [Phase 9: CSV Export & Final Polish](#phase-9-csv-export--final-polish)
14. [Testing Strategy](#testing-strategy)
15. [Security Checklist](#security-checklist)
16. [Performance Checklist](#performance-checklist)
17. [Migration from Mock DB](#migration-from-mock-db)
18. [Appendix: API Route Inventory](#appendix-api-route-inventory)

---

## 1. Executive Summary

This plan details the complete backend implementation for Wipu, transitioning from the frontend-only mock database (`src/lib/data.ts`) to a production-ready serverless PostgreSQL backend.

### Key Principles

- **Minimal frontend disruption:** Keep all React components, Zustand stores, and animation code unchanged. Only swap `queryFn` internals in hooks.
- **Type safety first:** Drizzle ORM provides end-to-end type safety from database to API.
- **Auth is self-hosted:** Better Auth (free tier) replaces manual cookie sessions with proper session management.
- **SQL for computations:** All balances, running totals, and aggregations use PostgreSQL functions — never client-side math.
- **Pagination from day one:** The ledger API supports cursor-based pagination to handle 108K+ items over 2 years.

### What Changes

| Layer | Before | After |
|---|---|---|
| Database | In-memory arrays (`lib/data.ts`) | Neon PostgreSQL |
| ORM | None | Drizzle ORM |
| Auth | Manual cookie sessions (`lib/session.ts`) | Better Auth |
| API Routes | Mock DB calls | Real SQL queries |
| Data Flow | `hooks → mockDb → arrays` | `hooks → Drizzle → Postgres` |

### What Stays

- All React components (unchanged)
- Zustand stores (auth, spaces, UI)
- TanStack Query hooks (swap `queryFn` only)
- Animation system, UI primitives, layout
- `lib/utils.ts`, `lib/formatting.ts`, `lib/animations.ts`

---

## 2. Technology Stack & Dependencies

### New Dependencies to Install

```bash
# Database
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit

# Auth (Better Auth — free, self-hosted)
pnpm add better-auth

# Validation (already have zod)
# pnpm add zod  # Already installed

# Environment
pnpm add dotenv
```

### Environment Variables (`.env.local`)

```env
# Database
DATABASE_URL=postgresql://user:pass@neon-host/dbname?sslmode=require

# Auth (Better Auth)
BETTER_AUTH_SECRET=your-32-char-secret-here
BETTER_AUTH_URL=http://localhost:3000

# Optional: for production
# NODE_ENV=production
```

### Drizzle Config (`drizzle.config.ts`)

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

## 3. Project Structure

```
wipu/
├── src/
│   ├── db/                          # NEW: Database layer
│   │   ├── schema.ts                # Drizzle schema definitions
│   │   ├── index.ts                 # Database client singleton
│   │   ├── queries/                 # Reusable query builders
│   │   │   ├── ledger.ts
│   │   │   ├── spaces.ts
│   │   │   ├── debt.ts
│   │   │   └── recurring.ts
│   │   └── migrations/              # Drizzle migration files
│   │
│   ├── lib/                         # EXISTING (unchanged except where noted)
│   │   ├── types.ts                 # Update to match Drizzle schema
│   │   ├── session.ts               # DELETE — replaced by Better Auth
│   │   ├── data.ts                  # KEEP for reference during migration
│   │   └── ...
│   │
│   ├── app/api/                     # EXISTING API routes (update internals)
│   │   ├── auth/
│   │   │   ├── login/route.ts       # Replace with Better Auth
│   │   │   ├── register/route.ts    # Replace with Better Auth
│   │   │   ├── logout/route.ts      # Replace with Better Auth
│   │   │   └── [...betterauth]/route.ts  # NEW: Better Auth handler
│   │   ├── ledger-items/route.ts    # NEW: CRUD + pagination
│   │   ├── ledger-items/
│   │   │   └── reorder/route.ts     # NEW: sort_order reassignment
│   │   ├── balances/route.ts        # UPDATE: SQL functions
│   │   ├── spaces/route.ts          # NEW: CRUD
│   │   ├── debt-groups/route.ts     # UPDATE: real queries
│   │   ├── debt-category-sync/route.ts  # UPDATE: real queries
│   │   ├── autocomplete/route.ts    # NEW: trigram search
│   │   ├── recurring/
│   │   │   ├── route.ts             # NEW: CRUD for rules
│   │   │   └── instances/route.ts   # NEW: skip/unskip
│   │   └── export/route.ts          # NEW: CSV export
│   │
│   ├── hooks/                       # EXISTING (update queryFn only)
│   │   ├── use-ledger.ts            # Replace mockDb calls
│   │   ├── use-spaces.ts            # Replace mockDb calls
│   │   ├── use-debt.ts              # Replace mockDb calls
│   │   └── use-auth.ts              # Replace with Better Auth client
│   │
│   └── ...
│
├── drizzle/                         # NEW: Migration files (auto-generated)
├── docs/
│   ├── backend-architecture.md
│   ├── BACKEND_PLAN.md              # This file
│   └── RECURRING_FRONTEND_FEATURE.md
│
├── .env.local
├── drizzle.config.ts
└── package.json
```

---

## Phase 0: Foundation Setup

**Duration:** ~1 day
**Goal:** Install dependencies, configure database connection, set up Drizzle, verify connectivity.

- [ ] Install dependencies: `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`, `better-auth`, `dotenv`
- [ ] Create `.env.local` with `DATABASE_URL`
- [ ] Create `drizzle.config.ts`
- [ ] Create `src/db/index.ts` — database client singleton
- [ ] Create `src/db/schema.ts` — define all tables (copy from `backend-architecture.md`)
- [ ] Run `pnpm drizzle-kit push` to create tables in Neon
- [ ] Verify connection with a simple `SELECT 1` query
- [ ] Add `src/db/schema.ts` to `.gitignore`? No — schema is source code, keep it
- [ ] **Verify:** Can query the database from a test API route

**Files to create:**
- `drizzle.config.ts`
- `src/db/index.ts`
- `src/db/schema.ts`

**Files to modify:**
- `.env.local` (add DATABASE_URL)
- `.gitignore` (add `.env.local`)

---

## Phase 1: Database Schema & Drizzle

**Duration:** ~2 days
**Goal:** Define all tables, indexes, triggers, and SQL functions in Drizzle schema.

- [ ] Define `users` table (UUID PK, email unique, name, avatar_url, created_at)
- [ ] Define `spaces` table (UUID PK, name, owner_id FK, max_members, invite_code unique, currency FK, is_personal, created_at)
- [ ] Define `space_members` join table (space_id + user_id composite PK, role, joined_at)
- [ ] Define `categories` table (UUID PK, space_id FK, name, created_by FK, unique(space_id, name))
- [ ] Define `debt_groups` table (UUID PK, space_id FK, name, color, created_by FK, created_at)
- [ ] Define `ledger_items` table (UUID PK, space_id FK, amount NUMERIC(12,2), currency FK, description, category, date, type, group_id FK, sort_order, version, created_by FK, updated_by FK, created_at, updated_at)
- [ ] Define `recurring_items` table (UUID PK, space_id FK, amount NUMERIC(12,2), currency FK, description, category, type, group_id FK, frequency_unit, interval_count, by_day, by_month_day, start_date, end_date, count, next_occurrence, last_computed_at, created_by FK, is_active, created_at, updated_at)
- [ ] Define `recurring_instances` table (UUID PK, recurring_item_id FK, occurrence_date, skipped, created_at, unique(recurring_item_id, occurrence_date))
- [ ] Define `audit_log` table (UUID PK, table_name, record_id, action, old_values JSONB, new_values JSONB, performed_by FK, significance, created_at)
- [ ] Define `currencies` reference table (code PK, name, symbol, decimal_places)
- [ ] Seed `currencies` with MXN, USD, EUR, GBP, JPY
- [ ] Create all indexes (see `backend-architecture.md` §3)
- [ ] Create `get_space_balances` SQL function
- [ ] Create `get_debt_group_balance` SQL function
- [ ] Create `get_period_stats` SQL function
- [ ] Create `audit_trigger_fn` trigger function
- [ ] Attach triggers to `ledger_items`, `debt_groups`, `spaces`
- [ ] Run `pnpm drizzle-kit push` to sync schema
- [ ] Run `pnpm drizzle-kit generate` to create migration files
- [ ] **Verify:** All tables exist in Neon, indexes are present, functions are callable

**Key decisions:**
- Use `uuid` type with `gen_random_uuid()` default for all PKs
- Use `numeric(12, 2)` for all monetary columns (not `decimal` — Drizzle uses `numeric`)
- Use `timestamp with time zone` (Drizzle `timestamp({ withTimezone: true })`)
- Use `jsonb` for audit_log old_values/new_values

**Files to modify:**
- `src/db/schema.ts` (expand from Phase 0 stub)

---

## Phase 2: Authentication (Better Auth)

**Duration:** ~2 days
**Goal:** Replace manual cookie sessions with Better Auth, update login/register/logout flows.

- [ ] Install Better Auth: `pnpm add better-auth`
- [ ] Create `src/lib/auth.ts` — Better Auth configuration
- [ ] Configure auth with database adapter (Drizzle)
- [ ] Set up `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` in `.env.local`
- [ ] Create `src/app/api/auth/[...betterauth]/route.ts` — catch-all auth handler
- [ ] Update `src/app/api/auth/login/route.ts` to use Better Auth
- [ ] Update `src/app/api/auth/register/route.ts` to use Better Auth
- [ ] Update `src/app/api/auth/logout/route.ts` to use Better Auth
- [ ] Update `src/hooks/use-auth.ts` to use Better Auth client
- [ ] Update `src/stores/auth-store.ts` to hydrate from Better Auth session
- [ ] Update `src/components/auth-guard.tsx` to use Better Auth
- [ ] Update `src/app/(auth)/login/page.tsx` to use Better Auth client
- [ ] Update `src/app/(auth)/register/page.tsx` to use Better Auth client
- [ ] Delete `src/lib/session.ts` (no longer needed)
- [ ] Update `proxy.ts` (middleware) to check Better Auth session
- [ ] **Verify:** Can register, login, logout, session persists across reloads

**Better Auth Configuration (`src/lib/auth.ts`):**

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // PostgreSQL
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
});
```

**Important:** Better Auth creates its own `user` and `session` tables. We need to:
1. Either use Better Auth's user table as our canonical `users` table
2. Or sync Better Auth users to our `users` table via hooks

**Decision:** Use Better Auth's user table. Our `users` table in Drizzle schema becomes a view or we extend Better Auth's user model with `name` and `avatar_url` fields.

Better Auth supports custom fields on the user model:

```typescript
export const auth = betterAuth({
  // ...
  user: {
    additionalFields: {
      name: {
        type: "string",
        required: true,
      },
      avatarUrl: {
        type: "string",
        required: false,
      },
    },
  },
});
```

This means we DON'T create a separate `users` table in Drizzle — we use Better Auth's.

**Files to create:**
- `src/lib/auth.ts`
- `src/app/api/auth/[...betterauth]/route.ts`

**Files to modify:**
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/hooks/use-auth.ts`
- `src/stores/auth-store.ts`
- `src/components/auth-guard.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/middleware.ts` or `proxy.ts`

**Files to delete:**
- `src/lib/session.ts`

---

## Phase 3: Core CRUD API Routes

**Duration:** ~3 days
**Goal:** Implement CRUD for spaces, debt groups, categories, and basic ledger items.

### Spaces API

- [ ] `GET /api/spaces` — List all spaces for authenticated user (JOIN space_members)
- [ ] `POST /api/spaces` — Create space (auto-generate invite_code, set owner)
- [ ] `PUT /api/spaces/[id]` — Update space name
- [ ] `DELETE /api/spaces/[id]` — Delete space (CASCADE to members, items)
- [ ] `POST /api/spaces/[id]/join` — Join via invite code
- [ ] `POST /api/spaces/[id]/leave` — Leave space
- [ ] `GET /api/spaces/[id]/members` — List members with names

### Debt Groups API

- [ ] `GET /api/debt-groups?spaceId=X` — List debt groups for space
- [ ] `POST /api/debt-groups` — Create debt group
- [ ] `PUT /api/debt-groups/[id]` — Update name/color
- [ ] `DELETE /api/debt-groups/[id]` — Delete (SET NULL on ledger_items.group_id)

### Categories API

- [ ] `GET /api/categories?spaceId=X` — List categories for space
- [ ] `POST /api/categories` — Create category
- [ ] `DELETE /api/categories/[id]` — Delete category

### Ledger Items (Basic CRUD)

- [ ] `POST /api/ledger-items` — Create item (set sort_order to MAX+1)
- [ ] `PUT /api/ledger-items/[id]` — Update item (increment version)
- [ ] `DELETE /api/ledger-items/[id]` — Delete item

**Authorization pattern for all routes:**

```typescript
// Every route must verify the user has access to the space
const session = await auth.api.getSession({ headers: request.headers });
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const userId = session.user.id;
const spaceId = /* from query params or body */;

// Check membership
const membership = await db.select().from(spaceMembers)
  .where(and(eq(spaceMembers.spaceId, spaceId), eq(spaceMembers.userId, userId)))
  .limit(1);

if (!membership.length) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

**Files to create:**
- `src/db/queries/spaces.ts`
- `src/db/queries/debt.ts`
- `src/db/queries/ledger.ts`
- `src/app/api/spaces/route.ts`
- `src/app/api/spaces/[id]/route.ts`
- `src/app/api/debt-groups/route.ts`
- `src/app/api/debt-groups/[id]/route.ts`
- `src/app/api/categories/route.ts`
- `src/app/api/ledger-items/route.ts`
- `src/app/api/ledger-items/[id]/route.ts`

---

## Phase 4: Ledger Items with Pagination

**Duration:** ~3 days
**Goal:** Implement the complex ledger query with period grouping, pagination, and date-range filtering.

### The Big Query

The `GET /api/ledger-items` endpoint is the most complex. It must:

1. Accept `spaceId`, `from`, `to`, `periodType`, `limit`, `offset`
2. Return items grouped by period with metadata
3. Include `updatedByName` via JOIN
4. Include `runningBalance` via SQL window function
5. Support pagination within and across periods

- [ ] Create `src/db/queries/ledger.ts` with `getLedgerItems` function
- [ ] Implement date-range filtering (`WHERE date >= from AND date <= to`)
- [ ] Implement period key generation (monthly/weekly/bi-weekly)
- [ ] JOIN `users` table to get `updatedByName`
- [ ] Compute `periodBalance`, `periodDebt`, `runningBalance` per period
- [ ] Return `periodKeys[]` ordered newest-first
- [ ] Return `periods` map with full metadata
- [ ] Implement pagination: load first 50, then up to 500
- [ ] Return `totalCount`, `hasMore`, `nextOffset`, `nextPeriodKey`
- [ ] Handle edge case: last period has < 10 items → auto-load next period
- [ ] **Verify:** Frontend `use-ledger.ts` can consume this response

### Implementation approach

Use Drizzle's relational query builder for the main query, then raw SQL for the window function (Drizzle supports `sql` tagged template):

```typescript
import { sql } from "drizzle-orm";

const items = await db
  .select({
    ...ledgerItems,
    updatedByName: users.name,
  })
  .from(ledgerItems)
  .leftJoin(users, eq(ledgerItems.updatedBy, users.id))
  .where(and(
    eq(ledgerItems.spaceId, spaceId),
    gte(ledgerItems.date, fromDate),
    lte(ledgerItems.date, toDate)
  ))
  .orderBy(ledgerItems.sortOrder)
  .limit(limit)
  .offset(offset);
```

For period stats, use the SQL function `get_period_stats()` defined in schema.

**Files to modify:**
- `src/db/queries/ledger.ts` (create)
- `src/app/api/ledger-items/route.ts` (create)
- `src/hooks/use-ledger.ts` (update `queryFn`)
- `src/hooks/use-grouped-ledger.ts` (update to consume new response shape)

---

## Phase 5: Balances & Period Stats

**Duration:** ~2 days
**Goal:** Update balance endpoints to use SQL functions, ensure frontend receives pre-computed values.

- [ ] Update `GET /api/balances?spaceId=X` to call `get_space_balances()` SQL function
- [ ] Update `GET /api/balances?spaceId=X&periodType=monthly` to include period rollups from `get_period_stats()`
- [ ] Ensure response matches `BalancesResponse` interface from `backend-architecture.md`
- [ ] Update `src/hooks/use-ledger.ts` balance query to use new endpoint
- [ ] Update `LedgerBalanceHeader` component (should require no changes if interface matches)
- [ ] **Verify:** Balance totals are correct, including recurring instances

**Files to modify:**
- `src/app/api/balances/route.ts`
- `src/hooks/use-ledger.ts`

---

## Phase 6: Audit Trail

**Duration:** ~1 day
**Goal:** Deploy audit triggers and verify they're firing.

- [ ] Verify `audit_trigger_fn` is defined in schema
- [ ] Verify triggers are attached to `ledger_items`, `debt_groups`, `spaces`
- [ ] Test: Create a ledger item → check `audit_log` has INSERT entry with significance='normal'
- [ ] Test: Reorder items → check `audit_log` has UPDATE entry with significance='internal'
- [ ] Create `GET /api/audit-log?table=ledger_items&recordId=X` for future UI use
- [ ] **Verify:** Triggers fire on all mutations, significance filtering works

**Files to create:**
- `src/app/api/audit-log/route.ts`

---

## Phase 7: Recurring Items

**Duration:** ~4 days
**Goal:** Full recurring items system — rules, instances, precomputation, skip/re-add.

### Recurring Rules CRUD

- [ ] `GET /api/recurring?spaceId=X` — List recurring rules for space
- [ ] `POST /api/recurring` — Create rule + trigger initial backfill
- [ ] `PUT /api/recurring/[id]` — Update rule + regenerate future instances
- [ ] `DELETE /api/recurring/[id]` — Delete rule (CASCADE to instances)

### Instance Management

- [ ] `GET /api/recurring/[id]/instances` — List instances for a rule (paginated)
- [ ] `POST /api/recurring/[id]/skip` — Mark instance as skipped
- [ ] Create instance precomputation logic
- [ ] Implement RRULE-like calculation (frequency_unit, interval_count, by_day, by_month_day)
- [ ] Implement backfill: generate instances from start_date to current_date
- [ ] Implement forward fill: cron job extends next_occurrence
- [ ] Handle edge cases: end_date, count limit, leap years, month-end (-1 = last day)

### Cron Job

- [ ] Create `src/app/api/cron/recurring/route.ts` (Vercel Cron compatible)
- [ ] Query: `SELECT * FROM recurring_items WHERE next_occurrence <= CURRENT_DATE AND is_active = true`
- [ ] For each due item: generate next batch of instances, update next_occurrence
- [ ] Set up Vercel Cron in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/recurring",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Period Totals with Recurring

- [ ] Update `get_period_stats` to include recurring instances (already in schema)
- [ ] Ensure skipped instances are excluded (`WHERE NOT skipped`)
- [ ] **Verify:** Ledger shows correct totals including recurring, skipped instances hidden

**Files to create:**
- `src/db/queries/recurring.ts`
- `src/lib/rrule.ts` (RRULE calculation utility)
- `src/app/api/recurring/route.ts`
- `src/app/api/recurring/[id]/route.ts`
- `src/app/api/recurring/[id]/instances/route.ts`
- `src/app/api/recurring/[id]/skip/route.ts`
- `src/app/api/cron/recurring/route.ts`

**Files to modify:**
- `src/db/schema.ts` (ensure recurring tables are correct)
- `src/hooks/use-ledger.ts` (period totals now include recurring)

---

## Phase 8: Realtime & Conflict Resolution

**Duration:** ~2 days
**Goal:** Add version-based conflict detection and optional realtime sync.

### Conflict Resolution

- [ ] Update `PUT /api/ledger-items/[id]` to accept `version` in body
- [ ] Add `WHERE id = X AND version = expectedVersion` to update query
- [ ] On version mismatch: return `409 Conflict` with current item data
- [ ] On success: increment version, return updated item
- [ ] Update frontend `use-ledger.ts` to send version on updates
- [ ] Update frontend to handle 409: toast + refresh item
- [ ] **Verify:** Two tabs editing same item → second gets 409 + refresh

### Realtime (Optional for Phase 8)

- [ ] Evaluate: Better Auth + Drizzle + Neon doesn't include realtime out of the box
- [ ] Options:
  - **Supabase Realtime standalone** (just the realtime part, not the full BaaS)
  - **Ably** (managed WebSocket service)
  - **PartyKit** (Cloudflare Workers-based)
  - **Server-Sent Events** (SSE) via Next.js (simplest, good enough for 15 users)
- [ ] **Decision:** Start with SSE. It's native to HTTP, no extra dependencies, and scales to 15 concurrent users easily.

**SSE Implementation:**

```typescript
// src/app/api/realtime/route.ts
export async function GET(request: Request) {
  const stream = new ReadableStream({
    start(controller) {
      // Subscribe to space changes
      // Push updates when ledger_items change
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
```

**Files to modify:**
- `src/app/api/ledger-items/[id]/route.ts` (add version check)
- `src/hooks/use-ledger.ts` (send version, handle 409)
- `src/app/api/realtime/route.ts` (optional)

---

## Phase 9: CSV Export & Final Polish

**Duration:** ~1 day
**Goal:** CSV export endpoint, final testing, cleanup.

- [ ] Create `GET /api/export?spaceId=X&from=&to=` endpoint
- [ ] Query items + recurring instances for date range
- [ ] Generate CSV with columns: Date, Description, Category, Amount, Currency, Type, Source
- [ ] Return as downloadable file (`Content-Disposition: attachment`)
- [ ] Update frontend to trigger export via `window.open('/api/export?...')`
- [ ] Remove `src/lib/data.ts` (or move to `src/lib/_legacy/data.ts` for reference)
- [ ] Run full test suite
- [ ] **Verify:** All features work end-to-end

**Files to create:**
- `src/app/api/export/route.ts`

**Files to modify:**
- `src/app/ledger/page.tsx` (add export button)

---

## Testing Strategy

### Unit Tests (Drizzle queries)

- [ ] Test `getLedgerItems` with various date ranges
- [ ] Test `get_space_balances` with mixed item types
- [ ] Test `get_period_stats` with different period types
- [ ] Test RRULE calculation for all frequency types
- [ ] Test pagination edge cases (empty result, single item, max limit)

### Integration Tests (API Routes)

- [ ] Test auth flow: register → login → access protected route → logout
- [ ] Test CRUD for each entity with auth headers
- [ ] Test 403 when accessing another user's space
- [ ] Test version conflict: two simultaneous edits
- [ ] Test recurring instance generation and skip

### E2E Tests (Playwright or Cypress)

- [ ] User journey: register → create space → add ledger item → view balances
- [ ] Drag and drop reorder
- [ ] Period switching (monthly → weekly → custom)
- [ ] Debt tracking flow
- [ ] Recurring items: create rule → verify instances appear → skip instance → verify totals

### Manual Testing Checklist

- [ ] Register new user
- [ ] Login with existing user
- [ ] Create space
- [ ] Invite another user to space
- [ ] Add ledger item
- [ ] Edit ledger item
- [ ] Delete ledger item
- [ ] Reorder items via drag & drop
- [ ] Switch period types
- [ ] View debt page
- [ ] Create debt group
- [ ] Add debt item
- [ ] Create recurring rule
- [ ] Verify instances appear in ledger
- [ ] Skip an instance
- [ ] Export CSV
- [ ] Logout and verify session cleared

---

## Security Checklist

- [ ] All API routes verify authentication (401 if no session)
- [ ] All API routes verify space membership (403 if not member)
- [ ] SQL injection prevention: use Drizzle query builder (never raw SQL with user input)
- [ ] XSS prevention: output encoding in frontend (already handled by React)
- [ ] CSRF protection: Better Auth handles this
- [ ] Rate limiting: implement on auth routes (register/login)
- [ ] Invite codes are cryptographically random (use `crypto.randomUUID()` or better)
- [ ] Passwords are hashed (Better Auth handles this)
- [ ] Session cookies are `httpOnly` (Better Auth default)
- [ ] Environment variables are not exposed to client
- [ ] Database connection string uses SSL (`sslmode=require`)

---

## Performance Checklist

- [ ] All queries use appropriate indexes (verify with `EXPLAIN ANALYZE`)
- [ ] Ledger query returns < 100ms for 9K items
- [ ] Balance query returns < 10ms
- [ ] Autocomplete returns < 10ms with trigram index
- [ ] Pagination keeps frontend memory < 2MB per space view
- [ ] Database connection pooling is configured (Neon handles this)
- [ ] N+1 queries eliminated (use JOINs, not nested selects)
- [ ] Audit triggers don't significantly slow down writes (< 5ms overhead)
- [ ] Recurring instance generation doesn't block API requests (async/cron)

---

## Migration from Mock DB

### Strategy: Dual-mode during transition

1. **Phase A (Parallel):** Keep `mockDb` working while building backend
2. **Phase B (Switch):** Add feature flag to toggle between mock and real
3. **Phase C (Cleanup):** Remove mock after full verification

### Feature Flag Implementation

```typescript
// src/lib/config.ts
export const USE_REAL_BACKEND = process.env.NEXT_PUBLIC_USE_REAL_BACKEND === "true";

// In hooks/use-ledger.ts
const queryFn = USE_REAL_BACKEND
  ? async () => { /* real API call */ }
  : async () => { /* mockDb call */ };
```

### Data Migration

When ready to switch:
- [ ] Export mock data to JSON
- [ ] Write migration script to insert into PostgreSQL
- [ ] Run script against Neon database
- [ ] Verify data integrity (counts match, relationships intact)
- [ ] Switch feature flag
- [ ] Monitor for errors

---

## Appendix: API Route Inventory

### Auth (Better Auth)
| Route | Method | Description |
|---|---|---|
| `/api/auth/[...betterauth]` | ALL | Better Auth catch-all handler |

### Spaces
| Route | Method | Description |
|---|---|---|
| `/api/spaces` | GET | List user's spaces |
| `/api/spaces` | POST | Create space |
| `/api/spaces/[id]` | PUT | Update space |
| `/api/spaces/[id]` | DELETE | Delete space |
| `/api/spaces/[id]/members` | GET | List members |
| `/api/spaces/[id]/join` | POST | Join via invite code |
| `/api/spaces/[id]/leave` | POST | Leave space |

### Ledger Items
| Route | Method | Description |
|---|---|---|
| `/api/ledger-items` | GET | List with pagination |
| `/api/ledger-items` | POST | Create item |
| `/api/ledger-items/[id]` | PUT | Update item |
| `/api/ledger-items/[id]` | DELETE | Delete item |
| `/api/ledger-items/reorder` | POST | Reorder items |

### Balances
| Route | Method | Description |
|---|---|---|
| `/api/balances` | GET | Get space balances |

### Debt
| Route | Method | Description |
|---|---|---|
| `/api/debt-groups` | GET | List debt groups |
| `/api/debt-groups` | POST | Create debt group |
| `/api/debt-groups/[id]` | PUT | Update debt group |
| `/api/debt-groups/[id]` | DELETE | Delete debt group |
| `/api/debt-category-sync` | POST | Bulk sync category |

### Recurring
| Route | Method | Description |
|---|---|---|
| `/api/recurring` | GET | List recurring rules |
| `/api/recurring` | POST | Create rule |
| `/api/recurring/[id]` | PUT | Update rule |
| `/api/recurring/[id]` | DELETE | Delete rule |
| `/api/recurring/[id]/instances` | GET | List instances |
| `/api/recurring/[id]/skip` | POST | Skip instance |

### Utilities
| Route | Method | Description |
|---|---|---|
| `/api/autocomplete` | GET | Autocomplete suggestions |
| `/api/export` | GET | CSV export |
| `/api/audit-log` | GET | Audit trail (future UI) |
| `/api/cron/recurring` | GET | Cron job for recurring items |

---

## Progress Tracking

Use this checklist to track overall progress:

- [ ] **Phase 0** — Foundation Setup (dependencies, config, connection)
- [ ] **Phase 1** — Database Schema & Drizzle (tables, indexes, functions)
- [ ] **Phase 2** — Authentication (Better Auth integration)
- [ ] **Phase 3** — Core CRUD API Routes (spaces, debt, categories, basic ledger)
- [ ] **Phase 4** — Ledger Items with Pagination (complex query, period grouping)
- [ ] **Phase 5** — Balances & Period Stats (SQL functions, frontend consumption)
- [ ] **Phase 6** — Audit Trail (triggers, verification)
- [ ] **Phase 7** — Recurring Items (rules, instances, cron, skip)
- [ ] **Phase 8** — Realtime & Conflict Resolution (version checks, SSE)
- [ ] **Phase 9** — CSV Export & Final Polish (export, cleanup, testing)

**Estimated total:** ~20 days of active development

---

## Notes for Implementation

### Drizzle ORM Patterns

**Select with joins:**
```typescript
const result = await db
  .select({
    item: ledgerItems,
    updatedByName: users.name,
  })
  .from(ledgerItems)
  .leftJoin(users, eq(ledgerItems.updatedBy, users.id))
  .where(eq(ledgerItems.spaceId, spaceId));
```

**Insert:**
```typescript
const [newItem] = await db
  .insert(ledgerItems)
  .values({ spaceId, amount, description, ... })
  .returning();
```

**Update with version check:**
```typescript
const [updated] = await db
  .update(ledgerItems)
  .set({ amount, description, version: sql`${ledgerItems.version} + 1` })
  .where(and(
    eq(ledgerItems.id, id),
    eq(ledgerItems.version, expectedVersion)
  ))
  .returning();

if (!updated) {
  return NextResponse.json({ error: "Conflict" }, { status: 409 });
}
```

**Raw SQL when needed:**
```typescript
const stats = await db.execute(sql`
  SELECT * FROM get_period_stats(${spaceId}, ${from}, ${to}, ${periodType})
`);
```

### Better Auth Patterns

**Get session in API route:**
```typescript
import { auth } from "@/lib/auth";

const session = await auth.api.getSession({ headers: request.headers });
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

**Client-side auth:**
```typescript
import { authClient } from "@/lib/auth-client";

const { data: session } = await authClient.useSession();
```

### Error Handling Pattern

All API routes should follow this pattern:

```typescript
export async function POST(request: Request) {
  try {
    // 1. Auth check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. Parse & validate body
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

    // 3. Authorization check
    const hasAccess = await checkSpaceAccess(session.user.id, parsed.data.spaceId);
    if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // 4. Execute query
    const result = await db.insert(...).values(...).returning();

    // 5. Return success
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("POST /api/ledger-items failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

---

*This plan is a living document. Update checklists as phases are completed. When in doubt, refer to `docs/backend-architecture.md` for architectural decisions and `docs/RECURRING_FRONTEND_FEATURE.md` for frontend specifications.*
