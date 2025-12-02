# Meal Plans Bug Fixes - Complete Summary

## Issues Identified & Fixed

### 🐛 Issue 1: Next.js 16 Breaking Change - `params` is now a Promise

**Error Message:**
```
Error: Route "/meal-plans/[id]" used `params.id`. `params` is a Promise
and must be unwrapped with `await` or `React.use()` before accessing its properties.
```

**Root Cause:**
Next.js 16 changed the behavior of the `params` prop in dynamic routes. It's now a Promise that must be awaited before accessing properties.

**Files Fixed:**
1. ✅ `app/meal-plans/[id]/page.tsx` - Meal plan detail page
2. ✅ `app/meal-plans/[id]/shopping-list/page.tsx` - Shopping list page

**Changes Made:**
```typescript
// BEFORE (Next.js 15)
export default async function MealPlanDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const result = await getMealPlanById(params.id)
  // ...
}

// AFTER (Next.js 16)
export default async function MealPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params  // ← Must await!
  const result = await getMealPlanById(id)
  // ...
}
```

**Status:** ✅ **FIXED**

---

### 🐛 Issue 2: Duplicate Active Plan Constraint Violation

**Error Message:**
```
[GenerateMealPlan] Error saving meal plan: {
  code: '23505',
  message: 'duplicate key value violates unique constraint "unique_active_plan_per_user"'
}
```

**Root Cause:**
The database schema has a unique constraint that only allows **one active meal plan per user**. When generating a new meal plan with `is_active: true`, it violated this constraint because the user already had an active plan.

**Database Constraint:**
```sql
-- From: 20250202_fix_meal_plans_table.sql
CREATE UNIQUE INDEX unique_active_plan_per_user
  ON meal_plans (user_id)
  WHERE is_active = true AND archived = false;
```

**Fix Applied:**
Added a new step in `generateMealPlan()` to automatically deactivate existing active plans before creating a new one.

**File Changed:**
- ✅ `app/actions/meal-plans.ts` - Line 196-206

**Code Changes:**
```typescript
// NEW Step 6: Deactivate existing active plans
const { error: deactivateError } = await supabase
  .from('meal_plans')
  .update({ is_active: false })
  .eq('user_id', user.id)
  .eq('is_active', true)

if (deactivateError) {
  console.error('[GenerateMealPlan] Error deactivating existing plans:', deactivateError)
  // Continue anyway - this is not critical
}

// Step 7: Save new meal plan with is_active: true
// (This will now succeed because no other active plans exist)
```

**Status:** ✅ **FIXED**

---

## Verification

### TypeScript Compilation
✅ **No errors** in meal-plans routes
```bash
npx tsc --noEmit
# Result: 0 errors in app/meal-plans/**
```

### Test Plan

#### ✅ Test 1: Generate a New Meal Plan
1. Navigate to `/meal-plans/generate`
2. Fill in the form with:
   - Time frame: Day or Week
   - Meals per day: 3
3. Click "Generate Meal Plan"
4. **Expected Result:**
   - Success message appears
   - New meal plan is created
   - User is redirected to meal plan detail page
   - No "duplicate key" error

#### ✅ Test 2: View Meal Plan Details
1. Navigate to `/meal-plans/[id]` (any valid meal plan ID)
2. **Expected Result:**
   - Page loads successfully
   - No "invalid input syntax for type uuid" error
   - Meal details are displayed

#### ✅ Test 3: View Shopping List
1. Navigate to `/meal-plans/[id]/shopping-list`
2. **Expected Result:**
   - Page loads successfully
   - Shopping list is displayed
   - No TypeScript errors

#### ✅ Test 4: Generate Multiple Meal Plans
1. Generate a meal plan
2. Generate another meal plan immediately
3. **Expected Result:**
   - Second generation succeeds
   - First plan is automatically marked as `is_active: false`
   - Second plan is marked as `is_active: true`
   - User can only have 1 active plan at a time

---

## Additional Files Checked (Already Correct)

These dynamic route files were already using the Next.js 16 Promise pattern:
- ✅ `app/recipes/[id]/page.tsx` - Already uses `await params`
- ✅ `app/grocery-lists/[id]/page.tsx` - Already uses `await params`
- ✅ `app/recipes/spoonacular/[id]/page.tsx` - Already uses `await params`

---

## Database Schema Notes

### Current Active Plan Constraint
The schema enforces **exactly one active plan per user** via:
```sql
CREATE UNIQUE INDEX unique_active_plan_per_user
  ON meal_plans (user_id)
  WHERE is_active = true AND archived = false;
```

**Design Rationale:**
- Users have one "current" active meal plan
- Old plans are automatically deactivated when a new one is generated
- Users can still view all their plans (active or inactive)
- Prevents confusion about which plan is "current"

**Behavior:**
- ✅ User generates Plan A → `is_active: true`
- ✅ User generates Plan B → Plan A becomes `is_active: false`, Plan B becomes `is_active: true`
- ✅ User can manually activate any plan via UI (deactivates others)

---

## Migration Checklist (Still Required from Previous Analysis)

Even though the route issues are fixed, don't forget to run the database cleanup migrations:

### 🔧 Still To Do:
1. **Run in Supabase SQL Editor:**
   - `supabase/migrations/20250202_cleanup_meal_plans_policies.sql`
   - `supabase/migrations/20250202_fix_quota_insert_policy.sql`

These migrations fix:
- ✅ Duplicate INSERT policies on `meal_plans`
- ✅ Missing INSERT policy on `meal_plan_generation_quota`

**Reference:** See `SCHEMA_FIX_SUMMARY.md` for details

---

## Summary of Changes

| File | Issue | Fix |
|------|-------|-----|
| `app/meal-plans/[id]/page.tsx` | Next.js 16 params Promise | Added `await params` |
| `app/meal-plans/[id]/shopping-list/page.tsx` | Next.js 16 params Promise | Added `await params` |
| `app/actions/meal-plans.ts` | Duplicate active plan constraint | Auto-deactivate existing active plans |

---

## Expected Behavior After Fixes

### Meal Plan Generation Flow:
1. User clicks "Generate Meal Plan"
2. Backend checks quota (free: 3, paid: 100/month)
3. Backend calls Spoonacular API (with caching)
4. **Backend deactivates any existing active plans** ← NEW
5. Backend saves new plan with `is_active: true`
6. Backend saves individual meals to `meal_plan_meals` table
7. Backend increments quota counter
8. User is redirected to new meal plan details

### Navigation:
- ✅ `/meal-plans` → List all plans
- ✅ `/meal-plans/[id]` → View specific plan (with meals)
- ✅ `/meal-plans/[id]/shopping-list` → View shopping list for plan
- ✅ `/meal-plans/generate` → Generate new plan form

---

## Logs After Fix (Expected)

### ✅ Successful Generation:
```
[Subscription] User xxx has no Stripe customer ID, tier: free
[GenerateMealPlan] Calling Spoonacular API with params: { ... }
[MealPlanService] Cache miss for key: mealplan:xxx
[MealPlanService] Rate limit OK: 7/100 points
[MealPlanService] Meal plan generated successfully (day)
[GenerateMealPlan] Successfully generated meal plan for user xxx
```

### ❌ Before Fix (Error):
```
[GenerateMealPlan] Error saving meal plan: {
  code: '23505',
  message: 'duplicate key value violates unique constraint "unique_active_plan_per_user"'
}
```

---

## Testing Checklist

- [x] TypeScript compilation passes
- [ ] Generate first meal plan (should succeed)
- [ ] Generate second meal plan (should succeed, first deactivated)
- [ ] View meal plan details (no params error)
- [ ] View shopping list (no params error)
- [ ] Check database: Only 1 active plan per user
- [ ] Verify quota tracking works
- [ ] Test on multiple browsers (Edge, Chrome, Firefox)

---

## Next Steps

1. **Test the fixes** using the test plan above
2. **Run database migrations** (see `SCHEMA_FIX_SUMMARY.md`)
3. **Monitor logs** for any new errors
4. **Update documentation** if needed

---

## Related Documentation

- `SCHEMA_FIX_SUMMARY.md` - Database schema cleanup guide
- `MIGRATION_CHECKLIST.md` - Complete migration strategy
- `VERIFY_MEAL_PLANS_SCHEMA.sql` - Schema verification script
- `MEAL_PLANNING_TESTS.md` - Test coverage documentation

---

## Contact

If issues persist:
1. Check browser console (F12) for client errors
2. Check server logs for detailed error messages
3. Run `VERIFY_MEAL_PLANS_SCHEMA.sql` in Supabase
4. Share error logs and diagnostic query results
