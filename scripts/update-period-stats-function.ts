import "dotenv/config";
import { db } from "@/db";
import { sql } from "drizzle-orm";

async function applyMigration() {
  await db.execute(sql.raw(`DROP FUNCTION IF EXISTS get_period_stats(uuid, date, date, text)`));
  console.log("✅ Dropped existing get_period_stats");

  const statements = `
CREATE OR REPLACE FUNCTION get_period_stats(
  p_space_id UUID,
  p_from DATE,
  p_to DATE,
  p_period_type TEXT
)
RETURNS TABLE(
  period_key TEXT,
  display_label TEXT,
  period_start DATE,
  period_end DATE,
  period_balance NUMERIC,
  period_debt NUMERIC,
  running_balance NUMERIC,
  running_debt NUMERIC,
  item_count INT
) AS $$
  WITH
  all_items AS (
    SELECT date, amount, type FROM ledger_items
    WHERE space_id = p_space_id AND date >= p_from AND date <= p_to
    UNION ALL
    SELECT ri.occurrence_date, r.amount, r.type
    FROM recurring_instances ri
    JOIN recurring_items r ON ri.recurring_item_id = r.id
    WHERE r.space_id = p_space_id AND NOT ri.skipped
      AND ri.occurrence_date >= p_from AND ri.occurrence_date <= p_to
  ),
  with_period AS (
    SELECT
      date, amount, type,
      CASE p_period_type
        WHEN 'weekly' THEN to_char(date, 'IYYY-"W"IW')
        WHEN 'bi-weekly' THEN to_char(date, 'IYYY-"W"IW')
        ELSE to_char(date, 'YYYY-MM')
      END AS period_key,
      CASE p_period_type
        WHEN 'weekly' THEN (
          to_char(date, 'FMMonth YYYY') || ' - Week ' || to_char(date, 'WW') ||
          ' (' || to_char(date_trunc('week', date), 'FMMM d') ||
          ' to ' || to_char(date_trunc('week', date) + INTERVAL '6 days', 'FMMM d') || ')'
        )
        WHEN 'bi-weekly' THEN (
          to_char(date, 'FMMonth YYYY') || ' - Bi-Week ' ||
          CASE WHEN ceil(to_char(date, 'WW')::INT / 2.0) < 10 THEN '0' ELSE '' END ||
          ceil(to_char(date, 'WW')::NUMERIC / 2.0)::TEXT ||
          ' (' || to_char(date_trunc('week', date) - INTERVAL '7 days', 'FMMM d') ||
          ' to ' || to_char(date_trunc('week', date) + INTERVAL '6 days', 'FMMM d') || ')'
        )
        ELSE to_char(date, 'FMMonth YYYY')
      END AS display_label,
      CASE p_period_type
        WHEN 'weekly' THEN date_trunc('week', date)::DATE
        WHEN 'bi-weekly' THEN (date_trunc('week', date) - INTERVAL '7 days')::DATE
        ELSE date_trunc('month', date)::DATE
      END AS period_start,
      CASE p_period_type
        WHEN 'weekly' THEN (date_trunc('week', date) + INTERVAL '6 days')::DATE
        WHEN 'bi-weekly' THEN (date_trunc('week', date) + INTERVAL '6 days')::DATE
        ELSE (date_trunc('month', date) + INTERVAL '1 month - 1 day')::DATE
      END AS period_end
    FROM all_items
  ),
  period_sums AS (
    SELECT
      period_key, display_label, period_start, period_end,
      COALESCE(SUM(CASE WHEN type = 'default' THEN amount ELSE 0 END), 0)
        + COALESCE(SUM(CASE WHEN type = 'debt' THEN amount ELSE 0 END), 0) AS period_balance,
      COALESCE(SUM(CASE WHEN type = 'debt' THEN amount ELSE 0 END), 0) AS period_debt,
      COUNT(*) AS item_count
    FROM with_period
    GROUP BY period_key, display_label, period_start, period_end
  ),
  with_running AS (
    SELECT
      period_key, display_label, period_start, period_end,
      period_balance, period_debt, item_count,
      SUM(period_balance) OVER (ORDER BY period_start ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_balance,
      SUM(period_debt) OVER (ORDER BY period_start ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_debt
    FROM period_sums
  )
  SELECT period_key, display_label, period_start, period_end, period_balance, period_debt, running_balance, running_debt, item_count
  FROM with_running
  ORDER BY period_start DESC;
$$ LANGUAGE sql STABLE;
  `.trim();

  await db.execute(sql.raw(statements));
  console.log("✅ get_period_stats recreated with running_debt");
}

applyMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});