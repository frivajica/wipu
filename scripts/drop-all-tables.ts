import "dotenv/config";
import { db } from "@/db";
import { sql } from "drizzle-orm";

const tables = [
  "audit_log",
  "recurring_instances",
  "recurring_items",
  "ledger_items",
  "debt_groups",
  "categories",
  "space_members",
  "spaces",
  "currencies",
  "verification",
  "account",
  '"session"',
  '"user"',
];

async function dropAll() {
  console.log("💥 Dropping all existing tables...");

  for (const table of tables) {
    await db.execute(sql.raw(`DROP TABLE IF EXISTS ${table} CASCADE;`));
    console.log(`  ✅ Dropped ${table}`);
  }

  console.log("✅ All tables dropped. Ready for fresh push.");
}

dropAll().catch((err) => {
  console.error("Drop failed:", err);
  process.exit(1);
});
