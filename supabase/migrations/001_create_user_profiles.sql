-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,

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

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

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
COMMENT ON COLUMN user_profiles.allergies IS 'Array of allergy identifiers (e.g., peanuts, dairy, gluten)';
COMMENT ON COLUMN user_profiles.onboarding_completed IS 'Whether user has completed full onboarding flow';
