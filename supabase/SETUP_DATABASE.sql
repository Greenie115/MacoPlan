-- ============================================================================
-- MACROPLAN DATABASE SETUP SCRIPT
-- ============================================================================
-- Run this ONCE in your Supabase SQL Editor to set up all tables and policies
-- ============================================================================

-- ============================================================================
-- 1. CREATE USER_PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- Profile Info
  full_name TEXT,
  avatar_url TEXT,

  -- Step 1: Goal
  goal TEXT CHECK (goal IN ('cut', 'bulk', 'maintain', 'recomp')),

  -- Step 2: Personal Stats
  age INTEGER CHECK (age >= 13 AND age <= 120),
  weight_kg DECIMAL(5, 2) CHECK (weight_kg > 0),
  height_cm INTEGER CHECK (height_cm > 0),
  sex TEXT CHECK (sex IN ('male', 'female')),

  -- Step 3: Activity Level
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly', 'moderately', 'very', 'extremely')),

  -- Step 4: Dietary Preferences
  dietary_style TEXT CHECK (dietary_style IN ('none', 'vegetarian', 'vegan', 'pescatarian', 'paleo', 'keto', 'mediterranean')),
  allergies TEXT[], -- Array of allergy strings
  foods_to_avoid TEXT,

  -- Step 5: Experience Level
  fitness_experience TEXT CHECK (fitness_experience IN ('beginner', 'intermediate', 'advanced')),
  tracking_experience TEXT CHECK (tracking_experience IN ('never', 'some', 'experienced')),
  meal_prep_skills TEXT CHECK (meal_prep_skills IN ('beginner', 'intermediate', 'advanced')),

  -- Step 6: Calculated Values
  bmr INTEGER,
  tdee INTEGER,
  target_calories INTEGER,
  protein_grams INTEGER,
  carb_grams INTEGER,
  fat_grams INTEGER,

  -- Status
  onboarding_completed BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Comments for documentation
COMMENT ON TABLE user_profiles IS 'Stores user onboarding data and macro calculations';
COMMENT ON COLUMN user_profiles.user_id IS 'Foreign key to auth.users table';
COMMENT ON COLUMN user_profiles.full_name IS 'User full name captured at sign up';
COMMENT ON COLUMN user_profiles.avatar_url IS 'URL to user profile picture stored in Supabase Storage';
COMMENT ON COLUMN user_profiles.allergies IS 'Array of allergy identifiers (e.g., peanuts, dairy, gluten)';
COMMENT ON COLUMN user_profiles.onboarding_completed IS 'Whether user has completed full onboarding flow';

-- ============================================================================
-- 2. CREATE PROFILE TRIGGER (Auto-create profile on signup)
-- ============================================================================

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, onboarding_completed)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    FALSE
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 3. CREATE RECIPES TABLE (if not exists)
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

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Recipes are viewable by everyone" ON recipes;
CREATE POLICY "Recipes are viewable by everyone"
  ON recipes FOR SELECT USING (true);

-- ============================================================================
-- 4. CREATE MEAL PLANS TABLES (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can insert own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can update own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can delete own meal plans" ON meal_plans;

CREATE POLICY "Users can view own meal plans"
  ON meal_plans FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal plans"
  ON meal_plans FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plans"
  ON meal_plans FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans"
  ON meal_plans FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify setup:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles';
-- SELECT * FROM user_profiles LIMIT 1;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Next steps:
-- 1. Set up Storage bucket for avatars (see supabase/storage/avatars_bucket_setup.md)
-- 2. Complete onboarding flow in the app
-- 3. Test profile creation and editing
-- ============================================================================
