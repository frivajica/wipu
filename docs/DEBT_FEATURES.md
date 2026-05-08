# Debt Tracking Feature Specification

**Date:** May 2026
**Status:** Implementation Ready

---

## 1. Executive Summary

Add debt tracking as a first-class feature alongside the existing ledger. Users can:
- View debts grouped by category (e.g., "Bicycle for the play")
- Track debt balance per group
- Add debt payments/acquisitions with autocomplete
- Visual differentiation between normal expenses and debt items

**Non-goals for this phase:**
- CRUD for debt groups (read-only groups)
- Moving items between groups
- Debt splitting between users

---

## 2. UX/UI Design Decisions

### 2.1 Navigation: Tab Bar

**Decision:** Add a tab bar below the sticky header, inside the main content container (`max-w-4xl`).

**Layout:**
```
+-------------------------------------------------------------+
| Wipu        [SpaceSelector] [UserMenu]        |  Sticky header
+-------------------------------------------------------------+
| [Ledger] | [Debt]                             |  TabNav
+-------------------------------------------------------------+
|                                               |
|  Content area (ledger or debt view)           |
|                                               |
+-------------------------------------------------------------+
```

**Rationale:**
- Header = global navigation (app-level)
- Tabs = space-level context switching
- Contained within content area for visual hierarchy
- Mobile-friendly touch targets

**Active state:** `text-primary-accent border-b-2 border-primary-accent`
**Inactive state:** `text-text-secondary hover:text-text-primary`

### 2.2 Debt View Layout

**Top section:** General debt balance
```
Total Debt: $250
```

**Below:** Debt group cards (vertical stack)
```
+----------------------------------------------+
| [Blue cue] General Debt          $250        |
+----------------------------------------------+
| $500  Bicycle for the play    Apr 02         |
| -$250 Bicycle for the play    Apr 05         |
+----------------------------------------------+

+----------------------------------------------+
| [Blue cue] Theater Assets        $0          |
+----------------------------------------------+
| $100  Costumes               Apr 10          |
| -$100 Costumes               Apr 12          |
+----------------------------------------------+
```

**Card design:**
- `bg-surface rounded-xl border border-border/40 shadow-card`
- Color cue: 3px left border (`border-l-3 border-debt`)
- Group name: `font-medium text-text-primary`
- Balance: `text-debt font-semibold tabular-nums` (blue, matching cue)
- Item count: `text-text-tertiary text-sm`
- Items: compact list, `text-sm`, no card styling per item

### 2.3 Ledger View Updates (Minimal)

**Color cue on rows:**
- Left edge: 3px vertical bar
- Default items: `bg-border` (gray)
- Debt items: `bg-debt` (blue)

**Balance display:**
```
+----------+  +----------+  +----------+  +----------+
| Balance  |  | Debt     |  | Running  |  | Running  |
| $13      |  | $8       |  | $13      |  | $8       |
+----------+  +----------+  +----------+  +----------+
```

- Balance/Running: `text-primary`
- Debt/Running Debt: `text-debt` (blue)

### 2.4 Add Item Form Updates

**New field: Group selector**
```
[Amount] [Description] [Category] [Date] [Group: Default] [+]
```

Group options:
- `default` -- Normal expense/income
- `debt-default` -- Debt: General Debt

**Debt autocomplete:**
- Only activates when group = "debt"
- Suggests existing debt items (by description)
- Selecting auto-fills: category, description, defaults amount to negative

**Confirmation dialog:**
- If selecting existing debt item + changing group -> "Add payment to [Group]?"
- Creates new item in selected group

---

## 3. Data Model

### 3.1 Types

```typescript
// lib/types.ts

export type LedgerItemType = "default" | "debt";

export interface DebtGroup {
  id: string;
  spaceId: string;
  name: string;
  color: string;        // "debt" (blue) default
  balance: number;      // Computed server-side
  createdBy: string;
  createdAt: string;
}

export interface LedgerItem {
  id: string;
  spaceId: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  createdBy: string;
  updatedBy: string;
  updatedByName?: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  type: LedgerItemType;     // "default" | "debt"
  groupId: string | null;   // null for default, group ID for debt
}

export interface LedgerBalances {
  totalBalance: number;
  totalDebt: number;
  realBalance: number;   // Excludes debt acquisitions

  periods: Array<{
    label: string;
    balance: number;
    debt: number;
    runningBalance: number;
    runningDebt: number;
  }>;
}
```

### 3.2 Mock Data

**Debt groups:**
```typescript
{
  id: "debt-default",
  spaceId: "space-1",
  name: "General Debt",
  color: "debt",
  balance: 250,
  createdBy: "system",
  createdAt: "2026-01-01"
}
```

**Debt items:**
```typescript
// Acquiring debt
{
  amount: 500,
  description: "Bicycle for the play",
  category: "Theater Assets",
  type: "debt",
  groupId: "debt-default",
  date: "2026-04-02"
}

// Paying down debt
{
  amount: -250,
  description: "Bicycle for the play",
  category: "Theater Assets",
  type: "debt",
  groupId: "debt-default",
  date: "2026-04-05"
}
```

---

## 4. Architecture

### 4.1 Backend Pattern (Mock -> Real API)

**Current (mock):**
```typescript
// lib/data.ts - MockDatabase class

getDebtGroups(spaceId: string): DebtGroup[] {
  const groups = this.debtGroups.filter(g => g.spaceId === spaceId);
  return groups.map(g => ({
    ...g,
    balance: this.getDebtGroupBalance(g.id)
  }));
}

getDebtItems(spaceId: string, groupId?: string): LedgerItem[] {
  let items = this.ledgerItems.filter(i =>
    i.spaceId === spaceId && i.type === "debt"
  );
  if (groupId) items = items.filter(i => i.groupId === groupId);
  return items.sort((a, b) => new Date(b.date) - new Date(a.date));
}

getDebtGroupBalance(groupId: string): number {
  return this.ledgerItems
    .filter(i => i.groupId === groupId)
    .reduce((sum, i) => sum + i.amount, 0);
}
```

**Future (real API):**
```typescript
// app/api/debt/groups/route.ts
export async function GET(request: NextRequest) {
  const spaceId = getSpaceIdFromQuery(request);
  const groups = await db.debtGroups.findMany({ where: { spaceId } });

  // Compute balances via SQL aggregation
  const balances = await db.$queryRaw`
    SELECT group_id, SUM(amount) as balance
    FROM ledger_items
    WHERE space_id = ${spaceId} AND type = 'debt'
    GROUP BY group_id
  `;

  return NextResponse.json({ groups: mergeBalances(groups, balances) });
}
```

**Frontend stays identical** -- receives `{ groups, balances }` object.

### 4.2 Frontend Hooks

**`hooks/use-ledger.ts` (updated):**
```typescript
const { data } = useQuery({
  queryKey: ["ledger", activeSpaceId],
  queryFn: async () => {
    const items = mockDb.getLedgerItems(activeSpaceId);
    const balances = mockDb.getLedgerBalances(activeSpaceId, periodType);
    return { items, balances };
  }
});

return {
  items: data?.items || [],
  balances: data?.balances,
  // ...mutations
};
```

**`hooks/use-debt.ts` (new):**
```typescript
export function useDebt() {
  const activeSpaceId = useSpaceStore((s) => s.activeSpaceId);

  const { data, isLoading } = useQuery({
    queryKey: ["debt", activeSpaceId],
    queryFn: async () => {
      if (!activeSpaceId) return null;
      await simulateDelay(300);
      const groups = mockDb.getDebtGroups(activeSpaceId);
      return groups;
    },
    enabled: !!activeSpaceId
  });

  return {
    groups: data || [],
    isLoading
  };
}
```

### 4.3 Shared Hooks

**`hooks/use-ledger-form.ts` (updated):**
```typescript
export function useLedgerForm() {
  const [type, setType] = useState<LedgerItemType>("default");
  const [groupId, setGroupId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  // Debt autocomplete
  const debtSuggestions = useMemo(() => {
    if (type !== "debt" || !activeSpaceId) return [];
    return mockDb.getLedgerItems(activeSpaceId)
      .filter(i => i.type === "debt" && i.amount > 0)
      .map(i => i.description);
  }, [type, activeSpaceId]);

  const handleDebtSelect = (description: string) => {
    const existing = mockDb.getLedgerItems(activeSpaceId)
      .find(i => i.description === description && i.type === "debt");

    if (existing) {
      setCategory(existing.category);
      setGroupId(existing.groupId);
      setDescription(existing.description);
      setAmount(""); // User enters payment amount
    }
  };

  return {
    type, setType,
    groupId, setGroupId,
    description, setDescription,
    amount, setAmount,
    debtSuggestions,
    handleDebtSelect,
    // ...
  };
}
```

---

## 5. Component Inventory

### 5.1 New Components

| Component | Path | Responsibility |
|---|---|---|
| `TabNav` | `components/layout/tab-nav.tsx` | Ledger \| Debt tab switching |
| `DebtBalanceHeader` | `components/debt/debt-balance-header.tsx` | Total debt display |
| `DebtGroupCard` | `components/debt/debt-group-card.tsx` | Compact card: name, balance, items |
| `DebtGroupItemList` | `components/debt/debt-group-item-list.tsx` | Items within a group |
| `DebtEmptyState` | `components/debt/debt-empty-state.tsx` | "No debt" state |
| `DebtSkeleton` | `components/debt/debt-skeleton.tsx` | Loading state |
| `GroupSelector` | `components/ledger/group-selector.tsx` | Default/Debt dropdown |

### 5.2 Updated Components

| Component | Changes |
|---|---|
| `Header` | Integrate `TabNav` |
| `LedgerRowContent` | Add color cue (gray/blue) |
| `AddItemRow` | Add group selector, debt autocomplete |
| `PeriodHeader` | 4 stat pills (balance, debt, running, running debt) |
| `use-ledger.ts` | Return balances from API |
| `use-grouped-ledger.ts` | Map balances to periods |

---

## 6. Routes

| Route | File | Purpose |
|---|---|---|
| `/ledger` | `app/ledger/page.tsx` | Existing ledger view |
| `/debt` | `app/debt/page.tsx` | New debt view |
| `/spaces` | `app/spaces/page.tsx` | Space management |

**Update `proxy.ts`:** Add `/debt` to `protectedRoutes`.

---

## 7. Design Tokens

```css
@theme {
  /* Existing tokens... */

  /* Debt color */
  --color-debt: #3b82f6;
  --color-debt-light: #dbeafe;
}
```

**Usage:**
- `text-debt` / `bg-debt` / `border-debt`
- Matches Tailwind v4 `@theme` pattern

---

## 8. Execution Order

| Phase | Steps | Files |
|---|---|---|
| **1. Foundation** | 1-3 | `globals.css`, `types.ts`, `data.ts` |
| **2. Navigation** | 4-6 | `tab-nav.tsx`, `header.tsx`, `debt/page.tsx` |
| **3. Ledger Updates** | 7-9 | `use-ledger.ts`, `period-header.tsx`, `ledger-row-content.tsx` |
| **4. Add Item Form** | 10-12 | `group-selector.tsx`, `add-item-row.tsx` |
| **5. Debt View** | 13-17 | `debt-balance-header.tsx`, `debt-group-card.tsx`, `debt-group-item-list.tsx` |
| **6. Polish** | 18-20 | `debt-empty-state.tsx`, `debt-skeleton.tsx`, build, commit |

---

## 9. Best Practices Applied

| Practice | Implementation |
|---|---|
| **Server-side balances** | Computed in `MockDatabase`, returned with items |
| **Single source of truth** | TanStack Query caches balances + items |
| **Self-documenting code** | Component names describe purpose |
| **Atomic components** | Each < 80 lines, single responsibility |
| **Type safety** | Strict TypeScript, explicit return types |
| **Shared hooks** | `useLedgerForm` reused for add/edit |
| **Design tokens** | All colors via `@theme` |
| **Accessibility** | `aria-selected` on tabs, keyboard navigation |

---

*End of specification.*
