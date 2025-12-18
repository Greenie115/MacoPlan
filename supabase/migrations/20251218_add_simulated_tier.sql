-- Add simulated_tier column to user_profiles
-- Allows test users to simulate different subscription tiers for debugging

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS simulated_tier TEXT DEFAULT NULL
CHECK (simulated_tier IS NULL OR simulated_tier IN ('free', 'paid'));

COMMENT ON COLUMN user_profiles.simulated_tier IS 'Test users can simulate subscription tiers. NULL = use real tier';
