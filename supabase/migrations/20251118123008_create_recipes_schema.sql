-- MacroPlan Recipe Schema Migration
-- This migration creates the complete recipe system including:
-- - Recipes table
-- - Recipe tags for filtering
-- - Recipe ingredients
-- - Recipe instructions
-- - User favorites

-- ============================================================================
-- RECIPES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  calories INTEGER NOT NULL CHECK (calories > 0),
  protein_grams INTEGER NOT NULL CHECK (protein_grams >= 0),
  carb_grams INTEGER NOT NULL CHECK (carb_grams >= 0),
  fat_grams INTEGER NOT NULL CHECK (fat_grams >= 0),
  prep_time_minutes INTEGER CHECK (prep_time_minutes >= 0),
  cook_time_minutes INTEGER CHECK (cook_time_minutes >= 0),
  total_time_minutes INTEGER CHECK (total_time_minutes >= 0),
  servings INTEGER DEFAULT 1 CHECK (servings > 0),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  rating_count INTEGER DEFAULT 0 CHECK (rating_count >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- RECIPE TAGS TABLE (for filtering)
-- ============================================================================
CREATE TABLE IF NOT EXISTS recipe_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- RECIPE INGREDIENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient TEXT NOT NULL,
  amount TEXT NOT NULL,
  unit TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- RECIPE INSTRUCTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS recipe_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL CHECK (step_number > 0),
  instruction TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USER FAVORITE RECIPES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_favorite_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_recipes ENABLE ROW LEVEL SECURITY;

-- Recipes and related data are public (read-only for now)
CREATE POLICY "Recipes are viewable by everyone"
  ON recipes FOR SELECT USING (true);

CREATE POLICY "Recipe tags are viewable by everyone"
  ON recipe_tags FOR SELECT USING (true);

CREATE POLICY "Recipe ingredients are viewable by everyone"
  ON recipe_ingredients FOR SELECT USING (true);

CREATE POLICY "Recipe instructions are viewable by everyone"
  ON recipe_instructions FOR SELECT USING (true);

-- Users can manage their own favorites
CREATE POLICY "Users can view their own favorites"
  ON user_favorite_recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON user_favorite_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON user_favorite_recipes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_recipe_tags_recipe_id ON recipe_tags(recipe_id);
CREATE INDEX idx_recipe_tags_tag ON recipe_tags(tag);
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_order ON recipe_ingredients(recipe_id, order_index);
CREATE INDEX idx_recipe_instructions_recipe_id ON recipe_instructions(recipe_id);
CREATE INDEX idx_recipe_instructions_order ON recipe_instructions(recipe_id, step_number);
CREATE INDEX idx_user_favorites_user_id ON user_favorite_recipes(user_id);
CREATE INDEX idx_user_favorites_recipe_id ON user_favorite_recipes(recipe_id);

-- ============================================================================
-- SEED DATA (Sample Recipes)
-- ============================================================================

-- Insert recipes
INSERT INTO recipes (name, description, image_url, calories, protein_grams, carb_grams, fat_grams, prep_time_minutes, cook_time_minutes, total_time_minutes, servings, difficulty, rating, rating_count) VALUES
('Chicken & Rice', 'High-protein chicken and rice bowl', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiBNcI-Yk7upg3LAH-m99CQIZeHXjG3ng_Ou9hSyj2zV4bLeNjk6Hv77P9Wl1IKCXiNprWmwNd_0ClZRluOki_wtWNrr7QskQZ3pgrQZo5qyi_xzVyMmgSW3ZQ9rJ7RulemqscI5fsEq40ylA5hg58hfc3wqi_lGUriu0gvaIR6AP4ZrwVzl_F2Pwt0Jm8Oc4S3st8MoTzZLYps22ZlZ3sBBOLCvrvhzBWyW0fXXww5RRuJe3uk3BU0s97rXY1czuTpCgC8j0Cmw', 680, 48, 75, 18, 15, 25, 40, 1, 'easy', 4.5, 120),
('Grilled Salmon', 'Grilled salmon with asparagus', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBI_7l3kJIAgLPFpWaz0Led6ody4lbISim-QDlh8agbhZt0qvipTBSvetjm3DPNDOuGMbkldSD9Y0X0t8noxRH_W7fLeAde6C7cWP-oyxnRvtFSH4b6On5jxuhWeZBk0fF_JrDQz_XW6LbfrT_X6S2i6We7ouvU27qj89a8wFW0pjdqjAHIZ35r2sssiJ7eGsBxKp1iu0h3Gj4LN8S_X8ZHIgtNPPoU4dL7a3FOht719UOBfThM8-WNLjo1cRztdlhH-slOVy5DmA', 550, 42, 10, 38, 10, 15, 25, 1, 'medium', 4.7, 95),
('Protein Yogurt Bowl', 'Greek yogurt with berries and nuts', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSUuCFd26QUM9NeOl1XZdQelYEMeS_GK6Hg68fBv7WtpFPn08wQHmux5netDFGCmxDCMz9DFB9TWcBllN-bD3_bJ0Gop1CaFg4mwRjvw8Ep3d0zxXcUhDr0stnvRd2XUoGVDf1kSR8OD6j83arqtQysOhpYLc4gRVbtrnY5kj-Vn3Ppidank2rU22gQJsF6b-qLdHjLtI83YuUI8WrSH28gsjUVR1s0gBhbZK2CEMqC3ad37-kpPl9VKGrsksrtJY5LrguySyBNA', 420, 35, 30, 18, 5, 0, 5, 1, 'easy', 4.3, 78),
('Steak & Fries', 'Lean beef steak with sweet potato fries', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlRbVutRi-8MvJ6sq1U8y1bjueF5LXBZws3H5_tEkVuabXcKLGnGq4hRqaGOoCmJuMgDDF2fi8vtAtrc5srOivUfWOXh_rv5UdFCJg6YoBxvZKo0XrmQJMT-ecmTeqFo3j3k4egB-xhc_EubtGrXSwpL4R63VCHF6r-yjc0iDLlk9NVk0D1iIecMxbY67ShzqBDOaL1cWgewVBKNyQhvdCpduW5Ie4CUeSU5PmH-S_lB6HOIq9hBksUpcHbQ5jhD8zrFWW259Xbg', 710, 55, 50, 30, 20, 25, 45, 1, 'medium', 4.6, 102),
('Protein Pancakes', 'Protein pancakes with maple syrup', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJw22aZL1lezdIZkO3PzrRZri4P1LEN4pK1Arllfil5aoh_CoZbQ8iadC9ew2sulRggH7nYYp5PwBN5hWj2bGDYAmftMeWpcbBd13qSD6lNpvBqIG-XVOyM1XnfH598YCxPWHXOLTuTQCGOV4x64hXrNTd_ACzmNkZb__tt-qXUtCIdk_tLyJ3II1ng5XSzJOVUwfF54_qVWgXe9yMvqHGGXeIonbQLRWw08C9Uwo8aLMQCIODdFDaz3b9WU68AFntTpDHvh48MA', 480, 30, 60, 15, 10, 15, 25, 1, 'easy', 4.4, 88),
('Quinoa Chicken Salad', 'Quinoa salad with chicken and vegetables', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJbqNI0bIQAFOnwwIoRkjPXE4CzAWUAROMC_ECuF6veTgwVfAIB-tDkLPzMHZz0sRCsjzPQt0kxevPBRM3rMc4E6WnWYDRyvr0IFsRpLEu8CIrXfR280XEakXjg-EFQMqRXub0V1ioZP13ijh_PH2JXs8o-mBao5G3y8bR4iUF_GP9jMGFW7N65Vxh7HdVJ7ZRilZ8wdX1Ng8mg4-ccxwhuZCvSsvEo56GanwbNZFxgN3hAPeOr1RLFI3imLGx4R8quDxkZF8aWQ', 520, 40, 45, 20, 15, 20, 35, 1, 'medium', 4.5, 91),
('Grilled Chicken Caesar Salad', 'Classic caesar salad with grilled chicken', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPf0X4YphPcxSouV1BBdc7M2wDuDd32kjBjm8lDANBoUhaUOKZmKdV8iu4j3gXucWjGuj5Duq89l42diij8VQPyPcfvq21W1o0gUrNKddyP77A3RM3TtthdEXnvolvwP4qRLfk9GVVCuT1Vj6d6QdJ8uHUASaDqejbaktfPlasXl1Tay0cOHt8aqUFV4-sQmS2q1fjlLHu2Hqh70luCZBz8Vz6Sxc8x6YWJ2J5vipJn1AI9WKQmsKHsk3VLUoiVY9OQBxtkrc8VQ', 680, 48, 45, 22, 15, 10, 25, 1, 'easy', 4.5, 120);

-- Insert tags for recipes
INSERT INTO recipe_tags (recipe_id, tag)
SELECT id, 'high-protein' FROM recipes WHERE name = 'Chicken & Rice'
UNION ALL SELECT id, 'quick' FROM recipes WHERE name = 'Chicken & Rice'
UNION ALL SELECT id, 'dinner' FROM recipes WHERE name = 'Chicken & Rice'
UNION ALL SELECT id, 'high-protein' FROM recipes WHERE name = 'Grilled Salmon'
UNION ALL SELECT id, 'low-carb' FROM recipes WHERE name = 'Grilled Salmon'
UNION ALL SELECT id, 'dinner' FROM recipes WHERE name = 'Grilled Salmon'
UNION ALL SELECT id, 'high-protein' FROM recipes WHERE name = 'Protein Yogurt Bowl'
UNION ALL SELECT id, 'quick' FROM recipes WHERE name = 'Protein Yogurt Bowl'
UNION ALL SELECT id, 'breakfast' FROM recipes WHERE name = 'Protein Yogurt Bowl'
UNION ALL SELECT id, 'high-protein' FROM recipes WHERE name = 'Steak & Fries'
UNION ALL SELECT id, 'dinner' FROM recipes WHERE name = 'Steak & Fries'
UNION ALL SELECT id, 'high-protein' FROM recipes WHERE name = 'Protein Pancakes'
UNION ALL SELECT id, 'quick' FROM recipes WHERE name = 'Protein Pancakes'
UNION ALL SELECT id, 'breakfast' FROM recipes WHERE name = 'Protein Pancakes'
UNION ALL SELECT id, 'high-protein' FROM recipes WHERE name = 'Quinoa Chicken Salad'
UNION ALL SELECT id, 'lunch' FROM recipes WHERE name = 'Quinoa Chicken Salad'
UNION ALL SELECT id, 'high-protein' FROM recipes WHERE name = 'Grilled Chicken Caesar Salad'
UNION ALL SELECT id, 'low-carb' FROM recipes WHERE name = 'Grilled Chicken Caesar Salad'
UNION ALL SELECT id, 'keto' FROM recipes WHERE name = 'Grilled Chicken Caesar Salad'
UNION ALL SELECT id, 'gluten-free' FROM recipes WHERE name = 'Grilled Chicken Caesar Salad';

-- Insert ingredients for Grilled Chicken Caesar Salad (for detail page demo)
INSERT INTO recipe_ingredients (recipe_id, ingredient, amount, unit, order_index)
SELECT id, 'grilled chicken breast', '6', 'oz', 1 FROM recipes WHERE name = 'Grilled Chicken Caesar Salad'
UNION ALL SELECT id, 'romaine lettuce, chopped', '2', 'cups', 2 FROM recipes WHERE name = 'Grilled Chicken Caesar Salad'
UNION ALL SELECT id, 'Caesar dressing', '1/4', 'cup', 3 FROM recipes WHERE name = 'Grilled Chicken Caesar Salad'
UNION ALL SELECT id, 'shredded Parmesan cheese', '2', 'tbsp', 4 FROM recipes WHERE name = 'Grilled Chicken Caesar Salad'
UNION ALL SELECT id, 'croutons (optional)', '1/4', 'cup', 5 FROM recipes WHERE name = 'Grilled Chicken Caesar Salad';

-- Insert instructions for Grilled Chicken Caesar Salad
INSERT INTO recipe_instructions (recipe_id, step_number, instruction)
SELECT id, 1, 'Grill the chicken breast until fully cooked. Let it rest for a few minutes, then slice it into strips.' FROM recipes WHERE name = 'Grilled Chicken Caesar Salad'
UNION ALL SELECT id, 2, 'In a large bowl, combine the chopped romaine lettuce with the Caesar dressing. Toss to coat evenly.' FROM recipes WHERE name = 'Grilled Chicken Caesar Salad'
UNION ALL SELECT id, 3, 'Add the sliced grilled chicken, Parmesan cheese, and croutons (if using) to the bowl.' FROM recipes WHERE name = 'Grilled Chicken Caesar Salad'
UNION ALL SELECT id, 4, 'Toss everything together gently and serve immediately.' FROM recipes WHERE name = 'Grilled Chicken Caesar Salad';
