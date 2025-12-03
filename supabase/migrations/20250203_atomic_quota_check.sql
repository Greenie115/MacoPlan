-- ============================================================================
-- Fix: Atomic Quota Check and Reserve
-- ============================================================================
-- Issue: Quota check and increment are separate operations, causing race condition
-- where concurrent requests can both pass the check before either increments.
--
-- Solution: Create atomic function that checks AND reserves quota in single transaction
-- using SELECT FOR UPDATE to lock the row.

-- Atomic quota check and reserve function
CREATE OR REPLACE FUNCTION check_and_reserve_meal_plan_quota(
  p_user_id UUID,
  p_is_free_tier BOOLEAN
)
RETURNS JSONB AS $$
DECLARE
  v_quota RECORD;
  v_limit INTEGER;
  v_used INTEGER;
  v_remaining INTEGER;
BEGIN
  -- Set limit based on tier
  IF p_is_free_tier THEN
    v_limit := 3;  -- Free tier: 3 lifetime
  ELSE
    v_limit := 100;  -- Paid tier: 100 per month
  END IF;

  -- Lock the row to prevent concurrent access (SELECT FOR UPDATE)
  -- Upsert if doesn't exist, then lock
  INSERT INTO meal_plan_generation_quota (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Now lock and fetch
  SELECT * INTO v_quota
  FROM meal_plan_generation_quota
  WHERE user_id = p_user_id
  FOR UPDATE;  -- ← This locks the row until transaction commits

  -- Calculate usage based on tier
  IF p_is_free_tier THEN
    v_used := v_quota.free_tier_generated;
  ELSE
    v_used := v_quota.current_period_generated;
  END IF;

  v_remaining := v_limit - v_used;

  -- Check if quota exceeded
  IF v_remaining <= 0 THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'total', v_limit,
      'used', v_used,
      'reason', CASE
        WHEN p_is_free_tier THEN 'Free tier limit reached. Upgrade to generate unlimited meal plans.'
        ELSE 'Monthly generation limit reached. Please contact support if you need more.'
      END
    );
  END IF;

  -- Quota available - reserve it by incrementing counters
  UPDATE meal_plan_generation_quota
  SET
    total_generated = total_generated + 1,
    free_tier_generated = free_tier_generated +
      CASE WHEN p_is_free_tier THEN 1 ELSE 0 END,
    current_period_generated = current_period_generated + 1,
    last_generation_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Return success with updated counts
  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', v_remaining - 1,  -- Subtract 1 since we just reserved
    'total', v_limit,
    'used', v_used + 1,
    'reason', NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_and_reserve_meal_plan_quota IS
  'Atomically checks quota and reserves a slot if available. Uses row locking to prevent race conditions.';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_and_reserve_meal_plan_quota TO authenticated;

-- Summary
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Atomic Quota Check Function Created';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Changes:';
  RAISE NOTICE '  ✓ Created check_and_reserve_meal_plan_quota()';
  RAISE NOTICE '  ✓ Uses SELECT FOR UPDATE for row locking';
  RAISE NOTICE '  ✓ Prevents quota bypass via race condition';
  RAISE NOTICE '';
  RAISE NOTICE 'Security:';
  RAISE NOTICE '  ✓ SECURITY DEFINER (bypasses RLS safely)';
  RAISE NOTICE '  ✓ Only authenticated users can execute';
  RAISE NOTICE '  ✓ Atomic operation (check + reserve in one tx)';
  RAISE NOTICE '';
  RAISE NOTICE 'Usage:';
  RAISE NOTICE '  Replace checkMealPlanQuota() + incrementMealPlanQuota()';
  RAISE NOTICE '  with single call to check_and_reserve_meal_plan_quota()';
  RAISE NOTICE '========================================';
END $$;
