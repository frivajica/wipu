# Recurring Items — Frontend Feature Specification

This document describes the frontend implementation plan for the recurring items feature. It covers the UI design, data model, component architecture, and interaction flows.

---

## Table of Contents

- [1. Feature Overview](#1-feature-overview)
- [2. UI Structure](#2-ui-structure)
- [3. Data Model (Frontend)](#3-data-model-frontend)
- [4. Components](#4-components)
- [5. State Management](#5-state-management)
- [6. API Routes](#6-api-routes)
- [7. Interaction Flows](#7-interaction-flows)
- [8. Edge Cases](#8-edge-cases)

---

## 1. Feature Overview

Recurring items are generated from rule templates and appear in ledger period totals alongside normal (manual) items. Users can skip individual instances, and re-add by creating a manual ledger item. The feature is scoped per-space — each space has its own recurring rules and instances.

### Core Concepts

| Concept | Description |
|---|---|
| **Recurring Rule** | A template stored in `recurring_items` table with frequency, interval, and date constraints |
| **Instance** | A generated occurrence of a rule, stored in `recurring_instances` with a specific date |
| **Skipped Instance** | An instance excluded from all totals (`skipped = true`), never auto-restored |
| **Active Period** | A period (month/week/biweek/custom range) that contains at least one normal item — determines visibility |

### Visibility Rules

- Only periods containing at least one normal (non-recurring) item are shown
- Recurring instances contribute to period totals but do not create or reveal periods
- If the last normal item is in February, March's period is hidden even if March has recurring instances — unless a normal item also exists in March

---

## 2. UI Structure

### Route

`/recurring` — top-level tab alongside `/ledger` and `/debt`. Inherits active space from `space-store.ts`.

### Page Layout

```
/recurring
├── Header (title: "Recurring Items", active space name)
├── Tab bar: [Ledger] [Debt] [Recurring]     ← already in Header via TabNav
├── Empty state (when no recurring rules exist)
│   └── "No recurring items yet" + CTA button
└── Recurring list (when rules exist)
    ├── Each RecurringRuleCard
    │   ├── Rule summary: description, amount, frequency label, next occurrence
    │   ├── Instance list (expandable)
    │   │   └── Each RecurringInstanceRow
    │   │       ├── occurrence_date, description, amount
    │   │       └── skip toggle
    │   └── Actions: Edit, Delete, + Add instance manually
    └── "+ New Recurring" button (FAB or top-right)
```

### Recurring Rule Form (Create / Edit)

Fields (mirrors backend `recurring_items`):

| Field | Type | Notes |
|---|---|---|
| description | text | required, max 200 chars |
| amount | number | required, signed (positive = owed, negative = payment) |
| type | select | `default` \| `debt` |
| category | text | required, autocomplete from existing |
| group | select | null (no group) or one of the space's debt groups |
| frequency_unit | select | `Days` \| `Weekly` \| `Monthly` \| `Yearly` |
| interval_count | number | 1-365, default 1 |
| by_day | multi-select | days of week (MO, TU, WE, TH, FR, SA, SU), shown when frequency_unit = `Weekly` |
| by_month_day | number | 1-31, shown when frequency_unit = `Monthly` |
| start_date | date | required |
| end_date | date | optional (null = indefinite) |
| count | number | optional max occurrences |

**Validation:** Zod schema mirrors backend constraints.

### Visual Design

- Recurring rule cards: same card style as `DebtGroupCard` (border, shadow, rounded-xl)
- Instances shown in an expandable accordion below the card
- Skipped instances: dimmed (opacity-40) with a strikethrough on the date
- Active instances: normal styling
- "Next: {date}" label on each card using `formatDate`
- Form uses the same `LedgerFormFields` layout as AddItemRow and InlineEditRow

---

## 3. Data Model (Frontend)

### RecurringItem (from API)

```typescript
interface RecurringItem {
  id: string;
  spaceId: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  type: "default" | "debt";
  groupId: string | null;
  frequencyUnit: "days" | "weekly" | "monthly" | "yearly";
  intervalCount: number;
  byDay: string | null;         // comma-separated: "MO,WE,FR"
  byMonthDay: number | null;    // 1-31
  startDate: string;            // ISO date
  endDate: string | null;
  count: number | null;
  nextOccurrence: string;       // ISO date
  lastComputedAt: string;       // ISO timestamp
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### RecurringInstance (from API)

```typescript
interface RecurringInstance {
  id: string;
  recurringItemId: string;
  occurrenceDate: string;       // ISO date
  skipped: boolean;
  createdAt: string;
}
```

### Enriched RecurringItem (in hook)

```typescript
interface EnrichedRecurringItem extends RecurringItem {
  instances: RecurringInstance[];
  instanceCount: number;        // total, for display
  skippedCount: number;         // skipped, for display
  nextNonSkippedOccurrence: string | null; // next non-skipped, for "Next" label
}
```

---

## 4. Components

### Page

- `RecurringPage` — `app/recurring/page.tsx`, server component with AuthGuard wrapper

### Components

| Component | File | Responsibility |
|---|---|---|
| `RecurringList` | `components/recurring/recurring-list.tsx` | Renders list of `RecurringRuleCard`, handles empty state |
| `RecurringRuleCard` | `components/recurring/recurring-rule-card.tsx` | Single rule with summary, expandable instance list, actions |
| `RecurringInstanceList` | `components/recurring/recurring-instance-list.tsx` | Accordion list of `RecurringInstanceRow` |
| `RecurringInstanceRow` | `components/recurring/recurring-instance-row.tsx` | Single instance with date, description, amount, skip toggle |
| `RecurringForm` | `components/recurring/recurring-form.tsx` | Create/edit form with all rule fields |
| `RecurringFormFields` | `components/recurring/form-fields.tsx` | Shared field layout (reuses pattern from `LedgerFormFields`) |
| `RecurringSkeleton` | `components/recurring/recurring-skeleton.tsx` | Loading skeleton matching card layout |

### Component Details

**`RecurringRuleCard`**
- Props: `item: EnrichedRecurringItem`, `onEdit`, `onDelete`, `onSkipInstance`, `onExpand`
- States: collapsed (summary only) / expanded (summary + instance list)
- Shows: description, `formatCurrency(amount)`, frequency label, next occurrence, skipped/total count
- Actions: Edit button, Delete button (with confirmation), expand/collapse chevron

**`RecurringInstanceRow`**
- Props: `instance: RecurringInstance`, `onSkip`, `isOwned`
- Normal state: date + description + amount in compact row
- Skipped state: dimmed + strikethrough on date, "Unskip" button instead of skip
- Swipe-to-delete on mobile (only for owned instances)

**`RecurringForm`**
- Used by both Create modal and Edit modal
- Fields driven by `RecurringFormFields`
- Autocomplete for `category` (server-side `/api/autocomplete?field=category`)
- `GroupSelector` for `groupId` (same component used by `AddItemRow`)
- Submit calls `useRecurring().createRecurring()` or `updateRecurring()`

**`RecurringInstanceList`**
- Expandable accordion below the card
- Paginated if instanceCount > 50 (load more on scroll)
- Each instance has skip/unskip toggle

---

## 5. State Management

### New Zustand Store (optional) or inline in hook

A `useRecurring` hook (TanStack Query) manages all recurring data. No dedicated Zustand store needed — state lives in TanStack Query cache.

### Hook: `useRecurring`

```typescript
function useRecurring(spaceId: string) {
  // Returns { data: EnrichedRecurringItem[], isLoading, ... }

  // CRUD mutations:
  createRecurring: (item: CreateRecurringItemPayload) => void
  updateRecurring: (id: string, updates: Partial<RecurringItem>) => void
  deleteRecurring: (id: string) => void

  // Instance mutations:
  skipInstance: (instanceId: string) => void   // sets skipped = true
  unskipInstance: (instanceId: string) => void  // sets skipped = false (rare, user creates manual instead)

  // Query keys:
  ["recurring-items", spaceId]
  ["recurring-instances", recurringItemId]
}
```

### Query Invalidation

On create/update/delete/skip: invalidate `["recurring-items", spaceId]` and `["recurring-instances", recurringItemId]`.

---

## 6. API Routes

### `GET /api/recurring-items?spaceId=X`

Returns `RecurringItem[]` for the space.

### `POST /api/recurring-items`

Create a recurring rule. Generates initial instance batch (backfill up to current date).

Request:
```json
{
  "description": "Rent",
  "amount": 15000,
  "category": "Housing",
  "type": "default",
  "frequencyUnit": "monthly",
  "intervalCount": 1,
  "byMonthDay": 1,
  "startDate": "2026-01-01",
  "endDate": null,
  "count": null
}
```

### `PUT /api/recurring-items/[id]`

Update a recurring rule. Triggers instance re-generation if frequency fields change.

### `DELETE /api/recurring-items/[id]`

Delete a recurring rule and all its instances (CASCADE).

### `POST /api/recurring-items/[id]/skip`

Skip a specific instance.

Request: `{ "instanceId": "uuid" }`

### `GET /api/recurring-instances?recurringItemId=X`

Returns `RecurringInstance[]` for a rule (paginated).

---

## 7. Interaction Flows

### Create Recurring Item

1. User clicks "+ New Recurring" button
2. Modal opens with `RecurringForm`
3. User fills fields — `category` has autocomplete, `group` has dropdown
4. On submit: `createRecurring()` mutation → API creates rule + backfills instances
5. On success: invalidate queries, close modal, show toast
6. New card appears in list

### Skip an Instance

1. User expands a rule card → sees instance list
2. User clicks skip toggle on an instance row
3. Optimistic update: row dims, date gets strikethrough
4. API: `POST /api/recurring-items/[id]/skip` with `{ instanceId }`
5. On error: rollback optimistic update, show toast

### Edit Recurring Rule

1. User clicks Edit on a rule card
2. Modal opens with form pre-filled (including computed `nextOccurrence` display)
3. If frequency fields change: API regenerates future instances, keeps skipped intact
4. On submit: `updateRecurring()` mutation
5. On success: invalidate, close modal, toast

### Delete Recurring Rule

1. User clicks Delete on a rule card
2. `DeleteConfirmationModal` appears (if not owned — though recurring items are typically owned by creator)
3. On confirm: `deleteRecurring()` mutation
4. On success: card animates out (Framer Motion `AnimatePresence`), toast

---

## 8. Edge Cases

### End date reached

If `end_date` is set and reached, the rule shows as "Inactive" (grayed out, `is_active = false`). No new instances generated. Existing instances remain.

### Count limit reached

Same as end date — rule becomes inactive.

### All future instances skipped

Rule is active but contributes nothing to future totals. User can unskip individual instances or create manual items.

### Rule's next occurrence is skipped

When displaying the "Next: {date}" label on the card, skip instances are excluded — show the next non-skipped occurrence.

### No instances yet (backfill not done)

While instances are being backfill-generated, show a loading state on the instance list. Once backfill is complete, instances appear.

### Autocomplete for category

Uses existing `/api/autocomplete?field=category&q=` endpoint. No new route needed.

### Space has no normal items (all recurring)

If a space has only recurring items and no normal items, no periods are visible — the ledger shows an empty state. The recurring tab still shows all rules with their instances, since recurring is its own tab.

### Conflict on rule edit

If two users edit the same rule simultaneously, `version` field (future) causes 409. Toast + refresh for now; diff UI in future.