-- ============================================================================
-- FatSecret API Migration
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- Step 1: Create FatSecret Cache Tables
-- ============================================================================

-- FatSecret Foods Cache
CREATE TABLE IF NOT EXISTS fatsecret_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fatsecret_id TEXT UNIQUE NOT NULL,
  food_name TEXT NOT NULL,
  food_type TEXT NOT NULL CHECK (food_type IN ('Brand', 'Generic')),
  brand_name TEXT,
  food_url TEXT,
  servings JSONB,
  default_serving JSONB,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  cache_expires_at TIMESTAMPTZ NOT NULL,
  fetch_count INTEGER DEFAULT 1,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FatSecret Recipes Cache
CREATE TABLE IF NOT EXISTS fatsecret_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fatsecret_id TEXT UNIQUE NOT NULL,
  recipe_name TEXT NOT NULL,
  recipe_description TEXT,
  recipe_url TEXT,
  image_url TEXT,
  calories DECIMAL,
  protein_grams DECIMAL,
  carb_grams DECIMAL,
  fat_grams DECIMAL,
  fiber_grams DECIMAL,
  sugar_grams DECIMAL,
  sodium_mg DECIMAL,
  ingredients JSONB,
  directions JSONB,
  categories JSONB,
  recipe_types JSONB,
  number_of_servings INTEGER,
  prep_time_min INTEGER,
  cook_time_min INTEGER,
  rating DECIMAL,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  cache_expires_at TIMESTAMPTZ NOT NULL,
  fetch_count INTEGER DEFAULT 1,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FatSecret Search Cache
CREATE TABLE IF NOT EXISTS fatsecret_search_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash TEXT UNIQUE NOT NULL,
  search_type TEXT NOT NULL CHECK (search_type IN ('food', 'recipe')),
  query_params JSONB NOT NULL,
  result_ids TEXT[],
  total_results INTEGER,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Step 2: Create Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_fatsecret_foods_name ON fatsecret_foods(food_name);
CREATE INDEX IF NOT EXISTS idx_fatsecret_foods_type ON fatsecret_foods(food_type);
CREATE INDEX IF NOT EXISTS idx_fatsecret_foods_expires ON fatsecret_foods(cache_expires_at);
CREATE INDEX IF NOT EXISTS idx_fatsecret_foods_accessed ON fatsecret_foods(last_accessed_at);

CREATE INDEX IF NOT EXISTS idx_fatsecret_recipes_name ON fatsecret_recipes(recipe_name);
CREATE INDEX IF NOT EXISTS idx_fatsecret_recipes_calories ON fatsecret_recipes(calories);
CREATE INDEX IF NOT EXISTS idx_fatsecret_recipes_protein ON fatsecret_recipes(protein_grams);
CREATE INDEX IF NOT EXISTS idx_fatsecret_recipes_expires ON fatsecret_recipes(cache_expires_at);
CREATE INDEX IF NOT EXISTS idx_fatsecret_recipes_accessed ON fatsecret_recipes(last_accessed_at);

CREATE INDEX IF NOT EXISTS idx_fatsecret_search_hash ON fatsecret_search_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_fatsecret_search_type ON fatsecret_search_cache(search_type);
CREATE INDEX IF NOT EXISTS idx_fatsecret_search_expires ON fatsecret_search_cache(expires_at);

-- ============================================================================
-- Step 3: Enable Row Level Security
-- ============================================================================

ALTER TABLE fatsecret_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE fatsecret_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fatsecret_search_cache ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Step 4: Create RLS Policies
-- Cache tables are readable by everyone (public cached data)
-- Only authenticated users/service can write
-- ============================================================================

-- FatSecret Foods Policies
CREATE POLICY "Anyone can read fatsecret_foods"
  ON fatsecret_foods FOR SELECT
  USING (true);

CREATE POLICY "Service can insert fatsecret_foods"
  ON fatsecret_foods FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service can update fatsecret_foods"
  ON fatsecret_foods FOR UPDATE
  USING (true);

-- FatSecret Recipes Policies
CREATE POLICY "Anyone can read fatsecret_recipes"
  ON fatsecret_recipes FOR SELECT
  USING (true);

CREATE POLICY "Service can insert fatsecret_recipes"
  ON fatsecret_recipes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service can update fatsecret_recipes"
  ON fatsecret_recipes FOR UPDATE
  USING (true);

-- FatSecret Search Cache Policies
CREATE POLICY "Anyone can read fatsecret_search_cache"
  ON fatsecret_search_cache FOR SELECT
  USING (true);

CREATE POLICY "Service can insert fatsecret_search_cache"
  ON fatsecret_search_cache FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service can update fatsecret_search_cache"
  ON fatsecret_search_cache FOR UPDATE
  USING (true);

-- ============================================================================
-- Step 5: Update meal_plan_meals to support FatSecret
-- ============================================================================

-- Add recipe_source column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meal_plan_meals' AND column_name = 'recipe_source'
  ) THEN
    ALTER TABLE meal_plan_meals
    ADD COLUMN recipe_source TEXT DEFAULT 'fatsecret'
    CHECK (recipe_source IN ('spoonacular', 'fatsecret', 'local'));
  END IF;
END $$;

-- Add fatsecret_id column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meal_plan_meals' AND column_name = 'fatsecret_id'
  ) THEN
    ALTER TABLE meal_plan_meals ADD COLUMN fatsecret_id TEXT;
  END IF;
END $$;

-- ============================================================================
-- Step 6: Drop Spoonacular Tables (Clean slate)
-- ============================================================================

-- Drop Spoonacular tables to remove old cached data
DROP TABLE IF EXISTS spoonacular_search_cache CASCADE;
DROP TABLE IF EXISTS spoonacular_recipes CASCADE;
DROP TABLE IF EXISTS spoonacular_meal_plans CASCADE;

-- ============================================================================
-- Step 7: Create Updated Timestamp Trigger
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for fatsecret_foods
DROP TRIGGER IF EXISTS update_fatsecret_foods_updated_at ON fatsecret_foods;
CREATE TRIGGER update_fatsecret_foods_updated_at
  BEFORE UPDATE ON fatsecret_foods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for fatsecret_recipes
DROP TRIGGER IF EXISTS update_fatsecret_recipes_updated_at ON fatsecret_recipes;
CREATE TRIGGER update_fatsecret_recipes_updated_at
  BEFORE UPDATE ON fatsecret_recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Step 8: Create Cache Cleanup Function
-- ============================================================================

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_fatsecret_cache()
RETURNS void AS $$
BEGIN
  -- Delete expired food cache entries
  DELETE FROM fatsecret_foods
  WHERE cache_expires_at < NOW();

  -- Delete expired recipe cache entries
  DELETE FROM fatsecret_recipes
  WHERE cache_expires_at < NOW();

  -- Delete expired search cache entries
  DELETE FROM fatsecret_search_cache
  WHERE expires_at < NOW();

  RAISE NOTICE 'FatSecret cache cleanup completed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Done!
-- ============================================================================

-- Verify tables were created
SELECT 'Migration completed successfully!' as status;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'fatsecret%';
