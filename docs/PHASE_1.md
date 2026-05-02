# Wipu — Phase 1 Implementation Plan

**Goal:** Build a fully interactive frontend-only MVP with mock data, functional auth, spaces management, and the complete ledger experience.

**Status:** Not started

---

## Phase 1A: Project Setup & Foundation

### Environment & Tooling
- [ ] Initialize Next.js 16 project with TypeScript, Tailwind CSS via `create-next-app`
- [ ] Install all dependencies:
  - `react`, `react-dom` (v19)
  - `zustand` (v5)
  - `@tanstack/react-query` (v5.71+)
  - `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
  - `framer-motion`
  - `date-fns`
  - `lucide-react`
  - `zod`
  - `clsx`, `tailwind-merge`
- [ ] Configure `tailwind.config.ts` with custom design tokens (modern fintech palette)
- [ ] Configure `tsconfig.json` with strict mode
- [ ] Configure `next.config.ts` with React Compiler opt-in
- [ ] Set up project folder structure (all directories)
- [ ] Create `src/lib/types.ts` with all TypeScript interfaces
- [ ] Create `src/lib/constants.ts` with app constants (max members, period types, etc.)
- [ ] Create root `data.js` mock database with sample data (users, spaces, items, categories)
- [ ] Set up `src/lib/utils.ts` with helper functions (cn, formatCurrency, etc.)

### Core Infrastructure
- [ ] Create `src/lib/data.js` — mock database module with CRUD operations
- [ ] Set up TanStack Query `QueryClientProvider` in `src/app/layout.tsx`
- [ ] Set up Zustand stores:
  - `src/stores/auth-store.ts`
  - `src/stores/space-store.ts`
  - `src/stores/ui-store.ts`
- [ ] Set up `src/hooks/use-local-storage.ts` for persistence
- [ ] Create base UI primitives in `src/components/ui/`:
  - `Button.tsx` (variants: primary, secondary, ghost, danger)
  - `Input.tsx` (text, number, date)
  - `Toggle.tsx` (switch component)
  - `Modal.tsx` (overlay, centered, animated)
  - `Toast.tsx` / `Toaster.tsx` (notification system)
  - `Menu.tsx` (context menu / dropdown)
  - `Avatar.tsx` (initials fallback, 24px, 32px sizes)

---

## Phase 1B: Authentication

### Stores & Hooks
- [ ] Build `src/stores/auth-store.ts` (Zustand: user, token, isAuthenticated, login, logout, hydrate)
- [ ] Build `src/hooks/use-auth.ts` (TanStack Query: login mutation, register mutation, logout action)

### UI Components
- [ ] Build `src/components/auth/LoginForm.tsx`
  - Email input (validated with Zod)
  - Password input
  - Submit button with loading state
  - Link to register
  - Error messages
- [ ] Build `src/components/auth/RegisterForm.tsx`
  - Name input
  - Email input
  - Password input
  - Submit button with loading state
  - On success: auto-create "Personal" space, log user in
  - Link to login

### Pages & Routing
- [ ] Build `src/app/(auth)/layout.tsx` (auth pages layout, no header)
- [ ] Build `src/app/(auth)/login/page.tsx`
- [ ] Build `src/app/(auth)/register/page.tsx`
- [ ] Add route protection (redirect unauthenticated to /login)
- [ ] Persist auth state to localStorage
- [ ] Hydrate auth state on app load

### Testing Checkpoints
- [ ] Can register a new user
- [ ] Can log in with existing user
- [ ] Can log out
- [ ] Session persists across page reload
- [ ] Unauthenticated users redirected to /login
- [ ] Authenticated users redirected away from /login

---

## Phase 1C: Spaces Management

### Stores & Hooks
- [ ] Build `src/stores/space-store.ts` (Zustand: spaces list, activeSpaceId, setActiveSpace)
- [ ] Build `src/hooks/use-spaces.ts` (TanStack Query: list, create, delete, leave, switch)

### UI Components
- [ ] Build `src/components/spaces/SpaceCard.tsx`
  - Space name
  - Member count ("3 members")
  - Owner badge (if current user is owner)
  - Leave button (disabled for Personal)
  - Delete button (owner only, with confirmation)
- [ ] Build `src/components/spaces/CreateSpaceModal.tsx`
  - Name input
  - Create button
  - Cancel button
  - Animated open/close
- [ ] Build `src/components/spaces/InviteLinkModal.tsx`
  - Display invite link
  - Copy to clipboard button
  - Toast confirmation on copy
  - Close button

### Page
- [ ] Build `src/app/spaces/page.tsx`
  - Grid of SpaceCards
  - "Create New Space" button (opens modal)
  - Empty state for first-time users

### Integration
- [ ] Integrate SpaceSelector into Header (pill dropdown)
- [ ] Space selector lists all user's spaces
- [ ] Clicking a space switches active space and navigates to /ledger
- [ ] Active space highlighted in dropdown

### Testing Checkpoints
- [ ] Can create a new space
- [ ] Can delete a space (owner only)
- [ ] Can copy invite link to clipboard
- [ ] Personal space cannot be left
- [ ] Space switching works and persists
- [ ] Ledger data updates when switching spaces

---

## Phase 1D: Ledger Core — Data & State

### Hooks
- [ ] Build `src/hooks/use-ledger.ts`
  - `useLedgerItems(spaceId, periodType, dateRange)` — fetch items for current space
  - `useAddLedgerItem()` — mutation
  - `useUpdateLedgerItem()` — mutation
  - `useDeleteLedgerItem()` — mutation
  - `useReorderLedgerItems()` — mutation (for drag & drop)
- [ ] Build `src/hooks/use-autocomplete.ts`
  - `useDescriptionSuggestions(spaceId, query)` — fuzzy match from history
  - `useCategorySuggestions(spaceId, query)` — fuzzy match from categories

### Utils
- [ ] Build `src/lib/utils.ts` date grouping logic:
  - `groupByMonth(items)` → Map<string, LedgerItem[]>
  - `groupByWeek(items)` → Map<string, LedgerItem[]> (format: "April 2026 - Week 15 (11 to 17)")
  - `groupByBiWeek(items)` → Map<string, LedgerItem[]>
  - `groupByCustomRange(items, start, end)` → Map<string, LedgerItem[]>
  - `getPeriodBalance(items)` → number
  - `formatPeriodLabel(periodType, date)` → string
  - `formatCurrency(amount)` → string
  - `sortItemsByDate(items)` → LedgerItem[] (stable sort)

### Mock Data
- [ ] Pre-populate `data.js` with sample data:
  - 2 demo users ("Sarah", "John")
  - 1 shared space ("Me & Sarah")
  - April 2026: Rent (-$1,800), Groceries (-$159.50), Salary (+$3,200)
  - March 2026: Rent (-$1,800), Sarah Salary (+$3,200), John Salary (+$2,800)
  - Categories: Rent, Groceries, Salary, Utilities, Dining, Entertainment

---

## Phase 1E: Ledger Core — UI Components (Part 1)

### Controls
- [ ] Build `src/components/ledger/PeriodSelector.tsx`
  - Dropdown with options: Monthly, Weekly, Bi-Weekly, Custom
  - Current selection highlighted
  - Smooth open/close animation
- [ ] Build `src/components/ledger/SmartDateToggle.tsx`
  - Switch component with label
  - Animated thumb
  - Persisted in UI store
- [ ] Build `src/components/ledger/CustomDateRange.tsx`
  - Two native HTML date inputs (start, end)
  - Own component for easy future replacement
  - Validation: end >= start
  - Only visible when PeriodSelector = "Custom"

### Group Containers
- [ ] Build `src/components/ledger/PeriodGroup.tsx`
  - Container for one period's items
  - Integrates DndContext and SortableContext
  - Holds list of LedgerRow components
  - "Add Item" button at bottom
- [ ] Build `src/components/ledger/PeriodHeader.tsx`
  - Period label (e.g., "April 2026")
  - Period Balance (e.g., "+$1,240.50")
  - Balance color: green if positive, red if negative

### Row Components
- [ ] Build `src/components/ledger/LedgerRow.tsx` (Read Mode)
  - Responsive: stacked on mobile (< md), table row on desktop
  - Columns: [DragHandle] | [Amount] | [Description] | [Category] | [Date] | [Avatar]
  - Amount formatting: red negative, green positive, bold
  - Description: truncate with ellipsis
  - Category: subtle badge/pill
  - Date: "Apr 01" format
  - Avatar: 24px circle, initials or image
  - Hover: subtle background tint
  - Click cell → switch to InlineEditRow
- [ ] Build `src/components/ledger/InlineEditRow.tsx` (Edit Mode)
  - Inline inputs for all fields
  - Tab navigation between fields
  - Enter/Blur to save
  - Esc to cancel (revert to read mode)
  - Optimistic update
- [ ] Build `src/components/ledger/AddItemRow.tsx`
  - Inline expansion at bottom of period group
  - Fields: Amount (auto-focus), Description, Category, Date (auto-populated)
  - Tab-navigable
  - Amount: auto-format red/green as user types
  - Description autocomplete dropdown
  - Category autocomplete dropdown
  - Submit on Enter in Date field (or explicit button)
  - Cancel button
  - After submit: animate row insertion and sort into position

### Supporting Components
- [ ] Build `src/components/ledger/UserAvatar.tsx`
  - 24px circle with initials (fallback)
  - Optional image support (for future)
  - Tap/click → popover mini-card
  - Mini-card: full name, "Last modified: [timestamp]"
  - Popover animated with spring
- [ ] Build `src/components/ledger/DragHandle.tsx`
  - 44px touch target
  - Grip icon (lucide `GripVertical`)
  - Cursor: grab/grabbing
  - Accessible: aria-label="Drag to reorder"
- [ ] Build `src/components/ledger/SortResetCue.tsx`
  - Banner/message when drag is disabled
  - "Sorting by date. Reset sort to enable drag & drop."
  - Click to reset sort → trigger animation
  - Animated appearance/disappearance

---

## Phase 1F: Ledger Core — UI Components (Part 2)

### Autocomplete
- [ ] Build `src/components/ledger/AutocompleteInput.tsx`
  - Reusable for both Description and Category
  - Input with dropdown list below
  - Fuzzy matching from suggestions list
  - Keyboard navigation (ArrowUp, ArrowDown, Enter, Esc)
  - Click outside to close
  - Highlight matched text

### Context Menu / Delete
- [ ] Build `src/components/ledger/RowContextMenu.tsx`
  - Desktop: right-click trigger
  - Mobile: long-press trigger
  - Options: Delete (with confirmation)
  - Positioned near cursor/finger
  - Animated open/close
- [ ] Build `src/components/ledger/SwipeToDelete.tsx`
  - Mobile-only wrapper
  - Swipe left reveals red delete button
  - Swipe far enough → confirm delete
  - Swipe back → cancel
  - Smooth spring physics

### Infinite Scroll
- [ ] Build `src/components/ledger/InfiniteScrollLoader.tsx`
  - Intersection Observer trigger
  - Spinner + "Loading older periods..." text
  - No more periods → "All caught up"

---

## Phase 1G: Ledger Core — Interactions & Logic

### Add Item Flow
- [ ] Implement inline add row expansion
- [ ] Auto-focus Amount field on expand
- [ ] Amount field: numeric input, live color formatting
- [ ] Tab: Amount → Description → Category → Date
- [ ] Description autocomplete from space history
- [ ] Category autocomplete from space categories
- [ ] Date: default to current date, editable
- [ ] Submit: validate with Zod, add to data.js
- [ ] After submit:
  - Close add row
  - If date fits current sort → insert with animation
  - If date out of order → slide to correct position with spring animation
  - Update period balance

### Inline Editing
- [ ] Click any cell → enter edit mode for that field
- [ ] Full-row edit mode option (click row body)
- [ ] Tab navigates between fields in edit mode
- [ ] Enter/Blur saves
- [ ] Esc cancels
- [ ] Optimistic UI update
- [ ] If date changed → animate row to new position

### Drag & Drop
- [ ] Integrate @dnd-kit sortable into PeriodGroup
- [ ] Drag handle activation (pointer down, 44px target)
- [ ] Lifted item: scale up slightly, shadow, opacity change
- [ ] Drop target: subtle indicator line
- [ ] Restrict drag to within same period group
- [ ] **Smart Date ON:**
  - Drop after item → inherit date of item above
  - Drop before first item → inherit date of item below
  - Drop at end → inherit date of item above
  - Same dates maintain relative order
  - Trigger green border flash animation on affected row
- [ ] **Smart Date OFF:**
  - Retain original date
  - Update `sortOrder`
  - If currently sorted by date → lock drag, show SortResetCue

### Sorting
- [ ] Default sort: Date ascending
- [ ] Same-date items: preserve original relative order (stable sort)
- [ ] Sort reset: animate rows from date-order to custom-order with stagger
- [ ] Click column header to toggle sort (future feature, prepare for it)

### Delete
- [ ] Swipe to delete (mobile)
- [ ] Right-click menu → Delete (desktop)
- [ ] Long-press menu → Delete (mobile)
- [ ] Confirmation toast: "Item deleted" with undo option (optional for MVP)

---

## Phase 1H: Ledger Core — Period Logic

### Period Grouping
- [ ] **Monthly**: Group by month-year, label "April 2026"
- [ ] **Weekly**: Group by week, label "April 2026 - Week 15 (11 to 17)"
  - Week number in lighter gray
  - Date range parenthetical
- [ ] **Bi-Weekly**: Similar, 2-week blocks
- [ ] **Custom**: Single group, label "Custom Range (Apr 1 - Apr 30)"

### Display Logic
- [ ] Default: show 2 most recent period groups at top
- [ ] Oldest group at bottom has intersection observer trigger
- [ ] On trigger: load next older period group
- [ ] Custom view: single continuous list
  - If > 50 items → trigger infinite scroll for pagination within group

### Period Balance
- [ ] Calculate sum of all item amounts in group
- [ ] Display in PeriodHeader
- [ ] Color: green positive, red negative
- [ ] Update live on add/edit/delete/reorder

---

## Phase 1I: Layout & Integration

### Header
- [ ] Build `src/components/layout/Header.tsx`
  - Sticky top, z-50
  - App name "Wipu" (Manrope, bold)
  - SpaceSelector pill (right side)
  - User avatar/menu (right side)
  - Subtle bottom border, backdrop blur
- [ ] Build `src/components/layout/SpaceSelector.tsx`
  - Pill button: "▾ Personal"
  - Dropdown: list of spaces
  - Active space highlighted
  - Click space → switch active, close dropdown, navigate to /ledger
  - Animated dropdown (slide + fade)

### Main Layout
- [ ] Update `src/app/layout.tsx`
  - Header component
  - Main content area (padding, max-width)
  - Providers (QueryClient, Zustand hydration)
  - Toast container

### Ledger Page
- [ ] Build `src/app/ledger/page.tsx`
  - View controls row (PeriodSelector + SmartDateToggle, flex justify-between)
  - CustomDateRange (conditional)
  - PeriodGroup list (2 groups default, infinite scroll)
  - Loading states
  - Empty state for new spaces

---

## Phase 1J: Animations & Polish

### Micro-interactions
- [ ] Button hover: subtle lift + shadow
- [ ] Button active: scale down 0.98
- [ ] Input focus: blue ring, subtle border color change
- [ ] Toggle switch: spring physics on thumb
- [ ] Dropdown open: stagger children, slide down
- [ ] Modal open: backdrop fade + content scale up
- [ ] Toast: slide up from bottom + fade in
- [ ] Row hover: background tint (150ms ease)
- [ ] Avatar tap: popover spring from center
- [ ] Delete swipe: rubber-band physics

### Row Animations
- [ ] Insert: scale 0.95 → 1, opacity 0 → 1, spring
- [ ] Reorder: layout animation via Framer Motion
- [ ] Date flash: green border, 300ms ease-out, fade out
- [ ] Sort reset: staggered spring reorder

### Accessibility
- [ ] `prefers-reduced-motion` media query
  - Disable non-essential animations
  - Instant transitions instead of spring
- [ ] Focus visible states on all interactive elements
- [ ] Aria labels on icons and interactive elements
- [ ] Keyboard navigation for autocomplete, dropdowns, modals

---

## Phase 1K: Responsive Design

### Mobile (< 768px)
- [ ] Stacked row layout: Amount + Description stacked, Date + Avatar inline
- [ ] Full-width cards with subtle shadow
- [ ] Swipe to delete
- [ ] Long-press for context menu
- [ ] Bottom safe area padding
- [ ] Touch-friendly spacing (min 44px targets)
- [ ] Period selector as full-width dropdown

### Desktop (≥ 768px)
- [ ] Table layout with column headers
- [ ] Right-click for context menu
- [ ] Hover states for rows
- [ ] Compact row density (py-2)
- [ ] Fixed column widths: [32px] [120px] [1fr] [120px] [100px] [60px]

---

## Phase 1L: Testing & QA

### Functional Tests
- [ ] Auth: Register → Auto-login → Personal space created
- [ ] Auth: Login → Redirect to /ledger
- [ ] Auth: Logout → Redirect to /login
- [ ] Spaces: Create space → Appears in list + selector
- [ ] Spaces: Copy invite link → Toast confirmation
- [ ] Spaces: Delete space → Removed from list
- [ ] Spaces: Switch space → Ledger updates
- [ ] Ledger: Add item → Appears in correct period
- [ ] Ledger: Edit item → Updates inline
- [ ] Ledger: Delete item → Removed with animation
- [ ] Ledger: Drag reorder → Order updates (Smart Date ON/OFF)
- [ ] Ledger: Sort reset cue → Appears when appropriate
- [ ] Ledger: Autocomplete → Suggests from history
- [ ] Ledger: Period switching → Groups update
- [ ] Ledger: Custom range → Single group, date inputs work
- [ ] Ledger: Infinite scroll → Loads older periods

### Visual Tests
- [ ] Color coding: green positive, red negative
- [ ] All animations smooth (60fps)
- [ ] Responsive layout correct on mobile/desktop
- [ ] Touch targets ≥ 44px
- [ ] Text legible at all sizes

### Edge Cases
- [ ] Empty space (no items) → Empty state UI
- [ ] Single item in period → Drag disabled (no reorder needed)
- [ ] All items same date → Sort by original order
- [ ] Smart Date ON, drag to top → Inherits date of item below
- [ ] Smart Date ON, drag to bottom → Inherits date of item above
- [ ] Custom range with no items → Empty state

### Build Check
- [ ] `next build` completes with zero errors
- [ ] `next lint` passes
- [ ] No console errors in dev mode

---

## Phase 1M: Git & Delivery

- [ ] Initialize git repository
- [ ] Add comprehensive `.gitignore`
- [ ] Initial commit: "feat: project setup and configuration"
- [ ] Commit after Phase 1B: "feat: authentication system"
- [ ] Commit after Phase 1C: "feat: spaces management"
- [ ] Commit after Phase 1E: "feat: ledger UI components"
- [ ] Commit after Phase 1G: "feat: ledger interactions and drag-drop"
- [ ] Commit after Phase 1J: "feat: animations and polish"
- [ ] Final commit: "feat: responsive design and QA"

---

## Phase 1 Completion Criteria

✅ All checkboxes above are checked  
✅ App is fully functional with mock data  
✅ Auth, spaces, and ledger are complete  
✅ All animations and micro-interactions working  
✅ Responsive on mobile and desktop  
✅ Build passes without errors  
✅ Code committed to git  

---

**Next Phase:** Backend integration (Supabase), real-time sync, and data persistence migration.
