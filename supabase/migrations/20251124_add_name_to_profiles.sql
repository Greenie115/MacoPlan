-- Add full_name to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

COMMENT ON COLUMN user_profiles.full_name IS 'User''s full name captured at sign up';
