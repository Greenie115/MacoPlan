-- ============================================================================
-- Fix: Add Missing INSERT RLS Policy for Quota Table
-- ============================================================================
-- Issue: Users cannot create their own quota records due to missing INSERT policy
-- This migration adds the INSERT policy to allow users to create quota records
-- for themselves when generating their first meal plan.

-- Add INSERT policy for meal_plan_generation_quota table
CREATE POLICY "Users can insert own quota"
  ON meal_plan_generation_quota FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON POLICY "Users can insert own quota" ON meal_plan_generation_quota IS
  'Allows users to create their own quota record when generating first meal plan';

-- Verify RLS is still enabled (should already be enabled, but being explicit)
ALTER TABLE meal_plan_generation_quota ENABLE ROW LEVEL SECURITY;

-- Summary
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Quota INSERT Policy Fix Applied';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Changes:';
  RAISE NOTICE '  ✓ Added INSERT policy for meal_plan_generation_quota';
  RAISE NOTICE '  ✓ Users can now create their own quota records';
  RAISE NOTICE '';
  RAISE NOTICE 'Security:';
  RAISE NOTICE '  ✓ RLS enabled (verified)';
  RAISE NOTICE '  ✓ Users can only insert rows with their own user_id';
  RAISE NOTICE '========================================';
END $$;
