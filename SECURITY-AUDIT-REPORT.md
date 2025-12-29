# MacroPlan Security Audit Report

**Date:** December 29, 2025
**Auditor:** Claude Code Security Review
**Application:** MacroPlan (Next.js 16 + Supabase SaaS)

---

## Executive Summary

This comprehensive security audit identified **2 critical**, **2 high**, **3 medium**, and **4 low** severity issues. The application demonstrates good security practices in authentication and database access patterns, but requires immediate attention for dependency vulnerabilities, exposed debug endpoints, and credential rotation.

> **URGENT:** If `.env.local` credentials have ever been exposed (committed to git, shared, or accessed by unauthorized parties), rotate ALL API keys immediately.

---

## CRITICAL Severity Issues

### 1. Next.js Critical Vulnerabilities (CVE Pending)
**File:** `package.json`
**Issue:** Next.js 16.0.0-16.0.8 has multiple critical vulnerabilities:
- Remote Code Execution (RCE) in React flight protocol
- Server Actions Source Code Exposure
- Denial of Service with Server Components

**Risk:** Attackers could execute arbitrary code, access server-side source code, or cause service outages.

**Fix:**
```bash
npm audit fix --force
# Or manually update to Next.js 16.1.1+
npm install next@latest
```

**Priority:** IMMEDIATE - Fix before any production deployment

---

### 2. Verify Credential Security
**File:** `.env.local`

**Issue:** Ensure production credentials have never been exposed:
- Supabase service role key (bypasses ALL RLS policies)
- Third-party API keys (FatSecret, Edamam, Spoonacular, Stripe)

**Verification Steps:**
```bash
# Check if .env.local was ever committed to git
git log --all --full-history -- .env.local
git log --all --full-history -- "*.env*"

# If any results appear, credentials were exposed
```

**If Exposed - Immediate Actions:**
1. **Rotate Supabase service role key** in Supabase Dashboard > Settings > API
2. **Rotate all third-party API keys** in their respective dashboards
3. **Rotate Stripe keys** in Stripe Dashboard
4. **Update Vercel environment variables** with new keys
5. **Audit Supabase logs** for unauthorized access

**Priority:** IMMEDIATE - Verify before production deployment

---

## HIGH Severity Issues

### 3. Unprotected Debug API Endpoints
**Files:**
- `app/api/test/route.ts:1-22`
- `app/api/debug-recipes/route.ts:1-15`

**Issue:** Two API endpoints are exposed without authentication:

1. `/api/test` - Reveals environment variable configuration status
2. `/api/debug-recipes` - Exposes all recipe IDs and names publicly

**Risk:** Information disclosure that could aid attackers in reconnaissance.

**Fix:**
```typescript
// Option 1: Delete these files if only for development
// Option 2: Add authentication check
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... rest of logic
}

// Option 3: Restrict to development only
if (process.env.NODE_ENV === 'production') {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
```

**Priority:** HIGH - Remove or secure before production

---

### 4. js-yaml Prototype Pollution (CVE-2023-44270)
**File:** `package.json` (transitive dependency)
**Issue:** js-yaml 4.0.0-4.1.0 has prototype pollution in merge (<<) functionality.

**Risk:** Could lead to denial of service or property injection attacks.

**Fix:**
```bash
npm audit fix
# Or update the affected dependency
```

**Priority:** HIGH - Fix during next deployment cycle

---

## MEDIUM Severity Issues

### 5. Missing Input Validation Schemas
**Files:** Multiple server actions in `app/actions/`

**Issue:** Several server actions lack Zod schema validation:
- `app/actions/profile.ts` - Uses TypeScript types but no runtime validation
- `app/actions/meal-plans.ts` - Partial validation
- `app/actions/grocery-lists.ts` - No Zod schemas

**Risk:** Malformed input could cause unexpected behavior or bypass business logic.

**Fix:**
```typescript
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(1).max(100),
  age: z.number().int().min(13).max(120),
  weight_kg: z.number().positive().max(500),
  // ... other fields
})

export async function updateUserProfile(data: unknown) {
  const validated = profileSchema.parse(data)
  // ... rest of logic
}
```

**Priority:** MEDIUM - Add before handling sensitive user data

---

### 6. Error Message Information Leakage
**Files:** Various server actions

**Issue:** Some error handlers expose Supabase error messages directly:
```typescript
// profile.ts:108-109
return { error: error.message }
```

**Risk:** Internal database errors could reveal schema information.

**Fix:**
```typescript
// Replace with generic messages
if (error) {
  console.error('Profile update error:', error)
  return { error: 'Failed to update profile. Please try again.' }
}
```

**Priority:** MEDIUM - Sanitize before production

---

### 7. SECURITY DEFINER Functions Without Row Validation
**File:** `supabase/migrations/20251219_most_favorited_function.sql`

**Issue:** RPC functions use `SECURITY DEFINER` which runs with elevated privileges. While the current functions don't have SQL injection risks (parameters are used in query builders), they should include input validation.

**Risk:** If RPC functions are modified in the future, they could become vulnerable.

**Fix:**
```sql
CREATE OR REPLACE FUNCTION get_most_favorited_recipes(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
...
AS $$
BEGIN
  -- Add input validation
  IF p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION 'Invalid limit parameter';
  END IF;
  IF p_offset < 0 THEN
    RAISE EXCEPTION 'Invalid offset parameter';
  END IF;
  -- ... rest of function
END;
$$;
```

**Priority:** MEDIUM - Add validation when modifying RPC functions

---

## LOW Severity Issues

### 8. Password Minimum Length Too Short
**File:** `app/actions/password-reset.ts:41`

**Issue:** Password minimum is 8 characters.
```typescript
if (!newPassword || newPassword.length < 8) {
```

**Recommendation:** NIST guidelines suggest 12+ characters minimum.

**Fix:**
```typescript
if (!newPassword || newPassword.length < 12) {
  return { error: 'Password must be at least 12 characters long' }
}
```

**Priority:** LOW - Consider during next auth refactor

---

### 9. Missing Rate Limiting on 2FA Code Requests
**File:** `app/actions/two-factor.ts:176-227`

**Issue:** `send2FAVerificationCode` doesn't have rate limiting. An attacker could spam email 2FA codes.

**Fix:**
```typescript
export async function send2FAVerificationCode(userId: string, method: 'totp' | 'email') {
  // Add rate limiting check
  const rateCheck = await check2FACodeRateLimit(userId)
  if (!rateCheck.allowed) {
    return { error: 'Too many requests. Please wait before requesting a new code.' }
  }
  // ... rest of logic
}
```

**Priority:** LOW - Implement in next security iteration

---

### 10. Console Logging of Sensitive Operations
**Files:** Various files in `lib/utils/subscription.ts`, `app/actions/`

**Issue:** User IDs and operation details are logged:
```typescript
console.log(`[Subscription] User ${userId} tier: ${hasPaidSubscription ? 'paid' : 'free'}`)
```

**Risk:** Logs could be exposed or leak PII.

**Fix:** Use structured logging with appropriate log levels and redaction:
```typescript
logger.info('Subscription check', {
  userId: hashForLogging(userId),
  tier
})
```

**Priority:** LOW - Address in logging refactor

---

### 11. Missing Stripe Webhook Signature Verification
**Files:** No webhook handler found

**Issue:** If Stripe webhooks are implemented, they need signature verification.

**Note:** Current codebase doesn't appear to have a webhook endpoint, but `lib/utils/subscription.ts:197` references "Called by Stripe webhook on invoice.paid event".

**Fix:** When implementing webhooks:
```typescript
import Stripe from 'stripe'

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!
  const body = await req.text()

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    // Handle event
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 })
  }
}
```

**Priority:** LOW - Implement when adding webhook handler

---

## Security Strengths

The application demonstrates several security best practices:

1. **Rate Limiting on Login** (`lib/security/rate-limiter.ts`)
   - Account lockout after 5 failed attempts
   - 15-minute lockout duration
   - Attempt tracking with IP/user-agent logging

2. **Two-Factor Authentication** (`app/actions/two-factor.ts`)
   - TOTP (authenticator app) support
   - Email-based 2FA option
   - Secure backup codes with hashing

3. **Password Reset Security** (`app/actions/password-reset.ts:26-27`)
   - Prevents email enumeration by always returning success

4. **Parameterized Queries**
   - All Supabase client calls use parameterized queries
   - No string concatenation in SQL

5. **File Upload Validation** (`app/actions/profile.ts:215-223`)
   - 5MB size limit
   - Mime type validation (JPEG, PNG, WebP only)

6. **Environment Variable Handling**
   - `.env.local` in `.gitignore`
   - Service role key only used in middleware
   - Sensitive keys not exposed to client

7. **Middleware Route Protection** (`middleware.ts`)
   - Proper authentication checks
   - Redirect logic for protected routes

---

## Implementation Priority Matrix

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| P0 | Update Next.js to 16.1.1+ | Low | Critical |
| P1 | Remove/secure debug API endpoints | Low | High |
| P1 | Fix js-yaml vulnerability | Low | High |
| P2 | Add Zod validation to server actions | Medium | Medium |
| P2 | Sanitize error messages | Low | Medium |
| P2 | Add RPC function input validation | Low | Medium |
| P3 | Increase password minimum length | Low | Low |
| P3 | Rate limit 2FA code requests | Medium | Low |
| P3 | Implement structured logging | Medium | Low |
| P3 | Add Stripe webhook verification | Medium | Low |

---

## Follow-Up Actions for Next Agent

### Immediate (Before Production)
1. [ ] Verify credentials haven't been exposed: `git log --all --full-history -- "*.env*"`
2. [ ] If exposed, rotate ALL API keys (Supabase, FatSecret, Edamam, Stripe)
3. [ ] Run `npm audit fix --force` to update Next.js
4. [ ] Delete or secure `app/api/test/route.ts`
5. [ ] Delete or secure `app/api/debug-recipes/route.ts`
6. [ ] Run `npm audit fix` to fix js-yaml

### Short-Term (Next Sprint)
7. [ ] Add Zod schemas to all server actions:
   - `app/actions/profile.ts`
   - `app/actions/meal-plans.ts`
   - `app/actions/grocery-lists.ts`
   - `app/actions/shopping-lists.ts`
8. [ ] Replace `error.message` returns with generic error messages
9. [ ] Add input validation to RPC functions in Supabase

### Medium-Term (Next Iteration)
10. [ ] Increase password minimum to 12 characters
11. [ ] Add rate limiting to `send2FAVerificationCode`
12. [ ] Implement structured logging with PII redaction
13. [ ] When adding Stripe webhooks, include signature verification

### Optional Enhancements
- [ ] Add Content Security Policy (CSP) headers
- [ ] Implement request signing for sensitive operations
- [ ] Add security headers (X-Frame-Options, X-Content-Type-Options)
- [ ] Consider adding API rate limiting middleware

---

## Conclusion

MacroPlan has a solid security foundation with proper authentication, database access controls, and input handling. The critical and high severity issues are primarily dependency-related and can be resolved quickly. Addressing the immediate items listed above will significantly improve the application's security posture before production deployment.

---

*Report generated by Claude Code Security Audit*
