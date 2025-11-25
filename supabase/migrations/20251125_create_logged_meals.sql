-- Create logged_meals table for tracking user's daily food intake
CREATE TABLE IF NOT EXISTS logged_meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Timestamp & Organization
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'other')),

  -- Meal Details
  name TEXT NOT NULL,
  description TEXT,

  -- Nutritional Data
  calories INT NOT NULL CHECK (calories >= 0),
  protein_grams DECIMAL(6,1) NOT NULL CHECK (protein_grams >= 0),
  carb_grams DECIMAL(6,1) NOT NULL CHECK (carb_grams >= 0),
  fat_grams DECIMAL(6,1) NOT NULL CHECK (fat_grams >= 0),

  -- Optional Metadata
  serving_size TEXT,

  -- Source Tracking (for future phases - linking to recipes/plans)
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  plan_meal_id UUID REFERENCES plan_meals(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for efficient date-based queries
CREATE INDEX idx_logged_meals_user_date ON logged_meals(user_id, date DESC);
CREATE INDEX idx_logged_meals_user_logged_at ON logged_meals(user_id, logged_at DESC);

-- Enable Row Level Security
ALTER TABLE logged_meals ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own logged meals
CREATE POLICY "Users can view their own logged meals"
  ON logged_meals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logged meals"
  ON logged_meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logged meals"
  ON logged_meals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logged meals"
  ON logged_meals FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_logged_meals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER logged_meals_updated_at
  BEFORE UPDATE ON logged_meals
  FOR EACH ROW
  EXECUTE FUNCTION update_logged_meals_updated_at();
