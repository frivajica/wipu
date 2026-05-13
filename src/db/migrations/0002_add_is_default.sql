-- Add is_default column to spaces table (already in schema, this is a live migration)
ALTER TABLE "spaces" ADD COLUMN IF NOT EXISTS "is_default" boolean DEFAULT false;