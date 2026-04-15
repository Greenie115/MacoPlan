-- supabase/migrations/20260415_recipe_api_schema_backfill.sql
-- Migration: Backfill recipe-api schema objects that may be missing in prod
--
-- The 20260325 recipe-api migration did not fully land in production (the
-- user_recipe_favorites rename didn't happen — see 20260415_fix_popular_recipes_rpc).
-- This migration idempotently creates every other object that migration was
-- supposed to create, including:
--   - recipe_images, recipe_api_cache, recipe_api_search_cache tables + RLS
--   - meal_plan_meals.recipe_api_id column
--   - drops legacy fatsecret_* cache tables if still present
--
-- Safe to run whether or not 20260325 was partially applied.

-- ============================================================================
-- Step 1: recipe_images (Unsplash URL cache)
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipe_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_api_id TEXT NOT NULL UNIQUE,
  unsplash_url TEXT NOT NULL,
  unsplash_small_url TEXT,
  photographer_name TEXT NOT NULL,
  photographer_url TEXT NOT NULL,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE recipe_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read recipe images" ON recipe_images;
DROP POLICY IF EXISTS "Authenticated users can insert recipe images" ON recipe_images;
DROP POLICY IF EXISTS "Authenticated users can update recipe images" ON recipe_images;

CREATE POLICY "Anyone can read recipe images"
  ON recipe_images FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert recipe images"
  ON recipe_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update recipe images"
  ON recipe_images FOR UPDATE USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_recipe_images_recipe_api_id
  ON recipe_images (recipe_api_id);

-- ============================================================================
-- Step 2: recipe_api_cache
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipe_api_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_api_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  cuisine TEXT,
  difficulty TEXT,
  tags TEXT[],
  nutrition JSONB,
  ingredients JSONB,
  instructions JSONB,
  meta JSONB,
  cache_expires_at TIMESTAMPTZ NOT NULL,
  fetch_count INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE recipe_api_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read recipe cache" ON recipe_api_cache;
DROP POLICY IF EXISTS "Authenticated users can manage recipe cache" ON recipe_api_cache;

CREATE POLICY "Anyone can read recipe cache"
  ON recipe_api_cache FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage recipe cache"
  ON recipe_api_cache FOR ALL USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_recipe_api_cache_recipe_api_id
  ON recipe_api_cache (recipe_api_id);
CREATE INDEX IF NOT EXISTS idx_recipe_api_cache_expires
  ON recipe_api_cache (cache_expires_at);

-- ============================================================================
-- Step 3: recipe_api_search_cache
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipe_api_search_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query_hash TEXT NOT NULL UNIQUE,
  search_type TEXT NOT NULL DEFAULT 'recipe',
  query_params JSONB,
  result_ids TEXT[] NOT NULL,
  total_results INTEGER NOT NULL,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  hit_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE recipe_api_search_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read search cache" ON recipe_api_search_cache;
DROP POLICY IF EXISTS "Authenticated users can manage search cache" ON recipe_api_search_cache;

CREATE POLICY "Anyone can read search cache"
  ON recipe_api_search_cache FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage search cache"
  ON recipe_api_search_cache FOR ALL USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_recipe_api_search_cache_hash
  ON recipe_api_search_cache (query_hash);
CREATE INDEX IF NOT EXISTS idx_recipe_api_search_cache_expires
  ON recipe_api_search_cache (expires_at);

-- ============================================================================
-- Step 4: meal_plan_meals.recipe_api_id column
-- This is the single most-likely cause of the /meal-plans "No plans" symptom:
-- getMealPlans embeds meal_plan_meals(recipe_api_id, ...); missing column
-- causes the entire query to fail.
-- ============================================================================

ALTER TABLE IF EXISTS meal_plan_meals
  ADD COLUMN IF NOT EXISTS recipe_api_id TEXT;

-- ============================================================================
-- Step 5: Drop legacy fatsecret cache tables if still present
-- ============================================================================

DROP TABLE IF EXISTS fatsecret_search_cache CASCADE;
DROP TABLE IF EXISTS fatsecret_foods CASCADE;
DROP TABLE IF EXISTS fatsecret_recipes CASCADE;
