# Backend Architecture Plan

This document captures the backend technology evaluation, database schema design, and migration strategy for Wipu's transition from a frontend-only mock database to a production backend.

---

## Table of Contents

- [1. Current State](#1-current-state)
- [2. Backend Stack](#2-backend-stack)
- [3. Database Schema](#3-database-schema)
- [4. Feature Responsibility Map](#4-feature-responsibility-map)
- [5. Audit Trail Strategy](#5-audit-trail-strategy)
- [6. Conflict Resolution](#6-conflict-resolution)
- [7. Recurring Items](#7-recurring-items)
- [8. CSV Export](#8-csv-export)
- [9. Multi-Currency](#9-multi-currency)
- [10. Migration Phases](#10-migration-phases)
- [11. Scale Parameters](#11-scale-parameters)

---

## 1. Current State

All data lives in `src/lib/data.ts`, a `MockDatabase` class with in-memory arrays. TanStack Query treats it as a server via async functions with simulated delay. State is persisted to `localStorage` via Zustand.

### Current Data Flow

```
React Components
  → TanStack Query (cache + mutations)
    → hooks (use-ledger, use-spaces, use-debt)
      → mockDb.* methods (lib/data.ts)
        → in-memory arrays
```

### What Needs to Change

- `mockDb.*` calls → real database queries
- Cookie-based auth → proper auth provider
- `lib/data.ts` balance computations → SQL aggregates with `numeric` precision
- No realtime → live multi-user sync

### What Stays the Same

- Zustand stores (auth, space selection, UI preferences)
- TanStack Query hooks (swap `queryFn` internals only)
- All React components
- Animation system, UI primitives, layout components

---

## 2. Backend Stack

**Decision: Next.js API Routes + Drizzle ORM + Neon Postgres**

| Layer | Technology | Role |
|---|---|---|
| **Database** | [Neon](https://neon.tech/) (serverless PostgreSQL) | Primary data store. Scales to zero, database branching for dev/staging. |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) | Type-safe, schema-as-code, lightweight. Excellent TypeScript DX. |
| **API** | Next.js API Routes (existing) | Business logic, auth, authorization. Single Node runtime. |
| **Auth** | [Better Auth](https://www.better-auth.com/) or [Lucia](https://lucia-auth.com/) | Self-hosted auth with session management. No proprietary SDK. |
| **Realtime** | TBD (Ably, Partykit, or Supabase Realtime standalone) | Added when multi-user live sync becomes critical. |

### Why This Stack

- **The codebase already has API routes** (`/api/auth/*`, `/api/balances`, `/api/debt-groups`) — they stay and gain real database queries instead of `mockDb.*` calls
- **Single runtime** — Node/TypeScript everywhere, one mental model, one deployment target
- **Drizzle's type safety** is superior to generated types from BaaS solutions — schema-as-code means types are always in sync
- **Full control over authorization** — explicit middleware instead of complex RLS policies across 7+ tables
- **Neon's serverless Postgres** — free tier, scales to zero, database branching for dev/staging environments
- **No vendor lock-in** — Neon is standard Postgres, Drizzle works with any Postgres provider, auth is self-hosted
- **Predictable costs** — no surprise bills from realtime connections or database egress

### Alternatives Considered

**Supabase (BaaS):** Auth + RLS + Realtime bundled, but introduces a second runtime (Deno for Edge Functions), splits logic between Supabase client SDK and Next.js API routes, complex RLS policies for multi-level access, and unpredictable cost scaling. The codebase originally planned for Supabase, but the existing API route architecture aligns better with a direct ORM approach.

**Hybrid (Neon + Supabase Realtime only):** Viable — uses Neon as primary DB with Drizzle, adds only Supabase Realtime for live sync. This remains an option for Phase 4 (Realtime) if a standalone realtime service proves simpler than Ably or Partykit.

---

## 3. Database Schema

Use **PostgreSQL `NUMERIC(12,2)`** for all monetary values. Never `float` or `real`.

```sql
-- ═══════════════════════════════════════
-- REFERENCE TABLES
-- ═══════════════════════════════════════

CREATE TABLE currencies (
  code TEXT PRIMARY KEY,              -- 'MXN', 'USD', 'EUR'
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,               -- '$', '€', '¥'
  decimal_places INT DEFAULT 2
);

INSERT INTO currencies (code, name, symbol) VALUES
  ('MXN', 'Mexican Peso', '$'),
  ('USD', 'US Dollar', '$'),
  ('EUR', 'Euro', '€'),
  ('GBP', 'British Pound', '£'),
  ('JPY', 'Japanese Yen', '¥');

-- ═══════════════════════════════════════
-- CORE TABLES
-- ═══════════════════════════════════════

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES users(id),
  max_members INT DEFAULT 15,
  invite_code TEXT UNIQUE NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MXN' REFERENCES currencies(code),
  is_personal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE space_members (
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',         -- 'owner' | 'member'
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (space_id, user_id)
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  UNIQUE (space_id, name)
);

CREATE TABLE debt_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ledger_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MXN' REFERENCES currencies(code),
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL DEFAULT 'default', -- 'default' | 'debt'
  group_id UUID REFERENCES debt_groups(id) ON DELETE SET NULL,
  sort_order INT NOT NULL DEFAULT 0,
  version INT NOT NULL DEFAULT 1,       -- optimistic locking
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════
-- RECURRING ITEMS
-- ═══════════════════════════════════════

CREATE TABLE recurring_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MXN' REFERENCES currencies(code),
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'default',
  group_id UUID REFERENCES debt_groups(id) ON DELETE SET NULL,
  frequency TEXT NOT NULL,              -- 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'
  interval INT NOT NULL DEFAULT 1,      -- every N frequency units
  day_of_month INT,                     -- 1-31 for monthly
  day_of_week INT,                      -- 0-6 for weekly (Mon-Sun)
  start_date DATE NOT NULL,
  end_date DATE,                        -- null = indefinite
  next_occurrence DATE NOT NULL,        -- pre-computed for cron queries
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════
-- AUDIT LOG
-- ═══════════════════════════════════════

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,                 -- 'INSERT' | 'UPDATE' | 'DELETE'
  old_values JSONB,
  new_values JSONB,
  performed_by UUID REFERENCES users(id),
  significance TEXT NOT NULL DEFAULT 'normal', -- 'normal' | 'internal'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Retention: auto-delete internal audit entries older than 90 days
-- Normal (user-visible) entries are kept for 1 year
-- Schedule via pg_cron or application-level cron:
-- DELETE FROM audit_log WHERE
--   (significance = 'internal' AND created_at < now() - INTERVAL '90 days')
--   OR created_at < now() - INTERVAL '1 year';

-- ═══════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════

CREATE INDEX idx_ledger_space_date ON ledger_items(space_id, date DESC);
CREATE INDEX idx_ledger_space_type ON ledger_items(space_id, type);
CREATE INDEX idx_ledger_space_group ON ledger_items(space_id, group_id);
CREATE INDEX idx_ledger_space_sort ON ledger_items(space_id, sort_order);
CREATE INDEX idx_recurring_next ON recurring_items(next_occurrence, is_active);
CREATE INDEX idx_recurring_space ON recurring_items(space_id);
CREATE INDEX idx_audit_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_user ON audit_log(performed_by);
CREATE INDEX idx_audit_time ON audit_log(created_at DESC);
CREATE INDEX idx_audit_retention ON audit_log(significance, created_at);

-- Autocomplete: trigram index for fast ILIKE queries at scale
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_ledger_description_trgm ON ledger_items USING gin (description gin_trgm_ops);
CREATE INDEX idx_ledger_category_trgm ON ledger_items USING gin (category gin_trgm_ops);

-- ═══════════════════════════════════════
-- BALANCE FUNCTIONS
-- ═══════════════════════════════════════

CREATE OR REPLACE FUNCTION get_space_balances(p_space_id UUID)
RETURNS TABLE(
  total_balance NUMERIC,
  total_debt NUMERIC,
  real_balance NUMERIC
) AS $$
  SELECT
    COALESCE(SUM(amount), 0) AS total_balance,
    COALESCE(SUM(CASE WHEN type = 'debt' THEN amount ELSE 0 END), 0) AS total_debt,
    COALESCE(SUM(CASE WHEN type = 'default' THEN amount ELSE 0 END), 0) AS real_balance
  FROM ledger_items
  WHERE space_id = p_space_id;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_debt_group_balance(p_space_id UUID, p_group_id UUID)
RETURNS NUMERIC AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM ledger_items
  WHERE space_id = p_space_id
    AND type = 'debt'
    AND group_id = p_group_id;
$$ LANGUAGE sql STABLE;
```

### Schema Notes

- `members` array on Space is normalized into a `space_members` join table for proper FK constraints and role management
- `version` field on `ledger_items` enables optimistic locking for conflict resolution
- `currency` on both `spaces` (default) and `ledger_items` (per-item override) prepares for multi-currency
- `next_occurrence` on `recurring_items` is pre-computed for efficient cron queries
- `significance` on `audit_log` separates user-visible changes from internal noise (sort_order updates)

---

## 4. Feature Responsibility Map

### Backend Responsibilities

| Feature | Why Backend |
|---|---|
| Balance totals (SUM, running totals) | SQL aggregates with `NUMERIC` precision — single source of truth |
| All CRUD mutations | Auth + authorization validation, atomic transactions |
| Entity relationships (FK, cascades) | Database-enforced integrity |
| Space membership enforcement | `maxMembers` check must be server-side to prevent races |
| Invite code generation/validation | Cryptographically secure, server-validated |
| Debt category sync | Atomic bulk update (transaction) |
| `sortOrder` persistence | Backend stores integer positions after DnD reorder |
| Default sort on fetch | `ORDER BY sort_order` in query |
| Recurring item generation | Daily cron job creates new ledger items |
| CSV export | Server-generated to avoid loading all data client-side |
| Audit trail | Postgres triggers — bypass-proof |

### Frontend Responsibilities

| Feature | Why Frontend |
|---|---|
| Column-header sorting (date, amount, etc.) | Ephemeral view preference — doesn't change data |
| Period type selection (monthly, weekly, etc.) | UI preference persisted in Zustand |
| Period grouping logic | Client-side grouping of date-range-filtered items — flexible for instant period switching |
| Active space selection | Pure client state (which space is currently viewed) |
| `includesDebt` toggle | Visual preference — whether debt items are dimmed |
| Currency formatting | `Intl.NumberFormat` with locale — belongs in UI layer |
| Optimistic updates | TanStack Query optimistically adjusts totals on add/edit |
| Drag & drop interaction | DnD Kit handles the gesture; sends final order to backend |
| Custom date range picker | UI control; sends `from`/`to` params to backend queries |

### Backend-Driven (Required at Scale)

| Feature | Why Backend |
|---|---|
| Date-range filtering | At 4,500 items/month, the API must accept `from`/`to` params and return only the relevant slice. The frontend fetches the current visible period range + 1 period ahead/behind for smooth scrolling. |
| Autocomplete | At 54K+ items, client-side `.filter()` is too slow. Server-side `ILIKE` with a GIN trigram index handles this in <1ms. |
| Period balance rollups | Running balances across ALL periods must be computed server-side via SQL window functions. |

### Shared Responsibilities

| Feature | Frontend | Backend |
|---|---|---|
| Period grouping | Groups date-filtered items for display | Returns items filtered by `from`/`to` date range |
| Sorting within groups | Sorts items by selected column | Returns items in `sortOrder` by default |

---

## 5. Audit Trail Strategy

**Approach: Postgres triggers with significance filtering.**

Triggers capture ALL changes (bypass-proof), but a `significance` column distinguishes user-visible changes from internal noise.

### How It Works

1. Postgres trigger fires on every INSERT/UPDATE/DELETE on audited tables
2. Trigger function checks which columns changed
3. If only internal fields changed (`sort_order`, `updated_at`, `version`), significance = `'internal'`
4. If user-visible fields changed (`amount`, `description`, `category`, `date`), significance = `'normal'`
5. UI queries `WHERE significance = 'normal'` for the user-facing changelog

### Trigger Function

```sql
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER AS $$
DECLARE
  v_significance TEXT := 'normal';
  v_user_id UUID;
BEGIN
  v_user_id := COALESCE(
    CASE WHEN TG_OP != 'DELETE' THEN NEW.updated_by END,
    CASE WHEN TG_OP != 'INSERT' THEN OLD.updated_by END
  );

  IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'ledger_items' THEN
    IF OLD.amount = NEW.amount
       AND OLD.description = NEW.description
       AND OLD.category = NEW.category
       AND OLD.date = NEW.date
       AND OLD.type = NEW.type
       AND OLD.group_id IS NOT DISTINCT FROM NEW.group_id THEN
      v_significance := 'internal';
    END IF;
  END IF;

  INSERT INTO audit_log (
    table_name, record_id, action,
    old_values, new_values,
    performed_by, significance
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(CASE WHEN TG_OP != 'DELETE' THEN NEW.id END,
             CASE WHEN TG_OP != 'INSERT' THEN OLD.id END),
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) END,
    v_user_id,
    v_significance
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Attach to audited tables
CREATE TRIGGER audit_ledger_items
  AFTER INSERT OR UPDATE OR DELETE ON ledger_items
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_debt_groups
  AFTER INSERT OR UPDATE OR DELETE ON debt_groups
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_spaces
  AFTER INSERT OR UPDATE OR DELETE ON spaces
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
```

### Comparison: App-Level Log vs Triggers

| Criterion | App-Level Log | Postgres Triggers |
|---|---|---|
| Completeness | Only logs what you code | Captures ALL changes |
| Bypass-proof | Can be skipped if dev forgets | Cannot be bypassed |
| Performance | Selective (faster) | Every row (slightly slower) |
| `performed_by` | Easy (userId in context) | Requires `updated_by` column or `SET LOCAL` |
| Flexibility | Custom context, skip boring fields | Logs everything (filter via significance) |
| Maintenance | Must add logging to every mutation | One trigger per table |
| Storage cost | Lower (selective) | Higher (full row snapshots) |

The hybrid approach uses triggers for completeness + significance filtering for a clean UI.

---

## 6. Conflict Resolution

**Approach: Optimistic locking via `version` field.**

### How It Works

1. Every `ledger_item` has a `version` (starts at 1)
2. On update, the API sends `WHERE id = X AND version = expectedVersion`
3. If the version matches, the update succeeds and increments version
4. If it doesn't match (someone else edited the item), the API returns 409 Conflict
5. The frontend surfaces a conflict resolution UI

### Why Not CRDTs

CRDTs (Yjs, Automerge) are designed for:
- Hundreds editing the same document
- Hours/days offline
- Free-form text or complex nested data

Wipu has:
- 2-15 people, rarely editing the same item
- Seconds offline at worst
- Structured records (amount, description, category)

Optimistic locking is the right tool for this scale and data shape.

---

## 7. Recurring Items

### Data Model

A `recurring_items` table stores templates with recurrence configuration. A `next_occurrence` column is pre-computed for efficient cron queries.

### Processing Flow

1. Daily cron job (Vercel Cron, GitHub Actions, or pg_cron) triggers the processor
2. Query: `SELECT * FROM recurring_items WHERE next_occurrence <= CURRENT_DATE AND is_active = true`
3. For each due item: INSERT into `ledger_items`, UPDATE `next_occurrence`
4. Realtime subscription notifies connected clients

### Frequencies Supported

- Daily
- Weekly (configurable day)
- Bi-weekly
- Monthly (configurable day of month)
- Yearly

---

## 8. CSV Export

Server-side CSV generation via an API route or Edge Function. Accepts `spaceId`, `from`, and `to` parameters. Returns a downloadable CSV file with columns: Date, Description, Category, Amount, Currency, Type.

Frontend triggers via `window.open('/api/export?...')`.

---

## 9. Multi-Currency

### Current Phase

Default currency is MXN. The `currency` column exists on both `spaces` (default) and `ledger_items` (per-item) but always defaults to `'MXN'`.

`formatCurrency` accepts a currency code parameter but defaults to `'MXN'`.

### Future Phase (When Needed)

- Add a currency picker to Space settings
- Items inherit the space currency by default, with per-item override
- Balance computations need exchange rates (separate table + external API)
- Never sum amounts of different currencies — show separate balance lines per currency or convert to a base currency

---

## 10. Migration Phases

| Phase | Scope | Estimated Effort |
|---|---|---|
| **1. Foundation** | Database tables, indexes, triggers. Auth setup (Better Auth or Supabase Auth). Remove cookie-based sessions. | ~3 days |
| **2. Core CRUD** | Replace `mockDb.*` calls with real DB queries in hooks/API routes. Keep TanStack Query layer. | ~5 days |
| **3. Balances + Audit** | Deploy SQL balance functions. Activate audit triggers. Update `formatCurrency` to MXN. | ~3 days |
| **4. Realtime + Conflicts** | Add realtime subscriptions for live multi-user sync. Implement version-based conflict detection + UI. | ~3 days |
| **5. Recurring + Export** | Recurring item cron processor. CSV export endpoint. | ~3 days |

**Total: ~17 days**

The frontend stays ~90% unchanged. The hook/store architecture was designed for this swap.

---

## 11. Scale Parameters

### Capacity Targets

| Parameter | Value |
|---|---|
| Max entries per user per month | 300 |
| Max users per space | 15 |
| Worst-case items per space per month | 4,500 (300 × 15) |
| Items per space per year | ~54,000 |
| Items per space over 2 years | ~108,000 |

### What These Numbers Mean

**Database:** Trivial for PostgreSQL. 108K rows with proper indexes (`space_id, date`) returns results in single-digit milliseconds.

**Frontend grouping:** Client-side grouping of ALL items is no longer viable at 54K items. The API must return date-range-filtered slices (typically 1-2 months worth = 4,500-9,000 items), which the frontend then groups by period. This keeps the TanStack Query cache at ~1-2MB per space view.

**Autocomplete:** Client-side `.filter()` over 54K descriptions adds perceptible lag. Server-side `ILIKE` with `pg_trgm` (trigram) index handles this in <1ms.

**Balance calculations:** `SUM()` over 108K rows with `idx_ledger_space_date` runs in <5ms. No concern.

**Audit log growth:** At worst case (every item edited twice): ~9,000 audit entries/month/space. With the retention policy (internal entries: 90 days, normal entries: 1 year), the audit table stays bounded.

**Realtime:** 15 concurrent WebSocket connections per space is well within limits for any realtime service.

### API Pagination Strategy

The ledger API must support date-range filtering:

```
GET /api/ledger-items?spaceId=X&from=2026-04-01&to=2026-04-30
```

The frontend fetches the current visible period range plus one period ahead and behind for smooth infinite scrolling. This keeps the in-memory working set to ~4,500-9,000 items — well within browser memory and grouping performance limits.

Autocomplete uses a dedicated server-side endpoint:

```
GET /api/autocomplete?spaceId=X&field=description&q=rent
GET /api/autocomplete?spaceId=X&field=category&q=food
```
