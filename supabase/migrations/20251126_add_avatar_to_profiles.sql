-- Add avatar_url column to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN user_profiles.avatar_url IS 'URL to user profile picture stored in Supabase Storage';
