-- ============================================================================
-- COMPREHENSIVE MEAL PLANS SCHEMA VERIFICATION SCRIPT
-- ============================================================================
-- Run this in Supabase SQL Editor BEFORE and AFTER applying migrations
-- to verify the schema is correctly configured
-- ============================================================================

-- Clear previous output
\echo '========================================';
\echo 'MEAL PLANS SCHEMA VERIFICATION';
\echo '========================================';
\echo '';

-- ============================================================================
-- 1. TABLE EXISTENCE CHECK
-- ============================================================================
\echo '1. CHECKING TABLE EXISTENCE...';
\echo '';

SELECT
  table_name,
  CASE
    WHEN table_name IN (
      'meal_plans',
      'meal_plan_meals',
      'spoonacular_meal_plans',
      'shopping_lists',
      'meal_plan_generation_quota'
    ) THEN '✓ Exists'
    ELSE '✗ Missing'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'meal_plans',
    'meal_plan_meals',
    'spoonacular_meal_plans',
    'shopping_lists',
    'meal_plan_generation_quota'
  )
ORDER BY table_name;

\echo '';

-- ============================================================================
-- 2. MEAL_PLANS TABLE STRUCTURE
-- ============================================================================
\echo '2. MEAL_PLANS TABLE STRUCTURE...';
\echo '';

SELECT
  column_name,
  data_type,
  CASE WHEN is_nullable = 'NO' THEN 'NOT NULL' ELSE 'NULL' END as nullability,
  column_default
FROM information_schema.columns
WHERE table_name = 'meal_plans'
ORDER BY ordinal_position;

\echo '';
\echo 'Expected columns: id, user_id, name, description, start_date, end_date,';
\echo 'total_days, target_calories, protein_grams, carb_grams, fat_grams,';
\echo 'is_active, archived, completed_at, plan_source, spoonacular_plan_id,';
\echo 'is_favorite, generation_params, archived_at, created_at, updated_at';
\echo '';

-- ============================================================================
-- 3. RLS STATUS CHECK
-- ============================================================================
\echo '3. ROW LEVEL SECURITY STATUS...';
\echo '';

SELECT
  tablename as table_name,
  CASE
    WHEN rowsecurity THEN '✓ Enabled'
    ELSE '✗ DISABLED (SECURITY RISK!)'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'meal_plans',
    'meal_plan_meals',
    'spoonacular_meal_plans',
    'shopping_lists',
    'meal_plan_generation_quota'
  )
ORDER BY tablename;

\echo '';

-- ============================================================================
-- 4. RLS POLICIES - MEAL_PLANS
-- ============================================================================
\echo '4. RLS POLICIES ON MEAL_PLANS...';
\echo '';

SELECT
  policyname as policy_name,
  cmd as operation,
  CASE
    WHEN qual IS NOT NULL THEN 'USING: ' || qual
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
    ELSE 'No condition'
  END as condition
FROM pg_policies
WHERE tablename = 'meal_plans'
ORDER BY cmd, policyname;

\echo '';
\echo 'Expected: 4 policies (SELECT, INSERT, UPDATE, DELETE)';
\echo 'Each with condition: auth.uid() = user_id';
\echo '';

-- Check for duplicates
SELECT
  cmd as operation,
  COUNT(*) as policy_count,
  CASE
    WHEN COUNT(*) > 1 THEN '⚠️  DUPLICATE POLICIES FOUND'
    WHEN COUNT(*) = 1 THEN '✓ OK'
    ELSE '✗ MISSING POLICY'
  END as status
FROM pg_policies
WHERE tablename = 'meal_plans'
GROUP BY cmd
ORDER BY cmd;

\echo '';

-- ============================================================================
-- 5. RLS POLICIES - QUOTA TABLE
-- ============================================================================
\echo '5. RLS POLICIES ON MEAL_PLAN_GENERATION_QUOTA...';
\echo '';

SELECT
  policyname as policy_name,
  cmd as operation,
  CASE
    WHEN qual IS NOT NULL THEN 'USING: ' || qual
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
    ELSE 'No condition'
  END as condition
FROM pg_policies
WHERE tablename = 'meal_plan_generation_quota'
ORDER BY cmd, policyname;

\echo '';
\echo 'Expected: At least 3 policies (SELECT, INSERT, UPDATE)';
\echo '';

-- ============================================================================
-- 6. FOREIGN KEY CONSTRAINTS
-- ============================================================================
\echo '6. FOREIGN KEY CONSTRAINTS...';
\echo '';

SELECT
  tc.table_name as from_table,
  kcu.column_name as from_column,
  ccu.table_name as to_table,
  ccu.column_name as to_column,
  '✓' as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('meal_plans', 'meal_plan_meals', 'shopping_lists')
ORDER BY tc.table_name, kcu.column_name;

\echo '';

-- ============================================================================
-- 7. INDEXES
-- ============================================================================
\echo '7. INDEXES ON MEAL_PLANS...';
\echo '';

SELECT
  indexname as index_name,
  indexdef as definition
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'meal_plans'
ORDER BY indexname;

\echo '';

-- ============================================================================
-- 8. FUNCTIONS AND TRIGGERS
-- ============================================================================
\echo '8. MEAL PLANNING FUNCTIONS...';
\echo '';

SELECT
  routine_name as function_name,
  routine_type as type,
  '✓' as exists
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%meal_plan%'
ORDER BY routine_name;

\echo '';

-- ============================================================================
-- 9. TRIGGERS
-- ============================================================================
\echo '9. TRIGGERS ON MEAL_PLANS...';
\echo '';

SELECT
  trigger_name,
  event_manipulation as event,
  action_timing as timing,
  '✓' as exists
FROM information_schema.triggers
WHERE event_object_table = 'meal_plans'
ORDER BY trigger_name;

\echo '';

-- ============================================================================
-- 10. DATA INTEGRITY CHECKS
-- ============================================================================
\echo '10. DATA INTEGRITY CHECKS...';
\echo '';

-- Count records in each table
SELECT
  'meal_plans' as table_name,
  COUNT(*) as record_count
FROM meal_plans
UNION ALL
SELECT
  'meal_plan_meals',
  COUNT(*)
FROM meal_plan_meals
UNION ALL
SELECT
  'spoonacular_meal_plans',
  COUNT(*)
FROM spoonacular_meal_plans
UNION ALL
SELECT
  'shopping_lists',
  COUNT(*)
FROM shopping_lists
UNION ALL
SELECT
  'meal_plan_generation_quota',
  COUNT(*)
FROM meal_plan_generation_quota;

\echo '';

-- ============================================================================
-- 11. ORPHANED RECORDS CHECK
-- ============================================================================
\echo '11. CHECKING FOR ORPHANED RECORDS...';
\echo '';

-- Meals without a valid meal plan
SELECT
  'Orphaned meal_plan_meals' as issue,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) = 0 THEN '✓ None found'
    ELSE '⚠️  Found orphaned records'
  END as status
FROM meal_plan_meals mpm
LEFT JOIN meal_plans mp ON mpm.meal_plan_id = mp.id
WHERE mp.id IS NULL;

\echo '';

-- Shopping lists without a valid meal plan
SELECT
  'Orphaned shopping_lists' as issue,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) = 0 THEN '✓ None found'
    ELSE '⚠️  Found orphaned records'
  END as status
FROM shopping_lists sl
LEFT JOIN meal_plans mp ON sl.meal_plan_id = mp.id
WHERE mp.id IS NULL;

\echo '';

-- ============================================================================
-- 12. FINAL SUMMARY
-- ============================================================================
\echo '========================================';
\echo 'VERIFICATION SUMMARY';
\echo '========================================';

DO $$
DECLARE
  v_meal_plans_exists BOOLEAN;
  v_policies_count INTEGER;
  v_quota_insert_policy_exists BOOLEAN;
  v_rls_enabled BOOLEAN;
  v_duplicate_policies INTEGER;
  v_overall_status TEXT := '✓ PASS';
BEGIN
  -- Check meal_plans exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'meal_plans'
  ) INTO v_meal_plans_exists;

  -- Count policies on meal_plans
  SELECT COUNT(*) INTO v_policies_count
  FROM pg_policies
  WHERE tablename = 'meal_plans';

  -- Check for quota INSERT policy
  SELECT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'meal_plan_generation_quota'
      AND cmd = 'INSERT'
  ) INTO v_quota_insert_policy_exists;

  -- Check RLS is enabled
  SELECT rowsecurity INTO v_rls_enabled
  FROM pg_tables
  WHERE tablename = 'meal_plans';

  -- Check for duplicate INSERT policies
  SELECT COUNT(*) - 1 INTO v_duplicate_policies
  FROM pg_policies
  WHERE tablename = 'meal_plans' AND cmd = 'INSERT';

  -- Determine overall status
  IF NOT v_meal_plans_exists THEN
    v_overall_status := '✗ FAIL: meal_plans table missing';
  ELSIF v_policies_count != 4 THEN
    v_overall_status := '⚠️  WARNING: Expected 4 policies, found ' || v_policies_count;
  ELSIF v_duplicate_policies > 0 THEN
    v_overall_status := '⚠️  WARNING: ' || v_duplicate_policies || ' duplicate INSERT policies found';
  ELSIF NOT v_quota_insert_policy_exists THEN
    v_overall_status := '⚠️  WARNING: quota INSERT policy missing';
  ELSIF NOT v_rls_enabled THEN
    v_overall_status := '✗ FAIL: RLS not enabled on meal_plans';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE 'Overall Status: %', v_overall_status;
  RAISE NOTICE '';
  RAISE NOTICE 'Details:';
  RAISE NOTICE '  - meal_plans table: %', CASE WHEN v_meal_plans_exists THEN '✓ Exists' ELSE '✗ Missing' END;
  RAISE NOTICE '  - RLS enabled: %', CASE WHEN v_rls_enabled THEN '✓ Yes' ELSE '✗ No' END;
  RAISE NOTICE '  - Policies on meal_plans: % (expected: 4)', v_policies_count;
  RAISE NOTICE '  - Duplicate INSERT policies: % (expected: 0)', v_duplicate_policies;
  RAISE NOTICE '  - Quota INSERT policy: %', CASE WHEN v_quota_insert_policy_exists THEN '✓ Exists' ELSE '✗ Missing' END;
  RAISE NOTICE '';

  IF v_overall_status = '✓ PASS' THEN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✓ ALL CHECKS PASSED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Schema is ready for meal plan generation!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Test meal plan generation in your app';
    RAISE NOTICE '  2. Verify quota tracking works';
    RAISE NOTICE '  3. Check shopping list generation';
  ELSE
    RAISE NOTICE '========================================';
    RAISE NOTICE '⚠️  ISSUES FOUND';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Please review the warnings above.';
    RAISE NOTICE '';
    RAISE NOTICE 'Recommended actions:';
    IF v_duplicate_policies > 0 THEN
      RAISE NOTICE '  - Run: 20250202_cleanup_meal_plans_policies.sql';
    END IF;
    IF NOT v_quota_insert_policy_exists THEN
      RAISE NOTICE '  - Run: 20250202_fix_quota_insert_policy.sql';
    END IF;
  END IF;

  RAISE NOTICE '========================================';
END $$;

\echo '';
\echo 'Verification complete!';
