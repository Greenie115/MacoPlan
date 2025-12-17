-- Add measurement_system column to user_profiles
-- Allows users to persist their preferred unit system (imperial or metric)

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS measurement_system TEXT DEFAULT 'imperial'
CHECK (measurement_system IN ('imperial', 'metric'));

-- Update existing rows to have imperial as default (if null)
UPDATE user_profiles
SET measurement_system = 'imperial'
WHERE measurement_system IS NULL;

COMMENT ON COLUMN user_profiles.measurement_system IS 'User preferred measurement system: imperial (lbs, ft/in) or metric (kg, cm)';
