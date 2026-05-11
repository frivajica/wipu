# Pending Work — Backend ↔ Frontend Gap Analysis

**Last updated:** May 11, 2026 (First Revision — Quick Fixes Complete)

This document tracks the current gap between what the backend supports and what the frontend actually uses. It serves as a roadmap for the next development iterations.

---

## 1. Unused Backend Routes (Built but No Frontend Callers)

These API endpoints are fully implemented and tested, but no UI component or hook calls them yet.

| Route | Method | Status | Notes |
|-------|--------|--------|-------|
| `/api/debt-groups` | POST | ✅ Wired | Create modal + hook mutation added |
| `/api/debt-groups/[id]` | PUT | 🔴 Unused | Edit debt group name/description |
| `/api/debt-groups/[id]` | DELETE | 🔴 Unused | Delete debt group with confirmation |
| `/api/export` | GET | ✅ Wired | Export button added to ledger toolbar |
| `/api/recurring` | GET, POST | 🔴 Unused | Recurring rules list + create UI |
| `/api/recurring/[id]/instances` | GET, POST | 🔴 Unused | Skip/unskip instance toggles |
| `/api/spaces/join` | POST | 🔴 Unused | `/join/[inviteCode]` page |
| `/api/spaces/[id]/members` | GET | 🔴 Unused | Members list enrichment (see Gaps below) |

### Notes

- **Debt group CRUD**: The debt page (`src/app/debt/page.tsx`) renders existing groups but has no UI to create, edit, or delete them. The empty state says "Debt groups will appear here when you add debt items to your ledger."
- **Export**: `GET /api/export` generates a CSV with all ledger items. No button triggers it.
- **Recurring**: Full CRUD API exists. The frontend spec is in `docs/RECURRING_FRONTEND_FEATURE.md`.
- **Join via invite**: The invite link modal (`invite-link-modal.tsx`) shows `https://wipu.app/join/${inviteCode}` but there is no `/join/[code]` page to handle the actual join flow.

---

## 2. Backend Gaps (Frontend Expects Data the API Doesn't Return)

These are **live bugs** — the frontend renders broken or empty because the API response is incomplete.

| Issue | Impact | Fix | Status |
|-------|--------|-----|--------|
| `GET /api/spaces` returns `members: []` | Space cards show "0 members" always | JOIN `space_members` + `"user"` in spaces query | ✅ Fixed in `603651a` |
| `GET /api/spaces` missing `membersData` | Manage modal shows empty member list | Add `membersData: User[]` to response shape | ✅ Fixed in `603651a` |
| `useDebtAutocomplete` client-side filters | Fetches all descriptions, filters on client | Add `type=debt` param to `/api/autocomplete` | ✅ Fixed in `d843ddb` |
| `useDebtItemLookup` fetches 500 items | Queries all ledger items, filters client-side | Add `type=debt&description=xxx` filter to API | 🔴 Still active |
| `space-card.tsx` uses `space.members.length` | Should use `membersData?.length` after API fix | Update component to read from correct field | ✅ Fixed in `603651a` |

### Detailed: Member List Bug

The `SpaceManageModal` component receives `members` via `manageSpace.membersData || []`. However, `GET /api/spaces` does not populate `membersData` — it only returns `members: []`.

**Fix:** Update `GET /api/spaces` to perform a JOIN:

```sql
SELECT s.*, sm.user_id, u.name, u.email
FROM spaces s
JOIN space_members sm ON s.id = sm.space_id
LEFT JOIN "user" u ON sm.user_id = u.id
WHERE sm.user_id = ${currentUserId}
```

Then aggregate members per space in the response formatter.

---

## 3. Ready to Implement (Backend Already Supports)

These features require **only frontend work** — the API is ready.

| Feature | Backend Status | Frontend Gap | Status |
|---------|---------------|--------------|--------|
| **Member list display** | Tables exist, JOIN needed in API | Update `GET /api/spaces` response + verify modal | ✅ Done `603651a` |
| **Debt group creation** | `POST /api/debt-groups` exists | Add "New Group" button + form modal in debt page | ✅ Done `4860958` |
| **Debt group edit/delete** | `PUT/DELETE` handlers exist | Add edit/delete buttons in `DebtGroupCard` | 🔴 Not started |
| **CSV export** | `GET /api/export` exists | Add export button to ledger toolbar | ✅ Done `7849722` |
| **Join via invite link** | `POST /api/spaces/join` exists | Build `/join/[inviteCode]` page + hook | 🔴 Not started |
| **Recurring items UI** | Full CRUD API exists | Build recurring rules list, create form, skip toggles | 🔴 Not started |

---

## 4. Known Bugs

### Active Bugs

| Bug | Location | Reproduction | Status |
|-----|----------|--------------|--------|
| Debt item lookup scans 500 rows | `use-debt-item-lookup.ts` | Type a debt description — fetches entire ledger | Needs API enhancement |

### Fixed in Quick Fixes (First Revision)

| Bug | Location | Fix | Commit |
|-----|----------|-----|--------|
| Space card shows "0 members" | `space-card.tsx:22` | `GET /api/spaces` now returns populated `members` array | `603651a` |
| Manage modal shows empty member list | `space-manage-modal.tsx:128` | `GET /api/spaces` now returns `membersData` | `603651a` |
| Debt autocomplete searches all items | `use-debt-autocomplete.ts` | API now filters by `type=debt` server-side | `d843ddb` |

### Resolved Bugs (for reference)

| Bug | Fix | Commit |
|-----|-----|--------|
| `POST /api/ledger-items` missing | Added POST handler with auto-increment sort_order | `9deb01a` |
| `activeSpaceId` stale (mock ID) | Auto-correct in `useSpaces` hook when space list loads | `1e7a8c2` |
| `name is required` on seed | Made `name` optional in Better Auth config | pre-commit |
| `relation "user" does not exist` | Added auth tables to Drizzle schema | pre-commit |
| `currency` FK violation on seed | Added currency seeding to seed script | pre-commit |
| Audit trigger fails on `spaces` insert | Added `undefined_column` exception handling | pre-commit |
| Invalid UUID on debt group insert | Removed hardcoded `id` from seed, let DB generate | pre-commit |
| `ENOTFOUND neon-host` | Updated `.env.local` with real DATABASE_URL | local config |

---

## 5. Quick Fixes (First Revision — Done)

All quick fixes below have been implemented and committed:

1. **Fix member list API** ✅ — `GET /api/spaces` now batch-JOINs `space_members` + `"user"` via `inArray`, populating both `members` and `membersData`. Commit `603651a`.
2. **Add `type=debt` to autocomplete** ✅ — `/api/autocomplete` accepts `type` param; `useDebtAutocomplete` passes `type=debt`. Commit `d843ddb`.
3. **Add export button** ✅ — `ExportButton` component added to ledger toolbar; triggers CSV download via `GET /api/export`. Commit `7849722`.
4. **Add debt group creation** ✅ — `CreateDebtGroupModal` + `use-debt.ts` mutation + header button + empty state CTA. Commit `4860958`.

---

## 6. Future Considerations

- **Supabase migration**: The architecture is designed for a drop-in replacement at the API route layer. All Drizzle queries can become Supabase client calls. Zustand stores and UI components remain unchanged.
- **Realtime sync**: Not yet implemented. Better Auth sessions + TanStack Query polling is the current pattern.
- **Row Level Security**: Currently handled by explicit membership checks in API routes. Supabase RLS would replace these.
- **Image uploads**: `avatarUrl` field exists on `User` type but no upload flow is wired up.

---

*This document should be updated whenever new backend routes are added or frontend features are wired up.*
