-- ============================================================================
-- Fix: Enforce Single Active Plan Per User
-- ============================================================================
-- Issue: Race condition allows multiple active plans if deactivation fails
-- or if concurrent requests create plans simultaneously.
--
-- Solution: Add partial unique index to enforce database-level constraint
-- that only ONE plan per user can have is_active=true at any time.

-- Add partial unique index
-- This prevents multiple rows with same user_id where is_active = true
-- Note: Removed CONCURRENTLY to allow running in transaction block
CREATE UNIQUE INDEX IF NOT EXISTS idx_meal_plans_user_active
  ON meal_plans (user_id)
  WHERE is_active = true;

COMMENT ON INDEX idx_meal_plans_user_active IS
  'Ensures only one active meal plan per user at database level. Prevents race conditions.';

-- Summary
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Single Active Plan Constraint Added';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Changes:';
  RAISE NOTICE '  ✓ Created partial unique index on (user_id) WHERE is_active=true';
  RAISE NOTICE '  ✓ Database now enforces: max 1 active plan per user';
  RAISE NOTICE '';
  RAISE NOTICE 'Security:';
  RAISE NOTICE '  ✓ Prevents race condition in plan activation';
  RAISE NOTICE '  ✓ Concurrent requests will fail with unique constraint violation';
  RAISE NOTICE '  ✓ Application must handle this gracefully';
  RAISE NOTICE '';
  RAISE NOTICE 'Impact:';
  RAISE NOTICE '  - INSERT with is_active=true will fail if user has active plan';
  RAISE NOTICE '  - UPDATE to set is_active=true will fail if user has active plan';
  RAISE NOTICE '  - Deactivate existing plans before creating/activating new ones';
  RAISE NOTICE '========================================';
END $$;
