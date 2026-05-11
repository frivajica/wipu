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
- [12. API Response Shape](#12-api-response-shape)

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
  frequency_unit TEXT NOT NULL,               -- 'days' | 'weekly' | 'monthly' | 'yearly'
  interval_count INT NOT NULL DEFAULT 1,      -- every N units (e.g., 2 + weekly = biweekly)
  by_day TEXT,                                -- comma-separated days for weekly: 'MO,WE,FR'
  by_month_day INT,                           -- day of month for monthly (1-31, -1 for last)
  start_date DATE NOT NULL,
  end_date DATE,                              -- null = indefinite
  count INT,                                  -- null = no limit
  next_occurrence DATE NOT NULL,              -- pre-computed cache for cron queries
  last_computed_at TIMESTAMPTZ DEFAULT now(), -- track instance backfill progress
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE recurring_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recurring_item_id UUID REFERENCES recurring_items(id) ON DELETE CASCADE,
  occurrence_date DATE NOT NULL,
  skipped BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(recurring_item_id, occurrence_date)
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
CREATE INDEX idx_ledger_space_normal ON ledger_items(space_id, date DESC) WHERE type = 'default';
CREATE INDEX idx_recurring_next ON recurring_items(next_occurrence, is_active);
CREATE INDEX idx_recurring_space ON recurring_items(space_id);
CREATE INDEX idx_recurring_instances_item_date ON recurring_instances(recurring_item_id, occurrence_date);
CREATE INDEX idx_recurring_instances_date ON recurring_instances(occurrence_date);
CREATE INDEX idx_recurring_instances_skipped ON recurring_instances(recurring_item_id, skipped) WHERE skipped = false;
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
  WITH all_items AS (
    SELECT amount, type FROM ledger_items WHERE space_id = p_space_id
    UNION ALL
    SELECT r.amount, r.type
    FROM recurring_instances ri
    JOIN recurring_items r ON ri.recurring_item_id = r.id
    WHERE r.space_id = p_space_id AND NOT ri.skipped
  )
  SELECT
    COALESCE(SUM(amount), 0) AS total_balance,
    COALESCE(SUM(CASE WHEN type = 'debt' THEN amount ELSE 0 END), 0) AS total_debt,
    COALESCE(SUM(CASE WHEN type = 'default' THEN amount ELSE 0 END), 0) AS real_balance
  FROM all_items;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_debt_group_balance(p_space_id UUID, p_group_id UUID)
RETURNS NUMERIC AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM ledger_items
  WHERE space_id = p_space_id
    AND type = 'debt'
    AND group_id = p_group_id;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_period_stats(
  p_space_id UUID,
  p_from DATE,
  p_to DATE,
  p_period_type TEXT  -- 'monthly' | 'weekly' | 'biweekly'
)
RETURNS TABLE(
  period_key TEXT,
  period_start DATE,
  period_end DATE,
  period_balance NUMERIC,
  period_debt NUMERIC,
  running_balance NUMERIC,
  item_count INT
) AS $$
  WITH
  -- Union normal ledger items with non-skipped recurring instances
  all_items AS (
    SELECT date, amount, type FROM ledger_items
    WHERE space_id = p_space_id AND date >= p_from AND date <= p_to
    UNION ALL
    SELECT ri.occurrence_date, r.amount, r.type
    FROM recurring_instances ri
    JOIN recurring_items r ON ri.recurring_item_id = r.id
    WHERE r.space_id = p_space_id AND NOT ri.skipped
      AND ri.occurrence_date >= p_from AND ri.occurrence_date <= p_to
  ),
  -- Assign period key based on period type
  with_period AS (
    SELECT
      date, amount, type,
      CASE p_period_type
        WHEN 'weekly'    THEN to_char(date, 'IYYY-"W"IW')
        WHEN 'biweekly'  THEN to_char(date, 'IYYY-"W"IW')  -- grouped pairs in app layer
        ELSE to_char(date, 'YYYY-MM')
      END AS period_key,
      CASE p_period_type
        WHEN 'weekly'    THEN date_trunc('week', date)::DATE
        WHEN 'biweekly'  THEN date_trunc('week', date)::DATE
        ELSE date_trunc('month', date)::DATE
      END AS period_start,
      CASE p_period_type
        WHEN 'weekly'    THEN (date_trunc('week', date) + INTERVAL '6 days')::DATE
        WHEN 'biweekly'  THEN (date_trunc('week', date) + INTERVAL '13 days')::DATE
        ELSE (date_trunc('month', date) + INTERVAL '1 month - 1 day')::DATE
      END AS period_end
    FROM all_items
  ),
  -- Aggregate per period
  period_sums AS (
    SELECT
      period_key, period_start, period_end,
      COALESCE(SUM(CASE WHEN type = 'default' THEN amount ELSE 0 END), 0)
        + COALESCE(SUM(CASE WHEN type = 'debt' THEN amount ELSE 0 END), 0) AS period_balance,
      COALESCE(SUM(CASE WHEN type = 'debt' THEN amount ELSE 0 END), 0) AS period_debt,
      COUNT(*) AS item_count
    FROM with_period
    GROUP BY period_key, period_start, period_end
  ),
  -- Running balance via window function
  with_running AS (
    SELECT
      period_key, period_start, period_end,
      period_balance, period_debt, item_count,
      SUM(period_balance) OVER (ORDER BY period_start ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_balance
    FROM period_sums
  )
  SELECT period_key, period_start, period_end, period_balance, period_debt, running_balance, item_count
  FROM with_running
  ORDER BY period_start DESC;
$$ LANGUAGE sql STABLE;
```

### Schema Notes

- `members` array on Space is normalized into a `space_members` join table for proper FK constraints and role management
- `version` field on `ledger_items` enables optimistic locking for conflict resolution — frontend sends it on every update
- `currency` on both `spaces` (default) and `ledger_items` (per-item override) prepares for multi-currency
- `recurring_items` uses RRULE-like fields (`frequency_unit`, `interval_count`, `by_day`, `by_month_day`) to generate occurrences; `next_occurrence` + `last_computed_at` track precomputed cache
- `recurring_instances` stores one row per generated occurrence — enables per-instance skip/re-add and fast balance computation
- Skipped instances stay skipped permanently — `skipped = true` excludes them from all totals forever; re-add is done by creating a manual ledger item (no special restore needed)
- `significance` on `audit_log` separates user-visible changes from internal noise (sort_order updates)
- `idx_ledger_space_normal` partial index filters to `type = 'default'` only — used for period visibility and last-normal-item queries

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
| `sortOrder` storage | `sort_order` INT column on `ledger_items` persisted by the backend; default sort on fetch is `ORDER BY sort_order` |
| `sortOrder` reassignment after drag | On `POST /api/ledger-items/reorder`, backend assigns `sort_order = 0, 1, 2...` sequentially from received `itemIds[]` in a single transaction; marked `significance = 'internal'` in audit log |
| Recurring instance precomputation | Cron job generates + stores all occurrences; skip/re-add via mutations |
| Period visibility | Query determines which periods contain normal items; only those are returned |
| CSV export | Server-generated to avoid loading all data client-side |
| Audit trail | Postgres triggers — bypass-proof |

### Frontend Responsibilities

| Feature | Why Frontend |
|---|---|
| Column-header sorting (date, amount, etc.) | Ephemeral view preference — doesn't change data |
| Period type selection (monthly, weekly, etc.) | UI preference persisted in Zustand |
| Period grouping | The API returns `periodKeys[]` (ordered list of period identifiers) and items pre-filtered to the date range. Frontend iterates the bounded slice and groups by period name — still client-side because data is pre-filtered (~9,000 items max per query window, completes in <5ms) |
| Active space selection | Pure client state (which space is currently viewed) |
| `includesDebt` toggle | Purely visual — does NOT affect API calls. API always returns all items. Frontend dims `type='debt'` rows and switches "Total" pill between `realBalance` and `totalBalance` |
| Currency formatting | `Intl.NumberFormat` with locale — belongs in UI layer |
| Optimistic updates | TanStack Query optimistically adjusts totals on add/edit |
| Drag & drop interaction | DnD Kit handles the gesture; sends final order to backend |
| Custom date range picker | UI control; sends `from`/`to` params to backend queries |
| Recurring item skip/re-add | Toggle `skipped` flag on `recurring_instances` rows |
| Recurring item CRUD UI | Create/edit/delete recurring rule templates |

### Backend-Driven (Required at Scale)

| Feature | Why Backend |
|---|---|
| Date-range filtering | At 4,500 items/month, the API must accept `from`/`to` params and return only the relevant slice. The frontend fetches the current visible period range + 1 period ahead/behind for smooth scrolling. |
| Autocomplete | At 54K+ items, client-side `.filter()` is too slow. Server-side `ILIKE` with a GIN trigram index handles this in <1ms. |
| Period balance rollups | SQL window functions compute running_balance per period; returned in API response for PeriodHeader hover cards — frontend never sums client-side |
| Recurring instance generation | Precompute all historical + future instances; store in `recurring_instances` for fast SUM queries |
| Period visibility detection | Query `MAX(date) FROM ledger_items WHERE type = 'default'` per space to know last visible period |

### Shared Responsibilities

| Feature | Frontend | Backend |
|---|---|---|
| Period grouping | Groups pre-filtered items by period name | Returns `periodKeys[]` + date-range-filtered slice |
| Sorting within groups | Sorts loaded items by selected column (ephemeral, not persisted) | Returns items ordered by `sort_order` (manual order) |
| Recurring in period response | Renders merged item list; `instanceSource: 'recurring'` flag available for optional visual treatment | Returns single merged array per period (normal ledger_items + non-skipped recurring instances) with `instanceSource` field |
| Period visibility | Renders only periods returned by API | Determines visible periods from normal item dates; recurring alone doesn't create periods |

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

**Approach: Optimistic locking via `version` field, simple 409 handling.**

### How It Works

1. Every `ledger_item` has a `version` (starts at 1). The frontend sends `version` on every update even before the backend enforces it — future-proofing.
2. On update, the API sends `WHERE id = X AND version = expectedVersion`
3. If the version matches, the update succeeds and increments version
4. If it doesn't match (someone else edited the item), the API returns 409 Conflict
5. On 409: show toast "This item was modified by someone else" + auto-refresh the item

### Future Extension

The architecture does not close the door on proper conflict resolution UI (show diff, allow "Keep mine" / "Keep theirs" / "Merge"). The `version` field and 409 response are the foundation. When ready, the frontend can expand from simple toast to a resolution dialog without backend changes.

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

The recurring system follows a **rule-based model with precomputed instances** (Option A + S2).

**`recurring_items`** stores the RRULE-like rule template:
- `frequency_unit`: `days` | `weekly` | `monthly` | `yearly`
- `interval_count`: every N units (e.g., 2 + `weekly` = biweekly)
- `by_day`: comma-separated days for weekly (e.g., `MO,WE,FR`)
- `by_month_day`: day of month for monthly (1-31, -1 = last day)
- `start_date`: when recurrence begins
- `end_date`: optional hard stop (null = indefinite)
- `count`: optional max occurrences (null = no limit)
- `next_occurrence`: pre-computed date for efficient cron queries
- `last_computed_at`: timestamp for incremental recompute

**`recurring_instances`** stores one row per generated occurrence:
- `occurrence_date`: the calculated date of this instance
- `skipped`: boolean — if true, excluded from all totals permanently

### Instance Generation

**Initial backfill:** When a recurring item is created (or on first migration), a backfill job generates all historical instances from `start_date` up to the current date.

**Forward precomputation:** A cron job runs daily (or on each page load with staleness check) to extend `next_occurrence` forward up to `end_date` or `count` limit. New instances are inserted into `recurring_instances`.

**Incremental updates:** If `last_computed_at` is stale (e.g., cron missed a day), the job catches up from the last computed date rather than recomputing everything.

### Skip / Re-add Flow

- **Skip:** User marks an instance as skipped → `UPDATE recurring_instances SET skipped = true WHERE id = X`. The instance stays skipped permanently. It no longer appears in totals and is never auto-unskipped.
- **Re-add:** User creates a normal ledger item manually with the same details (existing workflow — no special restore needed).

### Totals & Period Visibility

**Period visibility** is driven by normal (non-recurring) items only. A period (month/week/biweek) is visible if it contains at least one `ledger_item` with `type = 'default'`. Recurring instances alone never create or reveal a period.

**Totals per period** = SUM of normal items in that period + SUM of non-skipped recurring instances where `occurrence_date` falls within the period's date range.

**Custom date ranges:** The last normal item's date acts as the boundary. If the last normal item is Feb 28, only periods up to and including February are visible. March and April are hidden even if they have recurring instances — unless those periods also contain at least one normal item.

### Balance Function (updated)

```sql
CREATE OR REPLACE FUNCTION get_space_balances(p_space_id UUID)
RETURNS TABLE(
  total_balance NUMERIC,
  total_debt NUMERIC,
  real_balance NUMERIC
) AS $$
  WITH all_items AS (
    SELECT amount, type FROM ledger_items WHERE space_id = p_space_id
    UNION ALL
    SELECT ri.amount, ri.type
    FROM recurring_instances ri
    JOIN recurring_items r ON ri.recurring_item_id = r.id
    WHERE r.space_id = p_space_id AND NOT ri.skipped
  )
  SELECT
    COALESCE(SUM(amount), 0) AS total_balance,
    COALESCE(SUM(CASE WHEN type = 'debt' THEN amount ELSE 0 END), 0) AS total_debt,
    COALESCE(SUM(CASE WHEN type = 'default' THEN amount ELSE 0 END), 0) AS real_balance
  FROM all_items;
$$ LANGUAGE sql STABLE;
```

`ri.amount` is inherited from the parent `recurring_items` row — not stored in `recurring_instances` itself, so the UNION must JOIN to get it. The `WHERE NOT ri.skipped` ensures skipped instances never contribute.

### Recurring Items Tab (UI Scope)

The `/recurring` route is a top-level tab (alongside `/ledger`, `/debt`) for managing recurring items. Configuration is per-space — the active space selector applies.

UI responsibilities:
- List all recurring rules in the active space
- Show next occurrence and instance count per rule
- Create/edit/delete recurring rules with the full RRULE-like field set
- List instances per rule with skip toggle
- Future: show which periods an instance affects

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
| **0. Pre-work** | Add `version` to all frontend update mutations (sent even if backend ignores it). Add `frequency_unit`, `interval_count`, `by_day`, `by_month_day` fields to `recurring_items` (empty initially). Add `recurring_instances` table stub. | ~1 day |
| **1. Foundation** | Database tables, indexes, triggers. Auth setup (Better Auth free). Remove cookie-based sessions. | ~3 days |
| **2. Core CRUD** | Replace `mockDb.*` calls with real DB queries in hooks/API routes. Keep TanStack Query layer. Pagination + date-range filtering for `/api/ledger-items`. | ~5 days |
| **3. Balances + Audit** | Deploy SQL balance functions. Activate audit triggers. Update `formatCurrency` to MXN. | ~3 days |
| **4. Realtime + Conflicts** | Add realtime subscriptions for live multi-user sync. Implement version-based conflict detection (409 toast + refresh). | ~3 days |
| **5. Recurring + Export** | `recurring_instances` table, instance precomputation, skip/re-add mutations, period totals with recurring join, `/recurring` tab. CSV export endpoint. | ~5 days |

**Total: ~20 days**

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

The ledger API returns items in **manual sort order** (default `ORDER BY sort_order`). The frontend applies column-header sort client-side on loaded items.

**Pagination model:**

```
GET /api/ledger-items?spaceId=X&from=2026-04-01&to=2026-04-30&limit=50&offset=0
GET /api/ledger-items?spaceId=X&from=2026-04-01&to=2026-04-30&limit=500&offset=50
```

**Load rules:**
1. Always load at least the last registered period group (the one with the most recent normal item)
2. If the group's items > 50: load first 50 immediately, lazy-load rest up to 500 max (subsequent requests)
3. If the group's items < 10: automatically load the next group following the same load-first-50/lazy-rest-up-to-500 rule
4. If all items in a group are already loaded, infinite scroll triggers fetch of the next group
5. API response includes `totalCount` for scroll UI display

**Period grouping:** The API returns `periodKeys` (ordered list of period identifiers) so the frontend can render period groups without having to compute grouping client-side on paginated data.

**Infinite scroll flow:** Frontend tracks `loadedCount` per period group and fetches the next slice when the user scrolls to the bottom of a group.

**Autocomplete** uses a dedicated endpoint scoped to all spaces the user belongs to:

```
GET /api/autocomplete?field=description&q=rent
GET /api/autocomplete?field=category&q=food
```

Server-side `ILIKE` with a GIN trigram index handles this in <1ms. If space-limited autocomplete becomes necessary, the API accepts an optional `spaceId` filter, with a future migration path to full multi-space search.

---

## 12. API Response Shape

### Ledger Items API

**`GET /api/ledger-items?spaceId=X&from=YYYY-MM-DD&to=YYYY-MM-DD&periodType=monthly&limit=500&offset=0`**

The response is structured around **period groups**, not a flat item list. The backend uses `get_period_stats()` to compute per-period balances and running totals, and returns the full payload needed to render the ledger UI without additional computation.

```typescript
interface LedgerItemsResponse {
  // Period group metadata — ordered newest-first
  periodKeys: string[];  // e.g. ["April 2026", "March 2026"]

  // Per-period data map keyed by periodKey
  periods: Record<string, PeriodGroupData>;

  // Pagination
  pagination: {
    totalCount: number;      // total items in date range (for scroll UI)
    hasMore: boolean;        // more items exist in this period beyond 500 limit
    nextOffset: number;      // offset for next slice within current period
    nextPeriodKey: string | null;  // if current period exhausted, next group to fetch
    nextPeriodOffset: number;      // offset to start at for next group
  };
}

interface PeriodGroupData {
  periodStart: string;      // ISO date — first day of period
  periodEnd: string;        // ISO date — last day of period
  periodBalance: number;    // SUM(normal items + non-skipped recurring) for this period
  periodDebt: number;       // SUM of debt-type items within period
  runningBalance: number;   // cumulative balance from period start through this period
  itemCount: number;        // total items in this period

  // Merged, sorted item list for this period
  // Normal ledger_items have instanceSource = null
  // Recurring instances have instanceSource = "recurring" and recurringInstanceId
  items: LedgerItemResponse[];
}

interface LedgerItemResponse {
  id: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: string;             // ISO date
  type: "default" | "debt";
  groupId: string | null;
  sortOrder: number;
  version: number;
  createdBy: string;
  updatedBy: string;
  updatedByName: string;    // JOINed from users table — no client-side enrichment needed
  createdAt: string;
  updatedAt: string;

  // Only present for recurring-generated instances
  instanceSource: "recurring" | null;
  recurringInstanceId: string | null;
}
```

**Key design decisions:**
- `updatedByName` is JOINed server-side — the frontend never calls `mockDb.getUserById()` for enrichment
- `runningBalance` is pre-computed by `SUM() OVER (ORDER BY period_start)` in `get_period_stats` — frontend never sums client-side
- Recurring instances are **merged into the period's items array** — frontend renders them as normal rows; the optional `instanceSource` flag enables subtle visual treatment (e.g., a faint "⟳" icon) without changing display logic
- Items within a period are returned in `sortOrder` (manual order) — the frontend's column-header sort applies on top of this client-side
- `periodBalance` includes recurring instances already — the frontend sums are always zero-cost display reads

### Autocomplete API

**`GET /api/autocomplete?field=description&q=rent&limit=10`**

```typescript
interface AutocompleteResponse {
  suggestions: string[];  // e.g. ["Rent - Apartment", "Rent - Car"]
  // Scoped to all spaces the authenticated user belongs to
}
```

No spaceId required — the API reads user session and queries across all accessible spaces.

### Balances API

**`GET /api/balances?spaceId=X&periodType=monthly`**

```typescript
interface BalancesResponse {
  totalBalance: number;   // normal items + non-skipped recurring
  totalDebt: number;      // debt-type items only
  realBalance: number;    // non-debt items only
  // All computed by get_space_balances() SQL function with UNION ALL
}
```

### Reorder API

**`POST /api/ledger-items/reorder`**

```typescript
// Request
interface ReorderRequest {
  spaceId: string;
  itemIds: string[];  // ordered list — backend assigns sort_order = 0, 1, 2...
  dateUpdates?: Record<string, string>;  // { itemId: "YYYY-MM-DD" } for date inheritance on drag
}

// Response
interface ReorderResponse {
  success: true;
  items: LedgerItemResponse[];  // updated items with new sort_order
}
```

The backend applies all `dateUpdates` in the same transaction before reassigning `sort_order`. Both are internal updates (significance = `'internal'` in audit_log).
