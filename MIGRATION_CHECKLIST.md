# Meal Plans Schema Migration Checklist

## Current Status
Based on diagnostic queries, the following issues have been identified:
- ✅ Schema structure is correct (all columns exist)
- ✅ RLS is enabled on all tables
- ⚠️ Duplicate INSERT policies need cleanup
- ✅ Foreign keys are configured properly

## Required Migrations (Run in Order)

### Step 1: Verify Current State
Run these queries in Supabase SQL Editor to confirm current state:

```sql
-- Check meal_plans policies
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'meal_plans'
ORDER BY cmd, policyname;

-- Check quota policies
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'meal_plan_generation_quota'
ORDER BY cmd, policyname;
```

**Expected Issues:**
- 2 INSERT policies on `meal_plans` (duplicate)
- Potentially missing INSERT policy on `meal_plan_generation_quota`

---

### Step 2: Apply Cleanup Migration
Run this file in Supabase SQL Editor:

📄 **File**: `supabase/migrations/20250202_cleanup_meal_plans_policies.sql`

**What it does:**
- Removes duplicate INSERT policies on `meal_plans`
- Recreates clean set of 4 policies (SELECT, INSERT, UPDATE, DELETE)
- Ensures no naming conflicts

---

### Step 3: Verify Quota INSERT Policy
Run this file in Supabase SQL Editor:

📄 **File**: `supabase/migrations/20250202_fix_quota_insert_policy.sql`

**What it does:**
- Adds missing INSERT policy for `meal_plan_generation_quota`
- Fixes "Failed to check quota" error on first meal plan generation

---

### Step 4: Verification
After running migrations, verify policies are correct:

```sql
-- Should show exactly 4 policies (SELECT, INSERT, UPDATE, DELETE)
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'meal_plans';

-- Should show at least 3 policies (SELECT, INSERT, UPDATE)
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'meal_plan_generation_quota';
```

---

## Post-Migration Testing

### Test 1: Create a Meal Plan
```typescript
// In your app, try generating a meal plan
const result = await generateMealPlan({
  timeFrame: 'day',
  targetCalories: 2000
})

console.log('Success:', result.success)
console.log('Data:', result.data)
```

**Expected Result**: `success: true` with meal plan data

---

### Test 2: Check Quota
```typescript
const quotaInfo = await getMealPlanQuotaInfo()
console.log('Quota:', quotaInfo)
```

**Expected Result**: Shows tier, remaining, and total quota

---

### Test 3: Fetch Meal Plans
```typescript
const plans = await getMealPlans()
console.log('Plans:', plans.data)
```

**Expected Result**: Returns array of user's meal plans

---

## Common Issues & Solutions

### Issue: "Failed to check quota"
**Cause**: Missing INSERT policy on `meal_plan_generation_quota`
**Fix**: Run migration `20250202_fix_quota_insert_policy.sql`

### Issue: "Failed to save meal plan"
**Cause**: Duplicate INSERT policies or RLS misconfiguration
**Fix**: Run migration `20250202_cleanup_meal_plans_policies.sql`

### Issue: "Meal plan not found" after creation
**Cause**: RLS policy not allowing SELECT after INSERT
**Fix**: Verify SELECT policy exists and uses `auth.uid() = user_id`

### Issue: auth.uid() returns null in SQL Editor
**Cause**: Not authenticated when running queries manually
**Fix**: This is normal. Test via your application where users are authenticated.

---

## Migration Order Summary

1. ✅ `20250128_meal_planning_system.sql` (Already applied based on diagnostics)
2. ✅ `20250202_create_meal_plans_with_rls.sql` (Already applied)
3. ✅ `20250202_fix_meal_plans_table.sql` (Already applied)
4. ⏭️ **`20250202_cleanup_meal_plans_policies.sql`** ← **Run this next**
5. ⏭️ **`20250202_fix_quota_insert_policy.sql`** ← **Then run this**

---

## Verification Script

After all migrations, run this comprehensive verification:

```sql
-- ============================================================================
-- COMPREHENSIVE MEAL PLANS SCHEMA VERIFICATION
-- ============================================================================

-- 1. Verify meal_plans table structure
SELECT
  'meal_plans columns' as check_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'meal_plans';
-- Expected: ~18-20 columns

-- 2. Verify RLS policies on meal_plans
SELECT
  'meal_plans policies' as check_name,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'meal_plans';
-- Expected: 4 policies (SELECT, INSERT, UPDATE, DELETE)

-- 3. Check for duplicate INSERT policies (should be 0)
SELECT
  'duplicate INSERT policies' as check_name,
  COUNT(*) - 1 as duplicate_count
FROM pg_policies
WHERE tablename = 'meal_plans' AND cmd = 'INSERT';
-- Expected: 0 duplicates

-- 4. Verify quota table policies
SELECT
  'quota policies' as check_name,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'meal_plan_generation_quota';
-- Expected: At least 3 policies

-- 5. Verify foreign key exists
SELECT
  'foreign keys' as check_name,
  COUNT(*) as fk_count
FROM information_schema.table_constraints
WHERE table_name = 'meal_plans'
  AND constraint_type = 'FOREIGN KEY';
-- Expected: At least 1 (spoonacular_plan_id)

-- Summary
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Meal Plans Schema Verification Complete';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'If all checks passed, schema is ready!';
  RAISE NOTICE 'Next: Test meal plan generation in app';
  RAISE NOTICE '========================================';
END $$;
```

---

## Success Criteria

✅ **Schema is ready when:**
1. All migrations run without errors
2. Exactly 4 policies on `meal_plans` (no duplicates)
3. At least 3 policies on `meal_plan_generation_quota` including INSERT
4. Application can create, read, update, and delete meal plans
5. Quota system works for new users

---

## Next Steps After Schema Fix

1. **Test in Development**
   - Generate a meal plan via UI
   - Verify it saves to database
   - Check quota increments correctly

2. **Monitor Logs**
   - Check browser console for errors
   - Review server action responses
   - Verify Supabase logs in dashboard

3. **Edge Cases**
   - Test with free tier user (3 plan limit)
   - Test with test user (unlimited)
   - Test quota reset for paid users

4. **Performance**
   - Verify queries use indexes
   - Check RLS policies aren't causing slow queries
   - Monitor Spoonacular API cache hit rate

---

## Contact

If issues persist after running these migrations, check:
1. Supabase logs for detailed error messages
2. Browser console for client-side errors
3. Server action logs for RLS policy violations
