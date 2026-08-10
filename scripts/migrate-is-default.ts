import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function migrate() {
  try {
    console.info("🔄 Running migrations...");

    await sql`ALTER TABLE "spaces" ADD COLUMN IF NOT EXISTS "is_default" boolean DEFAULT false`;
    console.info("  ✅ Added is_default column to spaces");

    await sql`UPDATE "spaces" SET "is_default" = true WHERE "name" = 'Me & Sarah'`;
    console.info("  ✅ Marked 'Me & Sarah' as default space");

    console.info("\n✅ Migration complete");
  } finally {
    await sql.end();
  }
}

migrate().catch(console.error);