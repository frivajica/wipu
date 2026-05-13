import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  numeric,
  jsonb,
  unique,
  index,
  foreignKey,
} from "drizzle-orm/pg-core";

// ═══════════════════════════════════════
// BETTER AUTH TABLES
// ═══════════════════════════════════════
// These must be defined here so the Drizzle adapter can resolve them.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

// ═══════════════════════════════════════
// REFERENCE TABLES
// ═══════════════════════════════════════

export const currencies = pgTable("currencies", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  decimalPlaces: integer("decimal_places").default(2),
});

// ═══════════════════════════════════════
// CORE TABLES
// ═══════════════════════════════════════

// Note: users table is managed by Better Auth
// We reference user IDs as text (UUID strings) in foreign keys

export const spaces = pgTable("spaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  ownerId: text("owner_id").notNull(), // References Better Auth user.id
  maxMembers: integer("max_members").default(15),
  inviteCode: text("invite_code").notNull().unique(),
  currency: text("currency")
    .notNull()
    .default("MXN")
    .references(() => currencies.code),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const spaceMembers = pgTable(
  "space_members",
  {
    spaceId: uuid("space_id")
      .notNull()
      .references(() => spaces.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(), // References Better Auth user.id
    role: text("role").default("member"), // 'owner' | 'member'
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique().on(table.spaceId, table.userId),
    index("idx_space_members_space").on(table.spaceId),
    index("idx_space_members_user").on(table.userId),
  ]
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    spaceId: uuid("space_id")
      .notNull()
      .references(() => spaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdBy: text("created_by"), // References Better Auth user.id
  },
  (table) => [unique().on(table.spaceId, table.name)]
);

export const debtGroups = pgTable("debt_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  spaceId: uuid("space_id")
    .notNull()
    .references(() => spaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").default("#3b82f6"),
  createdBy: text("created_by"), // References Better Auth user.id
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const ledgerItems = pgTable(
  "ledger_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    spaceId: uuid("space_id")
      .notNull()
      .references(() => spaces.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency")
      .notNull()
      .default("MXN")
      .references(() => currencies.code),
    description: text("description").notNull(),
    category: text("category").notNull(),
    date: date("date").notNull(),
    type: text("type").notNull().default("default"), // 'default' | 'debt'
    groupId: uuid("group_id").references(() => debtGroups.id, {
      onDelete: "set null",
    }),
    sortOrder: integer("sort_order").notNull().default(0),
    version: integer("version").notNull().default(1),
    createdBy: text("created_by"), // References Better Auth user.id
    updatedBy: text("updated_by"), // References Better Auth user.id
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_ledger_space_date").on(table.spaceId, table.date),
    index("idx_ledger_space_type").on(table.spaceId, table.type),
    index("idx_ledger_space_group").on(table.spaceId, table.groupId),
    index("idx_ledger_space_sort").on(table.spaceId, table.sortOrder),
  ]
);

// ═══════════════════════════════════════
// RECURRING ITEMS
// ═══════════════════════════════════════

export const recurringItems = pgTable("recurring_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  spaceId: uuid("space_id")
    .notNull()
    .references(() => spaces.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency")
    .notNull()
    .default("MXN")
    .references(() => currencies.code),
  description: text("description").notNull(),
  category: text("category").notNull(),
  type: text("type").notNull().default("default"),
  groupId: uuid("group_id").references(() => debtGroups.id, {
    onDelete: "set null",
  }),
  frequencyUnit: text("frequency_unit").notNull(), // 'days' | 'weekly' | 'monthly' | 'yearly'
  intervalCount: integer("interval_count").notNull().default(1),
  byDay: text("by_day"), // comma-separated days: 'MO,WE,FR'
  byMonthDay: integer("by_month_day"), // 1-31, -1 for last day
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  count: integer("count"),
  nextOccurrence: date("next_occurrence").notNull(),
  lastComputedAt: timestamp("last_computed_at", { withTimezone: true }).defaultNow(),
  createdBy: text("created_by"), // References Better Auth user.id
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const recurringInstances = pgTable(
  "recurring_instances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recurringItemId: uuid("recurring_item_id")
      .notNull()
      .references(() => recurringItems.id, { onDelete: "cascade" }),
    occurrenceDate: date("occurrence_date").notNull(),
    skipped: boolean("skipped").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique().on(table.recurringItemId, table.occurrenceDate),
    index("idx_recurring_instances_item_date").on(
      table.recurringItemId,
      table.occurrenceDate
    ),
    index("idx_recurring_instances_date").on(table.occurrenceDate),
  ]
);

// ═══════════════════════════════════════
// AUDIT LOG
// ═══════════════════════════════════════

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tableName: text("table_name").notNull(),
    recordId: uuid("record_id").notNull(),
    action: text("action").notNull(), // 'INSERT' | 'UPDATE' | 'DELETE'
    oldValues: jsonb("old_values"),
    newValues: jsonb("new_values"),
    performedBy: text("performed_by"), // References Better Auth user.id
    significance: text("significance").notNull().default("normal"), // 'normal' | 'internal'
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_audit_record").on(table.tableName, table.recordId),
    index("idx_audit_user").on(table.performedBy),
    index("idx_audit_time").on(table.createdAt),
    index("idx_audit_retention").on(table.significance, table.createdAt),
  ]
);
