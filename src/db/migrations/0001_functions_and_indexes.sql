-- Drizzle migration file for partial indexes and SQL functions
-- Run this after drizzle-kit push

-- Partial index for normal items (used in period visibility queries)
CREATE INDEX IF NOT EXISTS idx_ledger_space_normal
ON ledger_items(space_id, date DESC)
WHERE type = 'default';

-- Recurring items indexes
CREATE INDEX IF NOT EXISTS idx_recurring_next
ON recurring_items(next_occurrence, is_active);

CREATE INDEX IF NOT EXISTS idx_recurring_space
ON recurring_items(space_id);

CREATE INDEX IF NOT EXISTS idx_recurring_instances_skipped
ON recurring_instances(recurring_item_id, skipped)
WHERE skipped = false;

-- Trigram extension for autocomplete
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_ledger_description_trgm
ON ledger_items USING gin (description gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_ledger_category_trgm
ON ledger_items USING gin (category gin_trgm_ops);

-- ═══════════════════════════════════════
-- BALANCE FUNCTIONS
-- ═══════════════════════════════════════

CREATE OR REPLACE FUNCTION get_space_balances(p_space_id UUID)
RETURNS TABLE(
  total_balance NUMERIC,
  total_debt NUMERIC,
  real_balance NUMERIC
) AS $$
  WITH all_items AS (
    SELECT amount, type FROM ledger_items WHERE space_id = p_space_id
    UNION ALL
    SELECT r.amount, r.type
    FROM recurring_instances ri
    JOIN recurring_items r ON ri.recurring_item_id = r.id
    WHERE r.space_id = p_space_id AND NOT ri.skipped
  )
  SELECT
    COALESCE(SUM(amount), 0) AS total_balance,
    COALESCE(SUM(CASE WHEN type = 'debt' THEN amount ELSE 0 END), 0) AS total_debt,
    COALESCE(SUM(CASE WHEN type = 'default' THEN amount ELSE 0 END), 0) AS real_balance
  FROM all_items;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_debt_group_balance(p_space_id UUID, p_group_id UUID)
RETURNS NUMERIC AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM ledger_items
  WHERE space_id = p_space_id
    AND type = 'debt'
    AND group_id = p_group_id;
$$ LANGUAGE sql STABLE;

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
      SUM(period_balance) OVER (ORDER BY period_start ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_balance
    FROM period_sums
  )
  SELECT period_key, display_label, period_start, period_end, period_balance, period_debt, running_balance, item_count
  FROM with_running
  ORDER BY period_start DESC;
$$ LANGUAGE sql STABLE;

-- ═══════════════════════════════════════
-- AUDIT TRIGGER
-- ═══════════════════════════════════════

CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER AS $$
DECLARE
  v_significance TEXT := 'normal';
  v_user_id TEXT;
  v_record_id UUID;
BEGIN
  -- Safely extract user_id: check if updated_by/created_by exists on this table
  BEGIN
    v_user_id := COALESCE(
      CASE WHEN TG_OP != 'DELETE' THEN NEW.updated_by END,
      CASE WHEN TG_OP != 'INSERT' THEN OLD.updated_by END
    );
  EXCEPTION WHEN undefined_column THEN
    BEGIN
      v_user_id := COALESCE(
        CASE WHEN TG_OP != 'DELETE' THEN NEW.created_by END,
        CASE WHEN TG_OP != 'INSERT' THEN OLD.created_by END
      );
    EXCEPTION WHEN undefined_column THEN
      v_user_id := NULL;
    END;
  END;

  -- Safely extract record id
  BEGIN
    v_record_id := COALESCE(
      CASE WHEN TG_OP != 'DELETE' THEN NEW.id END,
      CASE WHEN TG_OP != 'INSERT' THEN OLD.id END
    );
  EXCEPTION WHEN undefined_column THEN
    v_record_id := NULL;
  END;

  IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'ledger_items' THEN
    IF OLD.amount = NEW.amount
       AND OLD.description = NEW.description
       AND OLD.category = NEW.category
       AND OLD.date = NEW.date
       AND OLD.type = NEW.type
       AND OLD.group_id IS NOT DISTINCT FROM NEW.group_id THEN
      v_significance := 'internal';
    END IF;
  END IF;

  INSERT INTO audit_log (
    table_name, record_id, action,
    old_values, new_values,
    performed_by, significance
  ) VALUES (
    TG_TABLE_NAME,
    v_record_id,
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) END,
    v_user_id,
    v_significance
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Attach triggers
DROP TRIGGER IF EXISTS audit_ledger_items ON ledger_items;
CREATE TRIGGER audit_ledger_items
  AFTER INSERT OR UPDATE OR DELETE ON ledger_items
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

DROP TRIGGER IF EXISTS audit_debt_groups ON debt_groups;
CREATE TRIGGER audit_debt_groups
  AFTER INSERT OR UPDATE OR DELETE ON debt_groups
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

DROP TRIGGER IF EXISTS audit_spaces ON spaces;
CREATE TRIGGER audit_spaces
  AFTER INSERT OR UPDATE OR DELETE ON spaces
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();