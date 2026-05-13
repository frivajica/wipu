import "dotenv/config";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import {
  currencies,
  spaces,
  spaceMembers,
  categories,
  debtGroups,
  ledgerItems,
} from "@/db/schema";
import {
  mockUsers,
  mockSpaces,
  mockCategories,
  mockDebtGroups,
  mockLedgerItems,
} from "../legacy/lib/data";
import { assertBackendConfig } from "@/lib/config";

assertBackendConfig();

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Seed currencies first (required by spaces FK)
  await db
    .insert(currencies)
    .values([
      { code: "MXN", name: "Mexican Peso", symbol: "$", decimalPlaces: 2 },
      { code: "USD", name: "US Dollar", symbol: "$", decimalPlaces: 2 },
      { code: "EUR", name: "Euro", symbol: "€", decimalPlaces: 2 },
      { code: "GBP", name: "British Pound", symbol: "£", decimalPlaces: 2 },
      { code: "JPY", name: "Japanese Yen", symbol: "¥", decimalPlaces: 0 },
    ])
    .onConflictDoNothing();
  console.log("  ✅ Currencies seeded");

  // 2. Create users via Better Auth API
  const userIdMap = new Map<string, string>(); // oldId -> newId

  for (const mockUser of mockUsers) {
    try {
      // Use Better Auth's server-side signUpEmail API
      // Password must be >= minPasswordLength (6) per auth.ts config
      const result = await auth.api.signUpEmail({
        body: {
          email: mockUser.email,
          password: `${mockUser.password}45678`, // Ensure password meets min length
          name: mockUser.name,
        },
      });
      userIdMap.set(mockUser.id, result.user.id);
      console.log(`  ✅ User created: ${mockUser.email} (${result.user.id})`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      // If user already exists, try to find their ID
      if (message.includes("already exists")) {
        const result = await db.execute(
          sql`SELECT id FROM "user" WHERE email = ${mockUser.email}`
        );
        const existing = result.rows[0] as { id: string } | undefined;
        if (existing) {
          userIdMap.set(mockUser.id, existing.id);
          console.log(`  ⚠️  User exists: ${mockUser.email} (${existing.id})`);
        }
      } else {
        console.error(`  ❌ Failed to create user ${mockUser.email}:`, message);
        throw err;
      }
    }
  }

  // 3. Insert spaces
  const spaceIdMap = new Map<string, string>(); // oldId -> newId

  for (const mockSpace of mockSpaces) {
    const ownerId = userIdMap.get(mockSpace.ownerId);
    if (!ownerId) {
      console.warn(`  ⚠️  Skipping space ${mockSpace.name}: owner not found`);
      continue;
    }

    const [inserted] = await db
      .insert(spaces)
      .values({
        name: mockSpace.name,
        ownerId,
        maxMembers: mockSpace.maxMembers,
        inviteCode: mockSpace.inviteCode,
        isDefault: mockSpace.isDefault,
        currency: "USD",
      })
      .returning();

    spaceIdMap.set(mockSpace.id, inserted.id);
    console.log(`  ✅ Space created: ${mockSpace.name} (${inserted.id})`);

    // 4. Insert space members
    for (const memberId of mockSpace.members) {
      const newMemberId = userIdMap.get(memberId);
      if (!newMemberId) continue;

      await db.insert(spaceMembers).values({
        spaceId: inserted.id,
        userId: newMemberId,
        role: memberId === mockSpace.ownerId ? "owner" : "member",
      });
    }
    console.log(`     Members: ${mockSpace.members.length}`);
  }

  // 5. Insert categories
  for (const mockCat of mockCategories) {
    const spaceId = spaceIdMap.get(mockCat.spaceId);
    if (!spaceId) continue;

    await db.insert(categories).values({
      spaceId,
      name: mockCat.name,
    });
  }
  console.log(`  ✅ Categories: ${mockCategories.length}`);

  // 6. Insert debt groups
  const debtGroupIdMap = new Map<string, string>(); // oldId -> newId
  for (const mockGroup of mockDebtGroups) {
    const spaceId = spaceIdMap.get(mockGroup.spaceId);
    if (!spaceId) continue;

    const groupCreatedBy = userIdMap.get(mockGroup.createdBy);
    const [inserted] = await db
      .insert(debtGroups)
      .values({
        spaceId,
        name: mockGroup.name,
        color: mockGroup.color,
        createdBy: groupCreatedBy,
      })
      .returning();
    debtGroupIdMap.set(mockGroup.id, inserted.id);
  }
  console.log(`  ✅ Debt groups: ${mockDebtGroups.length}`);

  // 7. Insert ledger items
  let ledgerCount = 0;
  for (const mockItem of mockLedgerItems) {
    const spaceId = spaceIdMap.get(mockItem.spaceId);
    if (!spaceId) continue;

    const createdBy = userIdMap.get(mockItem.createdBy);
    const updatedBy = userIdMap.get(mockItem.updatedBy);
    if (!createdBy || !updatedBy) continue;

    const newGroupId = mockItem.groupId
      ? debtGroupIdMap.get(mockItem.groupId)
      : null;

    await db.insert(ledgerItems).values({
      spaceId,
      amount: String(mockItem.amount),
      description: mockItem.description,
      category: mockItem.category,
      date: mockItem.date,
      createdBy,
      updatedBy,
      createdAt: new Date(mockItem.createdAt),
      updatedAt: new Date(mockItem.updatedAt),
      sortOrder: mockItem.sortOrder,
      type: mockItem.type,
      groupId: newGroupId,
      version: 1,
    });
    ledgerCount++;
  }
  console.log(`  ✅ Ledger items: ${ledgerCount}`);

  console.log("\n🎉 Seed complete!");
  console.log(`   Users: ${userIdMap.size}`);
  console.log(`   Spaces: ${spaceIdMap.size}`);
  console.log(`   Ledger items: ${ledgerCount}`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
