-- supabase/migrations/20260629_recipe_library_columns.sql
-- Creates the recipes table and related tables for the self-hosted recipe library.
-- Run in Supabase SQL Editor.

-- ============================================================================
-- Step 1: Create recipes table (if it doesn't exist)
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  calories NUMERIC NOT NULL DEFAULT 0,
  protein_grams NUMERIC NOT NULL DEFAULT 0,
  carb_grams NUMERIC NOT NULL DEFAULT 0,
  fat_grams NUMERIC NOT NULL DEFAULT 0,
  fiber_grams NUMERIC,
  sugar_grams NUMERIC,
  sodium_mg NUMERIC,
  cholesterol_mg NUMERIC,
  saturated_fat_grams NUMERIC,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  total_time_minutes INTEGER,
  servings INTEGER NOT NULL DEFAULT 1,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  rating NUMERIC NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  cuisine TEXT,
  dietary_flags TEXT[] DEFAULT '{}',
  batch_prep_score INTEGER,
  storage_fridge_days INTEGER,
  storage_freezer_days INTEGER,
  reheating_notes TEXT,
  source TEXT DEFAULT 'library',
  source_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Step 2: Create recipe_tags table
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipe_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE recipe_tags ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Step 3: Create recipe_ingredients table
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient TEXT NOT NULL,
  amount TEXT NOT NULL DEFAULT '',
  unit TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Step 4: Create recipe_instructions table
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipe_instructions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE recipe_instructions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Step 5: Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON recipes(cuisine);
CREATE INDEX IF NOT EXISTS idx_recipes_batch_prep_score ON recipes(batch_prep_score);
CREATE INDEX IF NOT EXISTS idx_recipes_macros ON recipes(calories, protein_grams);
CREATE INDEX IF NOT EXISTS idx_recipes_dietary_flags ON recipes USING GIN(dietary_flags);
-- Non-partial unique index so `ON CONFLICT (source_id)` upserts can infer it.
-- (A partial index with a WHERE clause is not usable for ON CONFLICT inference.)
-- NULL source_id values remain allowed and are treated as distinct by Postgres.
CREATE UNIQUE INDEX IF NOT EXISTS idx_recipes_source_id ON recipes(source_id);
CREATE INDEX IF NOT EXISTS idx_recipe_tags_recipe_id ON recipe_tags(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_instructions_recipe_id ON recipe_instructions(recipe_id);

-- ============================================================================
-- Step 6: RLS policies — public read for authenticated users
-- ============================================================================

CREATE POLICY "Authenticated users can read all recipes"
  ON recipes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read recipe tags"
  ON recipe_tags FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read recipe ingredients"
  ON recipe_ingredients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read recipe instructions"
  ON recipe_instructions FOR SELECT TO authenticated USING (true);

-- Service role can insert/update/delete (used by seed script)
CREATE POLICY "Service role can manage recipes"
  ON recipes FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage recipe tags"
  ON recipe_tags FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage recipe ingredients"
  ON recipe_ingredients FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage recipe instructions"
  ON recipe_instructions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- Step 7: Auto-update updated_at trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS recipes_updated_at ON recipes;
CREATE TRIGGER recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
