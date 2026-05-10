# Reorder by Date — Design & Implementation

## Motivation

Replace the "Smart Date Inheritance" concept with a simpler "Reorder by Date" toggle. When enabled, drag-and-drop reorders items AND updates their dates to match adjacent items (date inheritance). The toggle is bi-directionally linked with sort-by-date mode.

## Key Relationships

```
Reorder by Date = ON   →  sortByDate = ON  (forced)
sortByDate = OFF       →  Reorder by Date = OFF  (forced)
sortByDate = ON        →  Reorder by Date = unchanged
Reorder by Date = OFF  →  sortByDate = unchanged
```

This means:
- Enabling Reorder by Date always sorts items by date
- Switching away from date sort always disables Reorder by Date
- But items can be sorted by date without Reorder by Date (DnD stays off)

## Store Changes

**`lib/types.ts` — `UIState` interface**

| Old | New |
|---|---|
| `smartDateInheritance: boolean` | `reorderByDate: boolean` |

**`stores/ui-store.ts` — linked setters**

```typescript
setSortByDate: (sortByDate) =>
  set((state) => ({
    sortByDate,
    reorderByDate: sortByDate ? state.reorderByDate : false,
  })),

setReorderByDate: (reorderByDate) =>
  set((state) => ({
    reorderByDate,
    sortByDate: reorderByDate ? true : state.sortByDate,
  })),
```

## Grouping Fix

**Problem:** `groupByMonth`, `groupByWeek`, `groupByBiWeek` in `lib/grouping.ts` internally call `sortByDate(items)` which re-sorts by date only (ignoring `sortOrder`). This discards any manual drag-and-drop reordering.

**Fix:** Remove the internal `sortByDate()` calls. The caller (`useGroupedLedger`) already pre-sorts items before passing them to `groupItemsByPeriod`:
- When `sortByDate = true`: pre-sorted by date + `sortOrder` tiebreaker via `sortItemsByDate()`
- When `sortByDate = false`: in `sortOrder` order from the query

## Component Changes

### `smart-date-toggle.tsx` → `reorder-toggle.tsx`
- Label: "Reorder by Date"
- Tooltip: "When enabled, dragging items reorders them and updates their dates to match adjacent items."

### `period-group.tsx`
- `isDragEnabled` prop replaced by `reorderByDate` boolean prop
- `isDragEnabled = reorderByDate` (no more `!sortByDate || smartDateInheritance`)
- `handleDragEnd` calculates midpoint date when `reorderByDate` is true

### `ledger/page.tsx`
- `isDragEnabled={!sortByDate || smartDateInheritance}` → removed from PeriodGroup
- Pass `reorderByDate` instead
- `SortResetCue` visibility: `sortByDate && !reorderByDate` (unchanged logic, renamed variable)
- `onReorderItems` accepts optional `dateUpdates: Record<string, string>`

## Date Inheritance Logic

When `reorderByDate` is true and a drag ends:

```
newIndex = position of moved item after reorder
before = items[newIndex - 1]  // item above the moved item
after  = items[newIndex + 1]  // item below the moved item

if both before and after exist:
  newDate = midpoint between before.date and after.date
else if before exists:
  newDate = before.date
else if after exists:
  newDate = after.date
else:
  newDate = unchanged (single item, no-op)
```

Midpoint calculation (luxon):
```typescript
const start = DateTime.fromISO(before.date);
const end = DateTime.fromISO(after.date);
newDate = start.plus(end.diff(start).dividedBy(2)).toISODate();
```

## Mutation Flow

```
period-group.tsx
  ↓ onReorderItems(itemIds, dateUpdates?)
ledger/page.tsx
  ↓ reorderItems({ spaceId, itemIds, dateUpdates, updatedBy })
use-ledger.ts (mutationFn)
  ├─ if dateUpdates: mockDb.updateLedgerItem(id, { date }) for each
  └─ mockDb.reorderLedgerItems(spaceId, itemIds)
```
