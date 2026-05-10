import { DateTime } from "luxon";
import { User, Space, LedgerItem, Category, DebtGroup, LedgerBalances } from "./types";
import { getInitials, generateId, generateInviteCode } from "./id-utils";

// Demo Users
export const mockUsers: User[] = [
  {
    id: "user-1",
    email: "sarah@example.com",
    name: "Sarah",
    initials: getInitials("Sarah"),
    avatarUrl: null,
    password: "demo123",
  },
  {
    id: "user-2",
    email: "john@example.com",
    name: "John",
    initials: getInitials("John"),
    avatarUrl: null,
    password: "demo123",
  },
];

// Demo Spaces
export const mockSpaces: Space[] = [
  {
    id: "space-1",
    name: "Me & Sarah",
    ownerId: "user-1",
    members: ["user-1", "user-2"],
    maxMembers: 8,
    inviteCode: generateInviteCode(),
    createdAt: "2026-01-15T00:00:00.000Z",
    isPersonal: false,
  },
];

// Demo Ledger Items
export const mockLedgerItems: LedgerItem[] = [
  // April 2026
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -1800,
    description: "Rent Payment - Downtown Apt",
    category: "Rent",
    date: "2026-04-01",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2026-04-01T10:00:00.000Z",
    updatedAt: "2026-04-01T10:00:00.000Z",
    sortOrder: 0,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -159.5,
    description: "Whole Foods Market",
    category: "Groceries",
    date: "2026-04-05",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2026-04-05T14:30:00.000Z",
    updatedAt: "2026-04-05T14:30:00.000Z",
    sortOrder: 1,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: 3200,
    description: "Salary Deposit - Sarah",
    category: "Salary",
    date: "2026-04-15",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2026-04-15T09:00:00.000Z",
    updatedAt: "2026-04-15T09:00:00.000Z",
    sortOrder: 2,
    type: "default",
    groupId: null,
  },
  // March 2026
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -1800,
    description: "Rent Payment - Downtown Apt",
    category: "Rent",
    date: "2026-03-01",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
    sortOrder: 0,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: 3200,
    description: "Salary Deposit - Sarah",
    category: "Salary",
    date: "2026-03-15",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2026-03-15T09:00:00.000Z",
    updatedAt: "2026-03-15T09:00:00.000Z",
    sortOrder: 1,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: 2800,
    description: "Salary Deposit - John",
    category: "Salary",
    date: "2026-03-15",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2026-03-15T09:00:00.000Z",
    updatedAt: "2026-03-15T09:00:00.000Z",
    sortOrder: 2,
    type: "default",
    groupId: null,
  },
  // Debt Items
  {
    id: generateId(),
    spaceId: "space-1",
    amount: 1200,
    description: "Bicycle for the Play",
    category: "Debt",
    date: "2026-04-10",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2026-04-10T11:00:00.000Z",
    updatedAt: "2026-04-10T11:00:00.000Z",
    sortOrder: 3,
    type: "debt",
    groupId: "debt-group-1",
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -400,
    description: "Bicycle for the Play",
    category: "Debt Payment",
    date: "2026-04-20",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2026-04-20T11:00:00.000Z",
    updatedAt: "2026-04-20T11:00:00.000Z",
    sortOrder: 4,
    type: "debt",
    groupId: "debt-group-1",
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: 500,
    description: "Laptop Repair",
    category: "Debt",
    date: "2026-04-12",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2026-04-12T14:00:00.000Z",
    updatedAt: "2026-04-12T14:00:00.000Z",
    sortOrder: 5,
    type: "debt",
    groupId: "debt-group-2",
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -150,
    description: "Laptop Repair",
    category: "Debt Payment",
    date: "2026-04-25",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2026-04-25T14:00:00.000Z",
    updatedAt: "2026-04-25T14:00:00.000Z",
    sortOrder: 6,
    type: "debt",
    groupId: "debt-group-2",
  },
];

// Demo Debt Groups
export const mockDebtGroups: DebtGroup[] = [
  {
    id: "debt-group-1",
    spaceId: "space-1",
    name: "General Debt",
    color: "#3b82f6",
    createdBy: "user-1",
    createdAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "debt-group-2",
    spaceId: "space-1",
    name: "Laptop Repair",
    color: "#3b82f6",
    createdBy: "user-2",
    createdAt: "2026-04-01T00:00:00.000Z",
  },
];

// Demo Categories
export const mockCategories: Category[] = [
  { id: generateId(), spaceId: "space-1", name: "Rent", createdBy: "user-1" },
  { id: generateId(), spaceId: "space-1", name: "Groceries", createdBy: "user-2" },
  { id: generateId(), spaceId: "space-1", name: "Salary", createdBy: "user-1" },
  { id: generateId(), spaceId: "space-1", name: "Utilities", createdBy: "user-1" },
  { id: generateId(), spaceId: "space-1", name: "Dining", createdBy: "user-2" },
  { id: generateId(), spaceId: "space-1", name: "Entertainment", createdBy: "user-2" },
];

// Mock Database API
class MockDatabase {
  private users: User[] = [...mockUsers];
  private spaces: Space[] = [...mockSpaces];
  private ledgerItems: LedgerItem[] = [...mockLedgerItems];
  private debtGroups: DebtGroup[] = [...mockDebtGroups];
  private categories: Category[] = [...mockCategories];

  // Users
  getUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email === email);
  }

  createUser(user: Omit<User, "id" | "initials">): User {
    const newUser: User = {
      ...user,
      id: generateId(),
      initials: getInitials(user.name),
    };
    this.users.push(newUser);
    return newUser;
  }

  // Spaces
  getSpaces(): Space[] {
    return this.spaces;
  }

  getSpacesByUserId(userId: string): Space[] {
    return this.spaces.filter(
      (s) => s.ownerId === userId || s.members.includes(userId)
    );
  }

  getSpaceById(id: string): Space | undefined {
    return this.spaces.find((s) => s.id === id);
  }

  createSpace(space: Omit<Space, "id" | "inviteCode" | "createdAt">): Space {
    const newSpace: Space = {
      ...space,
      id: generateId(),
      inviteCode: generateInviteCode(),
      createdAt: new Date().toISOString(),
    };
    this.spaces.push(newSpace);
    return newSpace;
  }

  updateSpaceName(id: string, name: string): Space | undefined {
    const space = this.getSpaceById(id);
    if (space) {
      space.name = name;
    }
    return space;
  }

  removeMember(spaceId: string, userId: string): void {
    const space = this.getSpaceById(spaceId);
    if (space) {
      space.members = space.members.filter((m) => m !== userId);
    }
  }

  deleteSpace(id: string): void {
    this.spaces = this.spaces.filter((s) => s.id !== id);
    this.ledgerItems = this.ledgerItems.filter((i) => i.spaceId !== id);
    this.categories = this.categories.filter((c) => c.spaceId !== id);
  }

  leaveSpace(spaceId: string, userId: string): void {
    const space = this.getSpaceById(spaceId);
    if (space) {
      space.members = space.members.filter((m) => m !== userId);
    }
  }

  // Ledger Items
  getLedgerItems(spaceId?: string): LedgerItem[] {
    let items = this.ledgerItems;
    if (spaceId) {
      items = items.filter((i) => i.spaceId === spaceId);
    }
    return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getLedgerItemById(id: string): LedgerItem | undefined {
    return this.ledgerItems.find((i) => i.id === id);
  }

  createLedgerItem(item: Omit<LedgerItem, "id" | "createdAt" | "updatedAt">): LedgerItem {
    const now = new Date().toISOString();
    const newItem: LedgerItem = {
      ...item,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    this.ledgerItems.push(newItem);
    return newItem;
  }

  updateLedgerItem(id: string, updates: Partial<LedgerItem>): LedgerItem | undefined {
    const index = this.ledgerItems.findIndex((i) => i.id === id);
    if (index === -1) return undefined;
    
    this.ledgerItems[index] = {
      ...this.ledgerItems[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.ledgerItems[index];
  }

  updateLedgerItemsByDescription(
    spaceId: string,
    description: string,
    updates: Partial<LedgerItem>
  ): number {
    let count = 0;
    this.ledgerItems.forEach((item) => {
      if (
        item.spaceId === spaceId &&
        item.description === description &&
        item.type === "debt"
      ) {
        Object.assign(item, updates, { updatedAt: new Date().toISOString() });
        count++;
      }
    });
    return count;
  }

  deleteLedgerItem(id: string): void {
    this.ledgerItems = this.ledgerItems.filter((i) => i.id !== id);
  }

  reorderLedgerItems(spaceId: string, itemIds: string[]): void {
    const items = this.ledgerItems.filter((i) => i.spaceId === spaceId);
    const itemMap = new Map(items.map((i) => [i.id, i]));
    
    itemIds.forEach((id, index) => {
      const item = itemMap.get(id);
      if (item) {
        item.sortOrder = index;
      }
    });
  }

  // Categories
  getCategories(spaceId?: string): Category[] {
    if (spaceId) {
      return this.categories.filter((c) => c.spaceId === spaceId);
    }
    return this.categories;
  }

  createCategory(category: Omit<Category, "id">): Category {
    const newCategory: Category = {
      ...category,
      id: generateId(),
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  // Debt Groups
  getDebtGroups(spaceId?: string): DebtGroup[] {
    if (spaceId) {
      return this.debtGroups.filter((g) => g.spaceId === spaceId);
    }
    return this.debtGroups;
  }

  getDebtGroupById(id: string): DebtGroup | undefined {
    return this.debtGroups.find((g) => g.id === id);
  }

  createDebtGroup(group: Omit<DebtGroup, "id" | "createdAt">): DebtGroup {
    const newGroup: DebtGroup = {
      ...group,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    this.debtGroups.push(newGroup);
    return newGroup;
  }

  // Balance Calculations
  getBalances(spaceId: string, periodType = "monthly"): LedgerBalances {
    const items = this.getLedgerItems(spaceId);

    const periods = this.groupByPeriod(items, periodType);

    let runningBalance = 0;
    let runningDebt = 0;

    const periodBalances = periods.map((period) => {
      const balance = period.items
        .filter((item) => item.type === "default")
        .reduce((sum, item) => sum + item.amount, 0);

      const debt = period.items
        .filter((item) => item.type === "debt")
        .reduce((sum, item) => sum + item.amount, 0);

      runningBalance += balance;
      runningDebt += debt;

      return {
        label: period.label,
        balance,
        debt,
        runningBalance,
        runningDebt,
      };
    });

    const realBalance = periodBalances.reduce((sum, p) => sum + p.balance, 0);
    const totalDebt = periodBalances.reduce((sum, p) => sum + p.debt, 0);

    return {
      totalBalance: realBalance + totalDebt,
      totalDebt,
      realBalance,
      periods: periodBalances,
    };
  }

  getDebtGroupBalance(spaceId: string, groupId: string): number {
    return this.getLedgerItems(spaceId)
      .filter((item) => item.type === "debt" && item.groupId === groupId)
      .reduce((sum, item) => sum + item.amount, 0);
  }

  private groupByPeriod(
    items: LedgerItem[],
    periodType: string
  ): Array<{ label: string; items: LedgerItem[] }> {
    const groups = new Map<string, LedgerItem[]>();

    for (const item of items) {
      const dt = DateTime.fromISO(item.date);
      let key: string;

      if (periodType === "monthly") {
        key = dt.toFormat("MMMM yyyy");
      } else if (periodType === "weekly") {
        const weekStart = dt.startOf("week");
        const weekEnd = dt.endOf("week");
        key = `${dt.toFormat("MMMM yyyy")} - Week ${dt.weekNumber} (${weekStart.toFormat("dd")} to ${weekEnd.toFormat("dd")})`;
      } else if (periodType === "bi-weekly") {
        const weekNumber = dt.weekNumber;
        const biWeekNumber = Math.ceil(weekNumber / 2);
        const biWeekStart = dt.startOf("week").minus({ weeks: (weekNumber - 1) % 2 });
        const biWeekEnd = biWeekStart.plus({ weeks: 1 }).endOf("week");
        key = `${dt.toFormat("MMMM yyyy")} - Bi-Week ${biWeekNumber} (${biWeekStart.toFormat("dd")} to ${biWeekEnd.toFormat("dd")})`;
      } else {
        key = item.date;
      }

      const existing = groups.get(key) || [];
      existing.push(item);
      groups.set(key, existing);
    }

    return Array.from(groups.entries())
      .sort((a, b) => {
        const aMin = Math.min(...a[1].map((i) => DateTime.fromISO(i.date).toMillis()));
        const bMin = Math.min(...b[1].map((i) => DateTime.fromISO(i.date).toMillis()));
        return aMin - bMin;
      })
      .map(([label, items]) => ({ label, items }));
  }
}

export const mockDb = new MockDatabase();
