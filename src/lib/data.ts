import { User, Space, LedgerItem, Category } from "./types";
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
    if (spaceId) {
      return this.ledgerItems.filter((i) => i.spaceId === spaceId);
    }
    return this.ledgerItems;
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
}

export const mockDb = new MockDatabase();
