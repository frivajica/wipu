# Wipu — Project Definition

## 1. Overview

**App Name:** Wipu  
**Type:** Progressive Web App (PWA)  
**Target Users:** Couples, small groups (max 8 per space)  
**Purpose:** A shared expense/income tracker for couples and small teams, prioritizing logical date inheritance, high-density visibility, and rapid data entry.

## 2. Core Concept

A ledger-based finance tracker where items are grouped by selectable time periods (Monthly, Weekly, Bi-Weekly, or Custom). Users belong to "Spaces" (teams). Each ledger item belongs to exactly one space and one user (the person who added/last modified it). The app emphasizes:

- **Multi-user transparency** via avatars and timestamps.
- **Smart date inheritance** when reordering items via drag-and-drop.
- **High-density, mobile-first** UI with rapid inline entry and editing.
- **Fluid interactions** with subtle animations, micro-interactions, and optimistic updates.

## 3. Tech Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | Next.js | 16.1.6 | App Router, React Compiler opt-in |
| UI Library | React / React DOM | 19.x | Required by Next.js 16 |
| Language | TypeScript | 5.x | Strict mode |
| Styling | Tailwind CSS | 4.x | Custom design token extensions (modern, clean palette) |
| Client State | Zustand | 5.x | Auth, spaces, UI state |
| Server State | TanStack Query (React) | v5.71+ | Mock data fetching, caching, mutations |
| Drag & Drop | @dnd-kit/core + sortable | latest | Touch-friendly, accessible |
| Animations | Framer Motion | latest | Layout animations, transitions, micro-interactions |
| Date Utils | date-fns | latest | Period grouping, formatting |
| Icons | lucide-react | latest | MIT license, commercial use OK |
| Forms | Native + Zod | latest | Validation |

## 4. Architecture

### 4.1 Frontend-Only Phase (Current)
- All data stored in `data.js` (mock database) and persisted to `localStorage`.
- TanStack Query hooks treat `data.js` as the "backend" via async mock functions.
- Zustand stores manage client-side state (auth session, active space, UI toggles).
- All CRUD operations mutate `data.js` and trigger TanStack Query invalidation.

### 4.2 Future Backend Phase
- **Supabase** (recommended): PostgreSQL, Auth, Realtime, Row Level Security.
- Migration path: Replace mock query functions with Supabase client calls. Zustand stores and UI components remain largely unchanged.

## 5. Data Model

### 5.1 Entities

#### User
- `id`: string (UUID)
- `email`: string
- `name`: string
- `initials`: string (auto-generated from name)
- `avatarUrl`: string | null
- `password`: string (plaintext for mock phase, hashed for future backend)

#### Space
- `id`: string (UUID)
- `name`: string
- `ownerId`: string (User.id)
- `members`: string[] (User.id array, max 8)
- `inviteCode`: string (unique, generated on creation)
- `createdAt`: ISO string

#### LedgerItem
- `id`: string (UUID)
- `spaceId`: string
- `amount`: number (positive = inflow, negative = outflow)
- `description`: string
- `category`: string
- `date`: ISO date string
- `createdBy`: string (User.id)
- `updatedBy`: string (User.id)
- `createdAt`: ISO string
- `updatedAt`: ISO string
- `sortOrder`: number (relative order within a space, for custom ordering when not sorted by date)

#### Category
- `id`: string (UUID)
- `spaceId`: string
- `name`: string
- `createdBy`: string (User.id)

### 5.2 Relationships
- User 1:N Space (as owner)
- User N:N Space (as member, via `Space.members`)
- Space 1:N LedgerItem
- Space 1:N Category
- User 1:N LedgerItem (as creator/updater)

## 6. Feature Inventory

### 6.1 Authentication
- Email/password registration
- Email/password login
- Logout
- Session persisted in localStorage
- Protected routes (redirect unauthenticated to /login)

### 6.2 Spaces Management
- List all spaces user belongs to
- Create new space (auto-generates invite code, max 8 members)
- Delete space (owner only)
- Leave space (disabled for "Personal" space, disabled if sole owner with no transfer)
- Copy invite link to clipboard (`https://wipu.app/join/{inviteCode}`)
- Switch active space via header dropdown
- Personal space created automatically on registration

### 6.3 Ledger (Core)
- **Period Selection**: Monthly, Weekly, Bi-Weekly, Custom
- **Period Grouping**: Items grouped by period, 2 most recent shown by default, infinite scroll for older
- **Period Balance**: Sum of items shown in group header
- **Smart Date Inheritance Toggle**: Global toggle in header
- **Add Item**: Inline row expansion at bottom of period group
  - Fields: Amount, Description (autocomplete), Category (autocomplete), Date (auto-populated)
  - Tab-navigable fields
  - Amount auto-formats (green positive, red negative)
  - On submit: if date is out of order, row animates to correct position
- **Inline Editing**: Click any cell to edit (Amount, Description, Category, Date)
  - Enter/Blur to save, Esc to cancel
- **Drag & Drop**: Reorder rows within period group via drag handle
  - Smart Date ON: inherit date from neighbor based on drop position
  - Smart Date OFF: retain original date
  - Sort-lock: if sorted by date and Smart Date OFF, drag is disabled with reset cue
- **Sorting**: Default Date (Ascending). Same-date items preserve original relative order.
- **Row Actions**: 
  - Swipe to delete (mobile)
  - Right-click context menu → Delete (desktop)
  - Long-press context menu → Delete (mobile)
- **User Avatars**: 24px circular avatar showing `updatedBy` user
  - Tap/click opens mini-card with name and "Last Modified" timestamp
- **Autocomplete**: Description and Category suggest from space history
- **Infinite Scroll**: Load older periods on scroll
- **Custom View**: Single group with date range picker (native HTML inputs)
- **Responsive**: Mobile stacked layout, desktop table layout

## 7. UI/UX Specifications

### 7.1 Design Philosophy
Modern, clean, and trustworthy "Fintech" aesthetic. Not locked to Material Design — instead, a bespoke system that prioritizes clarity, density, and delightful micro-interactions. Think: calm confidence, not corporate stiffness.

### 7.2 Design Tokens (Tailwind Config)
A refined, modern palette:
- **Primary**: Deep navy blue `#0f172a` (trust, stability)
- **Primary Accent**: Bright blue `#3b82f6` (actions, links)
- **Secondary**: Forest green `#059669` (inflows, success)
- **Error**: Warm red `#dc2626` (outflows, danger)
- **Background**: Soft off-white `#f8fafc`
- **Surface**: Pure white `#ffffff`
- **Surface Elevated**: `#f1f5f9` (subtle hover states)
- **Text Primary**: Near-black `#0f172a`
- **Text Secondary`: Slate `#64748b`
- **Border`: Light slate `#e2e8f0`
- **Border Focus**: Primary accent `#3b82f6`

### 7.3 Typography
- **Inter**: Body text, labels, data, numeric values (highly legible at small sizes)
- **Manrope**: Headlines, titles, balances (geometric, modern, confident)

### 7.4 Layout
- Mobile-first, max-width container centered on desktop (`max-w-4xl`)
- Sticky header with app name "Wipu", space selector (pill), user menu
- No bottom nav bar (only Ledger in Phase 1)
- Minimum touch target: 44px
- Generous whitespace with information-dense rows

### 7.5 Animations & Micro-interactions
- **Row insertion**: Scale from 0.95 + opacity 0→1, then spring to position
- **Drag reorder**: Smooth layout shift with subtle scale on lifted item
- **Date auto-update**: Green border flash (300ms ease-out)
- **Sort reset**: Rows shuffle with staggered spring animation
- **Hover states**: Subtle background tint (`bg-slate-50`) with 150ms transition
- **Active states**: Slight scale down (`scale-[0.98]`) on press
- **Focus rings**: Blue glow (`ring-2 ring-blue-500 ring-offset-2`) for accessibility
- **Toasts**: Slide in from bottom with opacity fade
- **Page transitions**: Subtle fade (200ms)
- **Avatar tap**: Popover scales from center with spring physics
- **Toggle switch**: Smooth translate with spring bounce
- **Delete swipe**: Row slides with red background reveal, snap-back or confirm

### 7.6 Color Coding
- Positive amounts: `text-emerald-600` (green)
- Negative amounts: `text-red-600` (red)
- Neutral/Info: `text-slate-500` (gray)

## 8. File Structure

```
wipu/
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx
│   │   ├── (auth)/register/page.tsx
│   │   ├── spaces/page.tsx
│   │   ├── ledger/page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/ (primitives: Button, Input, Toggle, Modal, Toast, Menu)
│   │   ├── layout/ (Header, SpaceSelector)
│   │   ├── auth/ (forms)
│   │   ├── ledger/ (rows, groups, controls)
│   │   └── spaces/ (cards, modals)
│   ├── hooks/ (custom hooks)
│   ├── stores/ (Zustand)
│   ├── lib/
│   │   ├── data.js
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   └── types.ts
│   └── styles/
│       └── tailwind.config.ts
├── data.js
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 9. Constraints & Rules

- Max 8 members per space
- Personal space cannot be left
- Items cannot be dragged across period groups
- Custom view shows single group, infinite scroll after 50 items
- All mock data persisted to localStorage
- Invite links are mock-only (copy to clipboard, no actual join flow)
- Numeric input only for amounts (no expressions in MVP)
- Each ledger item has exactly one owner/updater (no shared items)
- Drag handles minimum 44px touch target
- All animations must respect `prefers-reduced-motion`

## 10. Future Phases

- **Phase 2**: Supabase backend, real auth, real-time sync
- **Phase 3**: Budgets screen
- **Phase 4**: Analytics screen
- **Phase 5**: AI category suggestions, profile pictures, push notifications, dark mode

## 11. Nomenclature

- **Space**: A team/workspace (e.g., "Personal", "Me & Sarah")
- **Ledger Item**: A single income or expense entry
- **Period**: A time grouping (Month, Week, Bi-Week, Custom Range)
- **Smart Date Inheritance**: Auto-updating dates when reordering via drag & drop
- **Sort Order**: The custom relative ordering of items (used when not sorting by date)
