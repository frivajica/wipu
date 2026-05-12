export interface User {
  id: string;
  email: string;
  name: string;
  initials: string;
  avatarUrl: string | null;
}

export interface Space {
  id: string;
  name: string;
  ownerId: string;
  members: string[];
  maxMembers: number;
  inviteCode: string;
  createdAt: string;
  isPersonal?: boolean;
  membersData?: User[];
}

export type LedgerItemType = "default" | "debt";

export interface DebtGroup {
  id: string;
  spaceId: string;
  name: string;
  color: string;
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
  type: LedgerItemType;
  groupId: string | null;
}

export interface Category {
  id: string;
  spaceId: string;
  name: string;
  createdBy: string;
}

export type PeriodType = "monthly" | "weekly" | "bi-weekly" | "custom";

export interface PeriodGroup {
  label: string;
  items: LedgerItem[];
  balance: number;
}

export interface LedgerBalances {
  totalBalance: number;
  totalDebt: number;
  realBalance: number;
  periods: Array<{
    label: string;
    displayLabel: string;
    balance: number;
    debt: number;
    runningBalance: number;
    runningDebt: number;
  }>;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface SpaceState {
  spaces: Space[];
  activeSpaceId: string | null;
}

export interface UIState {
  periodType: PeriodType;
  reorderByDate: boolean;
  customDateRange: {
    start: string;
    end: string;
  } | null;
  sortField: "date" | "amount" | "description" | "category" | "profile" | null;
  sortDirection: "asc" | "desc";
  includesDebt: boolean;
}
