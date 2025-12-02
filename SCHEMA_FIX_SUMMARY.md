# Meal Plans Schema - Quick Fix Guide

## 🔍 What I Found

Based on your diagnostic queries, here's what's happening:

### ✅ **Good News**
- All tables exist with correct columns
- RLS is enabled on all tables
- Foreign keys are properly configured
- No missing columns or structural issues

### ⚠️ **Issues Found**
1. **Duplicate INSERT policies** on `meal_plans` table
   - "Users can create own meal plans"
   - "Users can insert own meal plans"
   - Both do the same thing → cleanup needed

2. **Quota INSERT policy** might be missing
   - Already have a fix migration for this

## 🚀 Quick Fix (3 Steps)

### Step 1: Verify Current State
Open Supabase SQL Editor and run:
```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'meal_plans';
```

**If you see 2 INSERT policies** → proceed to Step 2

### Step 2: Run Cleanup Migration
Copy the entire content of this file and paste into Supabase SQL Editor:
```
supabase/migrations/20250202_cleanup_meal_plans_policies.sql
```

Click **RUN**

### Step 3: Fix Quota Policy
Copy the entire content of this file and paste into Supabase SQL Editor:
```
supabase/migrations/20250202_fix_quota_insert_policy.sql
```

Click **RUN**

## ✅ Verification

After running both migrations, verify:

```sql
-- Should show exactly 4 policies (SELECT, INSERT, UPDATE, DELETE)
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'meal_plans';
```

**Expected output:**
```
| policyname                       | cmd    |
|----------------------------------|--------|
| Users can view own meal plans    | SELECT |
| Users can insert own meal plans  | INSERT |
| Users can update own meal plans  | UPDATE |
| Users can delete own meal plans  | DELETE |
```

## 🧪 Test in Your App

After the fix, test meal plan generation:

1. Go to your meal plan generation page
2. Click "Generate Meal Plan"
3. Should see success message with plan details

**If you get an error**, check:
- Browser console (F12) for client errors
- Supabase logs for RLS violations
- Server logs for detailed error messages

## 📋 Complete Verification (Optional)

For a comprehensive check, run:
```
supabase/VERIFY_MEAL_PLANS_SCHEMA.sql
```

This script checks:
- ✓ All tables exist
- ✓ RLS is enabled
- ✓ No duplicate policies
- ✓ All required policies exist
- ✓ Foreign keys are configured
- ✓ Indexes are in place
- ✓ No orphaned records

## 🐛 Common Errors & Fixes

### Error: "Failed to save meal plan"
**Fix**: Run `20250202_cleanup_meal_plans_policies.sql`

### Error: "Failed to check quota"
**Fix**: Run `20250202_fix_quota_insert_policy.sql`

### Error: "Meal plan not found" after creation
**Check**: Verify SELECT policy exists with `auth.uid() = user_id`

### Error: "auth.uid() returns null" in SQL Editor
**Not an error**: This is normal when testing SQL manually. Your app will work fine because users are authenticated there.

## 📝 Files Created for You

1. **`MIGRATION_CHECKLIST.md`** - Detailed step-by-step guide
2. **`VERIFY_MEAL_PLANS_SCHEMA.sql`** - Comprehensive verification script
3. **`20250202_cleanup_meal_plans_policies.sql`** - Fixes duplicate policies
4. **`SCHEMA_FIX_SUMMARY.md`** - This file (quick reference)

## 🎯 TL;DR

**What to do right now:**
1. Open Supabase SQL Editor
2. Run `20250202_cleanup_meal_plans_policies.sql`
3. Run `20250202_fix_quota_insert_policy.sql`
4. Test meal plan generation in your app
5. If issues persist, run `VERIFY_MEAL_PLANS_SCHEMA.sql` and share results

---

## Need More Help?

If the issue persists after running these migrations, provide:
1. Exact error message from browser console
2. Error from server logs
3. Output of `VERIFY_MEAL_PLANS_SCHEMA.sql`

This will help diagnose any remaining issues.
