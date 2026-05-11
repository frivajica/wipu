import "dotenv/config";
import { db } from "@/db";
import { sql } from "drizzle-orm";

async function applyMigration() {
  const statements = `
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER AS $$
DECLARE
  v_significance TEXT := 'normal';
  v_user_id TEXT;
  v_record_id UUID;
BEGIN
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
  `.trim();

  await db.execute(sql.raw(statements));
  console.log("✅ Trigger function updated");
}

applyMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
