export interface User {
  id: string;
  email: string;
  name: string;
  initials: string;
  avatarUrl: string | null;
  password: string;
}

export interface Space {
  id: string;
  name: string;
  ownerId: string;
  members: string[];
  maxMembers: number;
  inviteCode: string;
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

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface SpaceState {
  spaces: Space[];
  activeSpaceId: string | null;
}

export interface UIState {
  periodType: PeriodType;
  smartDateInheritance: boolean;
  customDateRange: {
    start: string;
    end: string;
  } | null;
  sortByDate: boolean;
}
