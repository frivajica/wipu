# Pending Work — Backend ↔ Frontend Gap Analysis

**Last updated:** May 11, 2026

This document tracks the current gap between what the backend supports and what the frontend actually uses. It serves as a roadmap for the next development iterations.

---

## 1. Unused Backend Routes (Built but No Frontend Callers)

These API endpoints are fully implemented and tested, but no UI component or hook calls them yet.

| Route | Method | What's Missing |
|-------|--------|----------------|
| `/api/debt-groups` | POST | "Create debt group" UI (modal/form) |
| `/api/debt-groups/[id]` | PUT | Edit debt group name/description |
| `/api/debt-groups/[id]` | DELETE | Delete debt group with confirmation |
| `/api/export` | GET | Export button in ledger toolbar |
| `/api/recurring` | GET, POST | Recurring rules list + create UI |
| `/api/recurring/[id]/instances` | GET, POST | Skip/unskip instance toggles |
| `/api/spaces/join` | POST | `/join/[inviteCode]` page |
| `/api/spaces/[id]/members` | GET | Members list enrichment (see Gaps below) |

### Notes

- **Debt group CRUD**: The debt page (`src/app/debt/page.tsx`) renders existing groups but has no UI to create, edit, or delete them. The empty state says "Debt groups will appear here when you add debt items to your ledger."
- **Export**: `GET /api/export` generates a CSV with all ledger items. No button triggers it.
- **Recurring**: Full CRUD API exists. The frontend spec is in `docs/RECURRING_FRONTEND_FEATURE.md`.
- **Join via invite**: The invite link modal (`invite-link-modal.tsx`) shows `https://wipu.app/join/${inviteCode}` but there is no `/join/[code]` page to handle the actual join flow.

---

## 2. Backend Gaps (Frontend Expects Data the API Doesn't Return)

These are **live bugs** — the frontend renders broken or empty because the API response is incomplete.

| Issue | Impact | Fix | Priority |
|-------|--------|-----|----------|
| `GET /api/spaces` returns `members: []` | Space cards show "0 members" always | JOIN `space_members` + `"user"` in spaces query | High |
| `GET /api/spaces` missing `membersData` | Manage modal shows empty member list | Add `membersData: User[]` to response shape | High |
| `useDebtAutocomplete` client-side filters | Fetches all descriptions, filters on client | Add `type=debt` param to `/api/autocomplete` | Medium |
| `useDebtItemLookup` fetches 500 items | Queries all ledger items, filters client-side | Add `type=debt&description=xxx` filter to API | Medium |
| `space-card.tsx` uses `space.members.length` | Should use `membersData?.length` after API fix | Update component to read from correct field | Low (depends on API fix) |

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

| Feature | Backend Status | Frontend Gap | Estimated Effort |
|---------|---------------|--------------|------------------|
| **Member list display** | Tables exist, JOIN needed in API | Update `GET /api/spaces` response + verify modal | 1-2 hrs |
| **Debt group creation** | `POST /api/debt-groups` exists | Add "New Group" button + form modal in debt page | 2-3 hrs |
| **Debt group edit/delete** | `PUT/DELETE` handlers exist | Add edit/delete buttons in `DebtGroupCard` | 1-2 hrs |
| **CSV export** | `GET /api/export` exists | Add export button to ledger toolbar | 30 min |
| **Join via invite link** | `POST /api/spaces/join` exists | Build `/join/[inviteCode]` page + hook | 2-3 hrs |
| **Recurring items UI** | Full CRUD API exists | Build recurring rules list, create form, skip toggles | 1-2 days |

---

## 4. Known Bugs

### Active Bugs

| Bug | Location | Reproduction | Status |
|-----|----------|--------------|--------|
| Space card shows "0 members" | `space-card.tsx:22` | Open `/spaces` page — all cards show 0 members | Needs API fix |
| Manage modal shows empty member list | `space-manage-modal.tsx:128` | Click "Manage" on any space — no members rendered | Needs API fix |
| Debt autocomplete searches all items | `use-debt-autocomplete.ts` | Type in debt description — suggests non-debt items | Needs API enhancement |
| Debt item lookup scans 500 rows | `use-debt-item-lookup.ts` | Type a debt description — fetches entire ledger | Needs API enhancement |

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

## 5. Quick Fixes (Do These First)

1. **Fix member list API** — Update `GET /api/spaces` to JOIN users. This fixes two visible bugs at once.
2. **Add `type=debt` to autocomplete** — One-line API param + hook update.
3. **Add export button** — `GET /api/export` already works. Just needs a button.
4. **Add debt group creation** — `POST /api/debt-groups` exists. Just needs a modal.

---

## 6. Future Considerations

- **Supabase migration**: The architecture is designed for a drop-in replacement at the API route layer. All Drizzle queries can become Supabase client calls. Zustand stores and UI components remain unchanged.
- **Realtime sync**: Not yet implemented. Better Auth sessions + TanStack Query polling is the current pattern.
- **Row Level Security**: Currently handled by explicit membership checks in API routes. Supabase RLS would replace these.
- **Image uploads**: `avatarUrl` field exists on `User` type but no upload flow is wired up.

---

*This document should be updated whenever new backend routes are added or frontend features are wired up.*
