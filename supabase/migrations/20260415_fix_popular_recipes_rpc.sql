-- supabase/migrations/20260415_fix_popular_recipes_rpc.sql
-- Migration: Fix get_most_favorited_recipes and get_most_favorited_count RPC signatures
--
-- The recipe-api migration created these functions with the wrong signatures for
-- the code in app/recipes/actions.ts:getMostFavoritedRecipes, which calls:
--   rpc('get_most_favorited_recipes', { p_limit, p_offset })   -- expects full metadata
--   rpc('get_most_favorited_count')                            -- expects total distinct recipe count
--
-- This migration drops both old functions and recreates them with the correct signatures
-- and return shapes.

-- ============================================================================
-- Drop old signatures (safe if they don't exist)
-- ============================================================================

DROP FUNCTION IF EXISTS get_most_favorited_recipes(INTEGER);
DROP FUNCTION IF EXISTS get_most_favorited_recipes(INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_most_favorited_count(TEXT);
DROP FUNCTION IF EXISTS get_most_favorited_count();

-- ============================================================================
-- get_most_favorited_recipes: returns aggregated popular recipes with metadata
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
AS $$
  SELECT
    urf.recipe_id,
    (ARRAY_AGG(urf.recipe_title ORDER BY urf.created_at DESC))[1] AS recipe_title,
    (ARRAY_AGG(urf.recipe_description ORDER BY urf.created_at DESC))[1] AS recipe_description,
    (ARRAY_AGG(urf.recipe_image_url ORDER BY urf.created_at DESC))[1] AS recipe_image_url,
    (ARRAY_AGG(urf.calories ORDER BY urf.created_at DESC))[1] AS calories,
    (ARRAY_AGG(urf.protein_grams ORDER BY urf.created_at DESC))[1] AS protein_grams,
    (ARRAY_AGG(urf.carb_grams ORDER BY urf.created_at DESC))[1] AS carb_grams,
    (ARRAY_AGG(urf.fat_grams ORDER BY urf.created_at DESC))[1] AS fat_grams,
    COUNT(*)::BIGINT AS favorite_count
  FROM user_recipe_favorites urf
  GROUP BY urf.recipe_id
  ORDER BY favorite_count DESC, recipe_title ASC
  LIMIT p_limit
  OFFSET p_offset;
$$;

GRANT EXECUTE ON FUNCTION get_most_favorited_recipes(INTEGER, INTEGER) TO authenticated, anon;

-- ============================================================================
-- get_most_favorited_count: returns count of distinct favorited recipes
-- ============================================================================

CREATE OR REPLACE FUNCTION get_most_favorited_count()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(DISTINCT recipe_id)::BIGINT
  FROM user_recipe_favorites;
$$;

GRANT EXECUTE ON FUNCTION get_most_favorited_count() TO authenticated, anon;
