-- supabase/migrations/20260629_fix_source_id_unique.sql
-- Fix: the original recipe-library migration created a PARTIAL unique index on
-- recipes.source_id (WHERE source_id IS NOT NULL). Postgres cannot use a partial
-- index for `ON CONFLICT (source_id)` inference, so the seed script's upserts
-- failed with "no unique or exclusion constraint matching the ON CONFLICT
-- specification". Recreate it as a plain (non-partial) unique index.
--
-- Run in Supabase SQL Editor.

DROP INDEX IF EXISTS idx_recipes_source_id;
CREATE UNIQUE INDEX IF NOT EXISTS idx_recipes_source_id ON recipes(source_id);
