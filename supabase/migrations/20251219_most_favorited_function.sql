-- ============================================================
-- Migration: Add RPC functions for "Most Favorited" recipes feature
-- Run each section separately in Supabase SQL Editor if needed
-- ============================================================

-- SECTION 1: Main function to get most favorited recipes
-- ============================================================
CREATE OR REPLACE FUNCTION get_most_favorited_recipes(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  fatsecret_recipe_id TEXT,
  recipe_title TEXT,
  recipe_description TEXT,
  recipe_image_url TEXT,
  calories NUMERIC,
  protein_grams NUMERIC,
  carb_grams NUMERIC,
  fat_grams NUMERIC,
  favorite_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    uff.fatsecret_recipe_id,
    (ARRAY_AGG(uff.recipe_title ORDER BY uff.created_at DESC))[1] as recipe_title,
    (ARRAY_AGG(uff.recipe_description ORDER BY uff.created_at DESC))[1] as recipe_description,
    (ARRAY_AGG(uff.recipe_image_url ORDER BY uff.created_at DESC))[1] as recipe_image_url,
    (ARRAY_AGG(uff.calories ORDER BY uff.created_at DESC))[1] as calories,
    (ARRAY_AGG(uff.protein_grams ORDER BY uff.created_at DESC))[1] as protein_grams,
    (ARRAY_AGG(uff.carb_grams ORDER BY uff.created_at DESC))[1] as carb_grams,
    (ARRAY_AGG(uff.fat_grams ORDER BY uff.created_at DESC))[1] as fat_grams,
    COUNT(DISTINCT uff.user_id) as favorite_count
  FROM user_fatsecret_favorites uff
  GROUP BY uff.fatsecret_recipe_id
  HAVING COUNT(DISTINCT uff.user_id) >= 1
  ORDER BY COUNT(DISTINCT uff.user_id) DESC, MAX(uff.created_at) DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;


-- SECTION 2: Count function for pagination
-- ============================================================
CREATE OR REPLACE FUNCTION get_most_favorited_count()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) FROM (
      SELECT fatsecret_recipe_id
      FROM user_fatsecret_favorites
      GROUP BY fatsecret_recipe_id
      HAVING COUNT(DISTINCT user_id) >= 1
    ) AS popular
  );
END;
$$;


-- SECTION 3: Optimize aggregation queries with composite index
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_favorites_recipe_user
ON user_fatsecret_favorites(fatsecret_recipe_id, user_id);
