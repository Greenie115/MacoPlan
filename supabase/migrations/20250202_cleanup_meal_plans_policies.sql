-- ============================================================================
-- Cleanup Duplicate RLS Policies on meal_plans
-- ============================================================================
-- This migration removes duplicate INSERT policies and ensures clean RLS setup
-- Run this in Supabase SQL Editor to fix policy duplication
-- ============================================================================

-- Drop all existing policies on meal_plans
DROP POLICY IF EXISTS "Users can view own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can create own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can insert own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can update own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can delete own meal plans" ON meal_plans;

-- Recreate policies with correct names (no duplicates)
CREATE POLICY "Users can view own meal plans"
  ON meal_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal plans"
  ON meal_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plans"
  ON meal_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans"
  ON meal_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Verify RLS is enabled
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this to confirm policies are correct:
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'meal_plans';
-- Expected: 4 policies (SELECT, INSERT, UPDATE, DELETE) with no duplicates
-- ============================================================================
