# Security Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all security vulnerabilities identified in the SECURITY-AUDIT-REPORT.md

**Architecture:** Apply dependency updates, remove debug endpoints, sanitize error messages, add input validation schemas, and strengthen authentication requirements.

**Tech Stack:** Next.js 16, Supabase, Zod validation, TypeScript

---

## Task 1: Update Next.js to Fix Critical CVEs

**Files:**
- Modify: `package.json`

**Step 1: Run npm audit fix --force to update Next.js**

Run: `npm audit fix --force`
Expected: Next.js updated to 16.1.1+

**Step 2: Verify the update**

Run: `npm list next`
Expected: next@16.1.1 or higher

**Step 3: Run build to verify compatibility**

Run: `npm run build`
Expected: Build completes successfully

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "fix: update Next.js to 16.1.1+ to fix critical CVEs"
```

---

## Task 2: Remove Debug API Endpoints

**Files:**
- Delete: `app/api/test/route.ts`
- Delete: `app/api/debug-recipes/route.ts`

**Step 1: Delete the debug endpoints**

Remove both files completely - they expose environment configuration status and recipe data publicly.

**Step 2: Verify deletion**

Run: `ls app/api/`
Expected: test and debug-recipes directories no longer exist

**Step 3: Commit**

```bash
git add -A app/api/test app/api/debug-recipes
git commit -m "fix: remove unprotected debug API endpoints

SECURITY: These endpoints exposed environment configuration status
and recipe data without authentication.
"
```

---

## Task 3: Fix js-yaml Vulnerability

**Files:**
- Modify: `package-lock.json` (via npm)

**Step 1: Run npm audit fix**

Run: `npm audit fix`
Expected: js-yaml updated to safe version

**Step 2: Verify fix**

Run: `npm audit`
Expected: 0 vulnerabilities (or only warnings, no moderate/high/critical)

**Step 3: Commit**

```bash
git add package-lock.json
git commit -m "fix: update js-yaml to fix prototype pollution vulnerability"
```

---

## Task 4: Sanitize Error Messages in profile.ts

**Files:**
- Modify: `app/actions/profile.ts:38-41, 108-111, 142-145, 354-357`

**Step 1: Replace exposed error messages**

Change these patterns:
```typescript
// FROM:
return { error: error.message }

// TO:
return { error: 'Failed to update profile. Please try again.' }
```

Lines to fix:
- Line 40: `return { error: error.message }` → `return { error: 'Failed to create profile. Please try again.' }`
- Line 110: `return { error: error.message }` → `return { error: 'Failed to update profile. Please try again.' }`
- Line 144: `return { error: error.message }` → `return { error: 'Failed to delete profile. Please try again.' }`
- Line 356: `return { error: error.message }` → `return { error: 'Failed to update email. Please try again.' }`

**Step 2: Verify changes compile**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/actions/profile.ts
git commit -m "fix: sanitize error messages to prevent information leakage

SECURITY: Database error details were being exposed to clients.
Now returns generic error messages while logging details server-side.
"
```

---

## Task 5: Add Zod Validation to grocery-lists.ts

**Files:**
- Modify: `app/actions/grocery-lists.ts`

**Step 1: Add Zod import and schemas at top of file**

```typescript
import { z } from 'zod'

const GenerateGroceryListSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
})

const ToggleGroceryItemSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
})

const AddCustomItemSchema = z.object({
  listId: z.string().uuid('Invalid list ID'),
  ingredient: z.string()
    .min(1, 'Ingredient is required')
    .max(200, 'Ingredient name is too long')
    .regex(/^[a-zA-Z0-9\s,.-]+$/, 'Ingredient contains invalid characters'),
  amount: z.string().max(50, 'Amount is too long').optional(),
  unit: z.string().max(30, 'Unit is too long').optional(),
  category: z.enum(['produce', 'protein', 'dairy', 'grains', 'pantry', 'other']).default('other'),
})

const DeleteGroceryItemSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
  listId: z.string().uuid('Invalid list ID'),
})

const GetGroceryListSchema = z.object({
  listId: z.string().uuid('Invalid list ID'),
})
```

**Step 2: Add validation to generateGroceryList function**

```typescript
export async function generateGroceryList(planId: string) {
  // Validate input
  const validation = GenerateGroceryListSchema.safeParse({ planId })
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }
  // ... rest of function
}
```

**Step 3: Add validation to toggleGroceryItem function**

```typescript
export async function toggleGroceryItem(itemId: string) {
  const validation = ToggleGroceryItemSchema.safeParse({ itemId })
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }
  // ... rest of function
}
```

**Step 4: Update addCustomGroceryItem with Zod validation**

Replace the manual validation with:
```typescript
export async function addCustomGroceryItem(
  listId: string,
  ingredient: string,
  amount?: string,
  unit?: string,
  category: string = 'other'
) {
  const validation = AddCustomItemSchema.safeParse({
    listId,
    ingredient,
    amount,
    unit,
    category
  })
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const validated = validation.data
  // Use validated.ingredient, validated.listId, etc. in the rest of function
  // ... rest of function
}
```

**Step 5: Add validation to deleteGroceryItem**

```typescript
export async function deleteGroceryItem(itemId: string, listId: string) {
  const validation = DeleteGroceryItemSchema.safeParse({ itemId, listId })
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }
  // ... rest of function
}
```

**Step 6: Add validation to getGroceryList**

```typescript
export async function getGroceryList(listId: string) {
  const validation = GetGroceryListSchema.safeParse({ listId })
  if (!validation.success) {
    return { error: validation.error.issues[0].message, data: null }
  }
  // ... rest of function
}
```

**Step 7: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 8: Commit**

```bash
git add app/actions/grocery-lists.ts
git commit -m "fix: add Zod validation schemas to grocery-lists.ts

SECURITY: Added runtime input validation to prevent malformed data:
- UUID validation for all ID parameters
- String length limits on ingredient names
- Character allowlist for ingredient names
- Enum validation for category
"
```

---

## Task 6: Increase Password Minimum Length

**Files:**
- Modify: `app/actions/password-reset.ts:41`

**Step 1: Update password minimum from 8 to 12 characters**

```typescript
// FROM:
if (!newPassword || newPassword.length < 8) {
  return { error: 'Password must be at least 8 characters long' }
}

// TO:
if (!newPassword || newPassword.length < 12) {
  return { error: 'Password must be at least 12 characters long' }
}
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/actions/password-reset.ts
git commit -m "fix: increase password minimum length to 12 characters

SECURITY: Updated to align with NIST guidelines recommending
12+ character passwords for better security.
"
```

---

## Task 7: Add Rate Limiting to 2FA Code Requests

**Files:**
- Create: `lib/security/two-factor-rate-limit.ts`
- Modify: `app/actions/two-factor.ts:176-227`

**Step 1: Create rate limiting helper**

Create `lib/security/two-factor-rate-limit.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'

const TWO_FA_CODE_RATE_LIMIT = 3 // Max 3 code requests
const TWO_FA_CODE_WINDOW_MINUTES = 15 // Per 15 minute window

/**
 * Check if user can request another 2FA code
 */
export async function check2FACodeRateLimit(userId: string): Promise<{
  allowed: boolean
  remaining: number
  resetAt?: Date
}> {
  const supabase = await createClient()
  const windowStart = new Date()
  windowStart.setMinutes(windowStart.getMinutes() - TWO_FA_CODE_WINDOW_MINUTES)

  // Count recent code requests
  const { count, error } = await supabase
    .from('pending_2fa_verification')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', windowStart.toISOString())

  if (error) {
    console.error('Error checking 2FA rate limit:', error)
    // Allow on error to prevent lockout, but log for monitoring
    return { allowed: true, remaining: TWO_FA_CODE_RATE_LIMIT }
  }

  const requestCount = count || 0
  const remaining = Math.max(0, TWO_FA_CODE_RATE_LIMIT - requestCount)
  const allowed = requestCount < TWO_FA_CODE_RATE_LIMIT

  const resetAt = new Date(windowStart)
  resetAt.setMinutes(resetAt.getMinutes() + TWO_FA_CODE_WINDOW_MINUTES)

  return { allowed, remaining, resetAt }
}
```

**Step 2: Update send2FAVerificationCode to use rate limiting**

In `app/actions/two-factor.ts`, add import and rate check:

```typescript
import { check2FACodeRateLimit } from '@/lib/security/two-factor-rate-limit'

export async function send2FAVerificationCode(
  userId: string,
  method: 'totp' | 'email'
): Promise<{
  success?: boolean
  error?: string
}> {
  // Add rate limiting check
  const rateCheck = await check2FACodeRateLimit(userId)
  if (!rateCheck.allowed) {
    return {
      error: `Too many code requests. Please wait ${rateCheck.resetAt ? Math.ceil((rateCheck.resetAt.getTime() - Date.now()) / 60000) : 15} minutes.`
    }
  }

  const supabase = await createClient()
  // ... rest of existing function
}
```

**Step 3: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add lib/security/two-factor-rate-limit.ts app/actions/two-factor.ts
git commit -m "fix: add rate limiting to 2FA code requests

SECURITY: Prevents abuse by limiting 2FA code requests to
3 per 15-minute window per user.
"
```

---

## Task 8: Final Verification

**Step 1: Run full build**

Run: `npm run build`
Expected: Build completes successfully

**Step 2: Run tests**

Run: `npm run test`
Expected: All tests pass

**Step 3: Run security audit**

Run: `npm audit`
Expected: 0 high/critical vulnerabilities

**Step 4: Final commit if any cleanup needed**

---

## Summary of Security Fixes

| Priority | Issue | Status |
|----------|-------|--------|
| P0 | Update Next.js to 16.1.1+ | Task 1 |
| P1 | Remove debug API endpoints | Task 2 |
| P1 | Fix js-yaml vulnerability | Task 3 |
| P2 | Sanitize error messages | Task 4 |
| P2 | Add Zod validation | Task 5 |
| P3 | Increase password min length | Task 6 |
| P3 | Rate limit 2FA requests | Task 7 |
