-- ============================================================================
-- FatSecret Favorites Migration
-- Enables favoriting FatSecret recipes (separate from local recipes)
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- Step 1: Create FatSecret Favorites Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_fatsecret_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fatsecret_recipe_id TEXT NOT NULL,

  -- Store basic recipe metadata for quick display without API calls
  recipe_title TEXT NOT NULL,
  recipe_description TEXT,
  recipe_image_url TEXT,
  calories DECIMAL,
  protein_grams DECIMAL,
  carb_grams DECIMAL,
  fat_grams DECIMAL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Each user can only favorite a FatSecret recipe once
  UNIQUE(user_id, fatsecret_recipe_id)
);

-- ============================================================================
-- Step 2: Create Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_fatsecret_favorites_user_id
  ON user_fatsecret_favorites(user_id);

CREATE INDEX IF NOT EXISTS idx_user_fatsecret_favorites_recipe_id
  ON user_fatsecret_favorites(fatsecret_recipe_id);

CREATE INDEX IF NOT EXISTS idx_user_fatsecret_favorites_created
  ON user_fatsecret_favorites(created_at DESC);

-- ============================================================================
-- Step 3: Enable Row Level Security
-- ============================================================================

ALTER TABLE user_fatsecret_favorites ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Step 4: Create RLS Policies
-- Users can only access their own favorites
-- ============================================================================

-- Select: Users can only see their own favorites
CREATE POLICY "Users can view own fatsecret favorites"
  ON user_fatsecret_favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Insert: Users can only add to their own favorites
CREATE POLICY "Users can add own fatsecret favorites"
  ON user_fatsecret_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Delete: Users can only remove their own favorites
CREATE POLICY "Users can delete own fatsecret favorites"
  ON user_fatsecret_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Step 5: Cleanup - Drop old local recipe tables if they exist
-- (These were used before FatSecret integration)
-- ============================================================================

-- First, drop dependent tables
DROP TABLE IF EXISTS recipe_instructions CASCADE;
DROP TABLE IF EXISTS recipe_ingredients CASCADE;
DROP TABLE IF EXISTS recipe_tags CASCADE;

-- Drop the old user_favorite_recipes table that references local recipes
-- DROP TABLE IF EXISTS user_favorite_recipes CASCADE;

-- Drop the local recipes table
DROP TABLE IF EXISTS recipes CASCADE;

-- ============================================================================
-- Done!
-- ============================================================================

SELECT 'FatSecret favorites migration completed!' as status;
