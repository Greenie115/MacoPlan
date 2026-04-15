-- supabase/migrations/20260415_fix_popular_recipes_rpc.sql
-- Migration: Ensure user_recipe_favorites table exists + fix popular recipes RPCs
--
-- Production DB is missing user_recipe_favorites (rename from 20260325 never ran,
-- or the original user_fatsecret_favorites was never created). This migration is
-- idempotent and safe to run regardless of current DB state.
--
-- Steps:
--   1. Rename user_fatsecret_favorites → user_recipe_favorites (if still old name)
--   2. Rename fatsecret_recipe_id column → recipe_id (if still old name)
--   3. Create user_recipe_favorites with full schema if it still doesn't exist
--   4. Enable RLS + policies + indexes
--   5. Drop old RPC signatures
--   6. Recreate RPCs with signatures matching app/recipes/actions.ts

-- ============================================================================
-- Step 1: Rename legacy tables/columns if they still exist
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_fatsecret_favorites') THEN
    ALTER TABLE user_fatsecret_favorites RENAME TO user_recipe_favorites;
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_recipe_favorites' AND column_name = 'fatsecret_recipe_id'
  ) THEN
    ALTER TABLE user_recipe_favorites RENAME COLUMN fatsecret_recipe_id TO recipe_id;
  END IF;
END$$;

-- ============================================================================
-- Step 2: Create user_recipe_favorites if still missing
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_recipe_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL,
  recipe_title TEXT NOT NULL,
  recipe_description TEXT,
  recipe_image_url TEXT,
  calories DECIMAL,
  protein_grams DECIMAL,
  carb_grams DECIMAL,
  fat_grams DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Defensive: add any missing columns in case an older partial schema exists
ALTER TABLE user_recipe_favorites ADD COLUMN IF NOT EXISTS recipe_title TEXT;
ALTER TABLE user_recipe_favorites ADD COLUMN IF NOT EXISTS recipe_description TEXT;
ALTER TABLE user_recipe_favorites ADD COLUMN IF NOT EXISTS recipe_image_url TEXT;
ALTER TABLE user_recipe_favorites ADD COLUMN IF NOT EXISTS calories DECIMAL;
ALTER TABLE user_recipe_favorites ADD COLUMN IF NOT EXISTS protein_grams DECIMAL;
ALTER TABLE user_recipe_favorites ADD COLUMN IF NOT EXISTS carb_grams DECIMAL;
ALTER TABLE user_recipe_favorites ADD COLUMN IF NOT EXISTS fat_grams DECIMAL;
ALTER TABLE user_recipe_favorites ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================================
-- Step 3: Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_recipe_favorites_user_id
  ON user_recipe_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recipe_favorites_recipe_id
  ON user_recipe_favorites(recipe_id);
CREATE INDEX IF NOT EXISTS idx_user_recipe_favorites_created
  ON user_recipe_favorites(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_recipe_user
  ON user_recipe_favorites(recipe_id, user_id);

-- ============================================================================
-- Step 4: Row Level Security
-- ============================================================================

ALTER TABLE user_recipe_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own fatsecret favorites" ON user_recipe_favorites;
DROP POLICY IF EXISTS "Users can add own fatsecret favorites" ON user_recipe_favorites;
DROP POLICY IF EXISTS "Users can delete own fatsecret favorites" ON user_recipe_favorites;
DROP POLICY IF EXISTS "Users can view own recipe favorites" ON user_recipe_favorites;
DROP POLICY IF EXISTS "Users can add own recipe favorites" ON user_recipe_favorites;
DROP POLICY IF EXISTS "Users can delete own recipe favorites" ON user_recipe_favorites;

CREATE POLICY "Users can view own recipe favorites"
  ON user_recipe_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add own recipe favorites"
  ON user_recipe_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipe favorites"
  ON user_recipe_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Step 5: Drop old RPC signatures
-- ============================================================================

DROP FUNCTION IF EXISTS get_most_favorited_recipes(INTEGER);
DROP FUNCTION IF EXISTS get_most_favorited_recipes(INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_most_favorited_count(TEXT);
DROP FUNCTION IF EXISTS get_most_favorited_count();

-- ============================================================================
-- Step 6: Recreate RPCs matching app/recipes/actions.ts expectations
-- ============================================================================

CREATE OR REPLACE FUNCTION get_most_favorited_recipes(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  recipe_id TEXT,
  recipe_title TEXT,
  recipe_description TEXT,
  recipe_image_url TEXT,
  calories NUMERIC,
  protein_grams NUMERIC,
  carb_grams NUMERIC,
  fat_grams NUMERIC,
  favorite_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    urf.recipe_id,
    (ARRAY_AGG(urf.recipe_title ORDER BY urf.created_at DESC))[1] AS recipe_title,
    (ARRAY_AGG(urf.recipe_description ORDER BY urf.created_at DESC))[1] AS recipe_description,
    (ARRAY_AGG(urf.recipe_image_url ORDER BY urf.created_at DESC))[1] AS recipe_image_url,
    (ARRAY_AGG(urf.calories ORDER BY urf.created_at DESC))[1]::NUMERIC AS calories,
    (ARRAY_AGG(urf.protein_grams ORDER BY urf.created_at DESC))[1]::NUMERIC AS protein_grams,
    (ARRAY_AGG(urf.carb_grams ORDER BY urf.created_at DESC))[1]::NUMERIC AS carb_grams,
    (ARRAY_AGG(urf.fat_grams ORDER BY urf.created_at DESC))[1]::NUMERIC AS fat_grams,
    COUNT(*)::BIGINT AS favorite_count
  FROM user_recipe_favorites urf
  GROUP BY urf.recipe_id
  ORDER BY favorite_count DESC, recipe_title ASC
  LIMIT p_limit
  OFFSET p_offset;
$$;

GRANT EXECUTE ON FUNCTION get_most_favorited_recipes(INTEGER, INTEGER) TO authenticated, anon;

CREATE OR REPLACE FUNCTION get_most_favorited_count()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(DISTINCT recipe_id)::BIGINT
  FROM user_recipe_favorites;
$$;

GRANT EXECUTE ON FUNCTION get_most_favorited_count() TO authenticated, anon;
