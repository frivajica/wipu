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