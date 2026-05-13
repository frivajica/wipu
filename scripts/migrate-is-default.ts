import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("🔄 Running migrations...");

  await sql`ALTER TABLE "spaces" ADD COLUMN IF NOT EXISTS "is_default" boolean DEFAULT false`;
  console.log("  ✅ Added is_default column to spaces");

  await sql`UPDATE "spaces" SET "is_default" = true WHERE "name" = 'Me & Sarah'`;
  console.log("  ✅ Marked 'Me & Sarah' as default space");

  console.log("\n✅ Migration complete");
}

migrate().catch(console.error);