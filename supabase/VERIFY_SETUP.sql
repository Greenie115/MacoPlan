-- ============================================================================
-- VERIFICATION SCRIPT
-- ============================================================================
-- Run this to verify your database is set up correctly
-- ============================================================================

-- 1. Check if user_profiles table exists
SELECT
  CASE
    WHEN EXISTS (
      SELECT FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
    )
    THEN '✅ user_profiles table exists'
    ELSE '❌ user_profiles table NOT FOUND - Run SETUP_DATABASE.sql'
  END as table_check;

-- 2. Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 3. Check RLS policies
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'user_profiles';

-- 4. Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 5. Check your user profile (if you've signed up)
SELECT
  id,
  user_id,
  full_name,
  goal,
  age,
  onboarding_completed,
  created_at
FROM user_profiles
WHERE user_id = auth.uid();

-- 6. Count total profiles
SELECT COUNT(*) as total_profiles
FROM user_profiles;
