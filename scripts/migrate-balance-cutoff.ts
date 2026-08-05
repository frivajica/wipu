import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("🔄 Running balance cutoff migration...");

  await sql`
    CREATE OR REPLACE FUNCTION get_space_balances(p_space_id UUID, p_to DATE DEFAULT NULL)
    RETURNS TABLE(
      total_balance NUMERIC,
      total_debt NUMERIC,
      real_balance NUMERIC
    ) AS $$
      WITH all_items AS (
        SELECT amount, type FROM ledger_items WHERE space_id = p_space_id
          AND (p_to IS NULL OR date <= p_to)
        UNION ALL
        SELECT r.amount, r.type
        FROM recurring_instances ri
        JOIN recurring_items r ON ri.recurring_item_id = r.id
        WHERE r.space_id = p_space_id AND NOT ri.skipped
          AND (p_to IS NULL OR ri.occurrence_date <= p_to)
      )
      SELECT
        COALESCE(SUM(amount), 0) AS total_balance,
        COALESCE(SUM(CASE WHEN type = 'debt' THEN amount ELSE 0 END), 0) AS total_debt,
        COALESCE(SUM(CASE WHEN type = 'default' THEN amount ELSE 0 END), 0) AS real_balance
      FROM all_items;
    $$ LANGUAGE sql STABLE;
  `;
  console.log("  ✅ get_space_balances updated with p_to parameter");

  console.log("\n✅ Migration complete");
}

migrate().catch(console.error);