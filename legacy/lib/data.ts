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
    isDefault: false,
  },
];

// Demo Ledger Items
export const mockLedgerItems: LedgerItem[] = [
  // September 2025
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -1800,
    description: "Rent Payment - Downtown Apt",
    category: "Rent",
    date: "2025-09-01",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2025-09-01T10:00:00.000Z",
    updatedAt: "2025-09-01T10:00:00.000Z",
    sortOrder: 0,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -87.42,
    description: "Trader Joe's",
    category: "Groceries",
    date: "2025-09-03",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2025-09-03T18:00:00.000Z",
    updatedAt: "2025-09-03T18:00:00.000Z",
    sortOrder: 1,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -45.0,
    description: "Netflix + Spotify",
    category: "Entertainment",
    date: "2025-09-05",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2025-09-05T09:00:00.000Z",
    updatedAt: "2025-09-05T09:00:00.000Z",
    sortOrder: 2,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -124.6,
    description: "Whole Foods Market",
    category: "Groceries",
    date: "2025-09-10",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2025-09-10T14:30:00.000Z",
    updatedAt: "2025-09-10T14:30:00.000Z",
    sortOrder: 3,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: 3200,
    description: "Salary Deposit - Sarah",
    category: "Salary",
    date: "2025-09-15",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2025-09-15T09:00:00.000Z",
    updatedAt: "2025-09-15T09:00:00.000Z",
    sortOrder: 4,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -32.5,
    description: "Thai Garden Restaurant",
    category: "Dining",
    date: "2025-09-18",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2025-09-18T20:00:00.000Z",
    updatedAt: "2025-09-18T20:00:00.000Z",
    sortOrder: 5,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -210.0,
    description: "Electric Bill + Internet",
    category: "Utilities",
    date: "2025-09-22",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2025-09-22T12:00:00.000Z",
    updatedAt: "2025-09-22T12:00:00.000Z",
    sortOrder: 6,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -67.8,
    description: "Trader Joe's",
    category: "Groceries",
    date: "2025-09-25",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2025-09-25T16:00:00.000Z",
    updatedAt: "2025-09-25T16:00:00.000Z",
    sortOrder: 7,
    type: "default",
    groupId: null,
  },
  // October 2025
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -1800,
    description: "Rent Payment - Downtown Apt",
    category: "Rent",
    date: "2025-10-01",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2025-10-01T10:00:00.000Z",
    updatedAt: "2025-10-01T10:00:00.000Z",
    sortOrder: 8,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -142.3,
    description: "Whole Foods Market",
    category: "Groceries",
    date: "2025-10-04",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2025-10-04T14:30:00.000Z",
    updatedAt: "2025-10-04T14:30:00.000Z",
    sortOrder: 9,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -55.0,
    description: "Movie Night + Popcorn",
    category: "Entertainment",
    date: "2025-10-08",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2025-10-08T21:00:00.000Z",
    updatedAt: "2025-10-08T21:00:00.000Z",
    sortOrder: 10,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -98.75,
    description: "Trader Joe's",
    category: "Groceries",
    date: "2025-10-11",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2025-10-11T11:00:00.000Z",
    updatedAt: "2025-10-11T11:00:00.000Z",
    sortOrder: 11,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: 3200,
    description: "Salary Deposit - Sarah",
    category: "Salary",
    date: "2025-10-15",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2025-10-15T09:00:00.000Z",
    updatedAt: "2025-10-15T09:00:00.000Z",
    sortOrder: 12,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -78.2,
    description: "Sushi Palace",
    category: "Dining",
    date: "2025-10-19",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2025-10-19T19:30:00.000Z",
    updatedAt: "2025-10-19T19:30:00.000Z",
    sortOrder: 13,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -210.0,
    description: "Electric Bill + Internet",
    category: "Utilities",
    date: "2025-10-22",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2025-10-22T12:00:00.000Z",
    updatedAt: "2025-10-22T12:00:00.000Z",
    sortOrder: 14,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -156.4,
    description: "Whole Foods Market",
    category: "Groceries",
    date: "2025-10-26",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2025-10-26T15:00:00.000Z",
    updatedAt: "2025-10-26T15:00:00.000Z",
    sortOrder: 15,
    type: "default",
    groupId: null,
  },
  // November 2025
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -1800,
    description: "Rent Payment - Downtown Apt",
    category: "Rent",
    date: "2025-11-01",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2025-11-01T10:00:00.000Z",
    updatedAt: "2025-11-01T10:00:00.000Z",
    sortOrder: 16,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -112.3,
    description: "Trader Joe's",
    category: "Groceries",
    date: "2025-11-05",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2025-11-05T17:00:00.000Z",
    updatedAt: "2025-11-05T17:00:00.000Z",
    sortOrder: 17,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -89.5,
    description: "Electric Bill",
    category: "Utilities",
    date: "2025-11-10",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2025-11-10T12:00:00.000Z",
    updatedAt: "2025-11-10T12:00:00.000Z",
    sortOrder: 18,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: 3200,
    description: "Salary Deposit - Sarah",
    category: "Salary",
    date: "2025-11-15",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2025-11-15T09:00:00.000Z",
    updatedAt: "2025-11-15T09:00:00.000Z",
    sortOrder: 19,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -45.0,
    description: "Netflix + Spotify",
    category: "Entertainment",
    date: "2025-11-17",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2025-11-17T09:00:00.000Z",
    updatedAt: "2025-11-17T09:00:00.000Z",
    sortOrder: 20,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -134.8,
    description: "Whole Foods Market",
    category: "Groceries",
    date: "2025-11-20",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2025-11-20T14:00:00.000Z",
    updatedAt: "2025-11-20T14:00:00.000Z",
    sortOrder: 21,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -89.0,
    description: "Thai Garden Restaurant",
    category: "Dining",
    date: "2025-11-23",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2025-11-23T20:00:00.000Z",
    updatedAt: "2025-11-23T20:00:00.000Z",
    sortOrder: 22,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -76.5,
    description: "Trader Joe's",
    category: "Groceries",
    date: "2025-11-27",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2025-11-27T16:00:00.000Z",
    updatedAt: "2025-11-27T16:00:00.000Z",
    sortOrder: 23,
    type: "default",
    groupId: null,
  },
  // December 2025
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -1800,
    description: "Rent Payment - Downtown Apt",
    category: "Rent",
    date: "2025-12-01",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2025-12-01T10:00:00.000Z",
    updatedAt: "2025-12-01T10:00:00.000Z",
    sortOrder: 24,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -65.0,
    description: "Thai Garden Restaurant",
    category: "Dining",
    date: "2025-12-05",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2025-12-05T20:00:00.000Z",
    updatedAt: "2025-12-05T20:00:00.000Z",
    sortOrder: 25,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -178.9,
    description: "Whole Foods Market",
    category: "Groceries",
    date: "2025-12-08",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2025-12-08T15:00:00.000Z",
    updatedAt: "2025-12-08T15:00:00.000Z",
    sortOrder: 26,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -45.0,
    description: "Netflix + Spotify",
    category: "Entertainment",
    date: "2025-12-10",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2025-12-10T09:00:00.000Z",
    updatedAt: "2025-12-10T09:00:00.000Z",
    sortOrder: 27,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: 3200,
    description: "Salary Deposit - Sarah",
    category: "Salary",
    date: "2025-12-15",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2025-12-15T09:00:00.000Z",
    updatedAt: "2025-12-15T09:00:00.000Z",
    sortOrder: 28,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -250.0,
    description: "Holiday Gifts",
    category: "Entertainment",
    date: "2025-12-18",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2025-12-18T12:00:00.000Z",
    updatedAt: "2025-12-18T12:00:00.000Z",
    sortOrder: 29,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -210.0,
    description: "Electric Bill + Internet",
    category: "Utilities",
    date: "2025-12-22",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2025-12-22T12:00:00.000Z",
    updatedAt: "2025-12-22T12:00:00.000Z",
    sortOrder: 30,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -145.6,
    description: "Trader Joe's",
    category: "Groceries",
    date: "2025-12-28",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2025-12-28T16:00:00.000Z",
    updatedAt: "2025-12-28T16:00:00.000Z",
    sortOrder: 31,
    type: "default",
    groupId: null,
  },
  // January 2026
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -1800,
    description: "Rent Payment - Downtown Apt",
    category: "Rent",
    date: "2026-01-01",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
    sortOrder: 32,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -93.2,
    description: "Whole Foods Market",
    category: "Groceries",
    date: "2026-01-06",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2026-01-06T14:00:00.000Z",
    updatedAt: "2026-01-06T14:00:00.000Z",
    sortOrder: 33,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -45.0,
    description: "Netflix + Spotify",
    category: "Entertainment",
    date: "2026-01-10",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2026-01-10T09:00:00.000Z",
    updatedAt: "2026-01-10T09:00:00.000Z",
    sortOrder: 34,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: 3200,
    description: "Salary Deposit - Sarah",
    category: "Salary",
    date: "2026-01-15",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2026-01-15T09:00:00.000Z",
    updatedAt: "2026-01-15T09:00:00.000Z",
    sortOrder: 35,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -112.5,
    description: "Sushi Palace",
    category: "Dining",
    date: "2026-01-19",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2026-01-19T19:30:00.000Z",
    updatedAt: "2026-01-19T19:30:00.000Z",
    sortOrder: 36,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -210.0,
    description: "Electric Bill + Internet",
    category: "Utilities",
    date: "2026-01-22",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2026-01-22T12:00:00.000Z",
    updatedAt: "2026-01-22T12:00:00.000Z",
    sortOrder: 37,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -87.4,
    description: "Trader Joe's",
    category: "Groceries",
    date: "2026-01-26",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2026-01-26T17:00:00.000Z",
    updatedAt: "2026-01-26T17:00:00.000Z",
    sortOrder: 38,
    type: "default",
    groupId: null,
  },
  // February 2026 — EMPTY (gap month for testing)
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
    sortOrder: 39,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -134.7,
    description: "Whole Foods Market",
    category: "Groceries",
    date: "2026-03-05",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2026-03-05T14:00:00.000Z",
    updatedAt: "2026-03-05T14:00:00.000Z",
    sortOrder: 40,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -45.0,
    description: "Netflix + Spotify",
    category: "Entertainment",
    date: "2026-03-10",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2026-03-10T09:00:00.000Z",
    updatedAt: "2026-03-10T09:00:00.000Z",
    sortOrder: 41,
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
    sortOrder: 42,
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
    sortOrder: 43,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -67.8,
    description: "Thai Garden Restaurant",
    category: "Dining",
    date: "2026-03-18",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2026-03-18T20:00:00.000Z",
    updatedAt: "2026-03-18T20:00:00.000Z",
    sortOrder: 44,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -210.0,
    description: "Electric Bill + Internet",
    category: "Utilities",
    date: "2026-03-22",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2026-03-22T12:00:00.000Z",
    updatedAt: "2026-03-22T12:00:00.000Z",
    sortOrder: 45,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -98.3,
    description: "Trader Joe's",
    category: "Groceries",
    date: "2026-03-26",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2026-03-26T17:00:00.000Z",
    updatedAt: "2026-03-26T17:00:00.000Z",
    sortOrder: 46,
    type: "default",
    groupId: null,
  },
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
    sortOrder: 47,
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
    sortOrder: 48,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -45.0,
    description: "Netflix + Spotify",
    category: "Entertainment",
    date: "2026-04-10",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2026-04-10T09:00:00.000Z",
    updatedAt: "2026-04-10T09:00:00.000Z",
    sortOrder: 49,
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
    sortOrder: 50,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: 2800,
    description: "Salary Deposit - John",
    category: "Salary",
    date: "2026-04-15",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2026-04-15T09:00:00.000Z",
    updatedAt: "2026-04-15T09:00:00.000Z",
    sortOrder: 51,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -78.9,
    description: "Sushi Palace",
    category: "Dining",
    date: "2026-04-18",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2026-04-18T19:30:00.000Z",
    updatedAt: "2026-04-18T19:30:00.000Z",
    sortOrder: 52,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -210.0,
    description: "Electric Bill + Internet",
    category: "Utilities",
    date: "2026-04-22",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2026-04-22T12:00:00.000Z",
    updatedAt: "2026-04-22T12:00:00.000Z",
    sortOrder: 53,
    type: "default",
    groupId: null,
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -121.4,
    description: "Trader Joe's",
    category: "Groceries",
    date: "2026-04-26",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2026-04-26T16:00:00.000Z",
    updatedAt: "2026-04-26T16:00:00.000Z",
    sortOrder: 54,
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
    date: "2025-11-10",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2025-11-10T11:00:00.000Z",
    updatedAt: "2025-11-10T11:00:00.000Z",
    sortOrder: 55,
    type: "debt",
    groupId: "debt-group-1",
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -400,
    description: "Bicycle for the Play",
    category: "Debt Payment",
    date: "2025-12-10",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2025-12-10T11:00:00.000Z",
    updatedAt: "2025-12-10T11:00:00.000Z",
    sortOrder: 56,
    type: "debt",
    groupId: "debt-group-1",
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -400,
    description: "Bicycle for the Play",
    category: "Debt Payment",
    date: "2026-01-10",
    createdBy: "user-1",
    updatedBy: "user-1",
    createdAt: "2026-01-10T11:00:00.000Z",
    updatedAt: "2026-01-10T11:00:00.000Z",
    sortOrder: 57,
    type: "debt",
    groupId: "debt-group-1",
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: 500,
    description: "Laptop Repair",
    category: "Debt",
    date: "2026-03-12",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2026-03-12T14:00:00.000Z",
    updatedAt: "2026-03-12T14:00:00.000Z",
    sortOrder: 58,
    type: "debt",
    groupId: "debt-group-2",
  },
  {
    id: generateId(),
    spaceId: "space-1",
    amount: -150,
    description: "Laptop Repair",
    category: "Debt Payment",
    date: "2026-04-12",
    createdBy: "user-2",
    updatedBy: "user-2",
    createdAt: "2026-04-12T14:00:00.000Z",
    updatedAt: "2026-04-12T14:00:00.000Z",
    sortOrder: 59,
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
