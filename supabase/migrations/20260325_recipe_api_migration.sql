-- supabase/migrations/20260325_recipe_api_migration.sql
-- Migration: FatSecret → Recipe-API.com + Unsplash
--
-- This migration:
-- 1. Creates recipe_images table for Unsplash URL caching
-- 2. Creates recipe_api_cache table for Recipe-API.com response caching
-- 3. Creates recipe_api_search_cache table for search result caching
-- 4. Renames user_fatsecret_favorites → user_recipe_favorites
-- 5. Adds recipe_api_id column to meal_plan_meals
-- 6. Drops old FatSecret cache tables
--
-- IMPORTANT: Run this in Supabase SQL Editor. No local CLI.

-- ============================================================================
-- Step 1: Create recipe_images table (Unsplash URL cache)
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

-- Public data, but enable RLS for consistency
ALTER TABLE recipe_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read recipe images"
  ON recipe_images FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert recipe images"
  ON recipe_images FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update recipe images"
  ON recipe_images FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE INDEX idx_recipe_images_recipe_api_id ON recipe_images (recipe_api_id);

-- ============================================================================
-- Step 2: Create recipe_api_cache table
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

CREATE POLICY "Anyone can read recipe cache"
  ON recipe_api_cache FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage recipe cache"
  ON recipe_api_cache FOR ALL
  USING (auth.role() = 'authenticated');

CREATE INDEX idx_recipe_api_cache_recipe_api_id ON recipe_api_cache (recipe_api_id);
CREATE INDEX idx_recipe_api_cache_expires ON recipe_api_cache (cache_expires_at);

-- ============================================================================
-- Step 3: Create recipe_api_search_cache table
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

CREATE POLICY "Anyone can read search cache"
  ON recipe_api_search_cache FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage search cache"
  ON recipe_api_search_cache FOR ALL
  USING (auth.role() = 'authenticated');

CREATE INDEX idx_recipe_api_search_cache_hash ON recipe_api_search_cache (query_hash);
CREATE INDEX idx_recipe_api_search_cache_expires ON recipe_api_search_cache (expires_at);

-- ============================================================================
-- Step 4: Rename user_fatsecret_favorites → user_recipe_favorites
-- ============================================================================

ALTER TABLE IF EXISTS user_fatsecret_favorites
  RENAME TO user_recipe_favorites;

ALTER TABLE IF EXISTS user_recipe_favorites
  RENAME COLUMN fatsecret_recipe_id TO recipe_id;

-- Truncate old data (FatSecret numeric IDs are not valid Recipe-API.com UUIDs)
TRUNCATE TABLE user_recipe_favorites;

-- ============================================================================
-- Step 5: Add recipe_api_id to meal_plan_meals
-- ============================================================================

ALTER TABLE IF EXISTS meal_plan_meals
  ADD COLUMN IF NOT EXISTS recipe_api_id TEXT;

-- ============================================================================
-- Step 6: Drop old FatSecret cache tables
-- ============================================================================

DROP TABLE IF EXISTS fatsecret_search_cache CASCADE;
DROP TABLE IF EXISTS fatsecret_foods CASCADE;
DROP TABLE IF EXISTS fatsecret_recipes CASCADE;

-- ============================================================================
-- Step 7: Update RPC functions to use new table names
-- ============================================================================

CREATE OR REPLACE FUNCTION get_most_favorited_recipes(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  recipe_id TEXT,
  favorite_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT recipe_id, COUNT(*) as favorite_count
  FROM user_recipe_favorites
  GROUP BY recipe_id
  ORDER BY favorite_count DESC
  LIMIT limit_count;
$$;

CREATE OR REPLACE FUNCTION get_most_favorited_count(p_recipe_id TEXT)
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)
  FROM user_recipe_favorites
  WHERE recipe_id = p_recipe_id;
$$;
