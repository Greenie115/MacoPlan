# Security Review Report - MacroPlan
**Date:** 2025-11-25
**Reviewer:** Claude Code Security Review
**Codebase Version:** main branch (commit 804f79d)

## Executive Summary

MacroPlan demonstrates **strong security practices** overall with proper authentication, authorization, and data validation patterns. The codebase follows Next.js 14/16 and Supabase best practices with Row Level Security (RLS) policies properly implemented.

**Overall Security Rating:** ✅ **GOOD** - Production-ready with minor improvements recommended

---

## ✅ Positive Findings

### 1. **Excellent Row Level Security (RLS) Implementation**
- All user tables have proper RLS policies enabled
- Policies correctly use `auth.uid() = user_id` pattern
- Users can ONLY access their own data (meals, profiles, favorites)
- Recipe data is properly public (read-only)

**Files:**
- `supabase/migrations/001_create_user_profiles.sql:59-78`
- `supabase/migrations/20251125_create_logged_meals.sql:38-55`
- `supabase/migrations/20251118123008_create_recipes_schema.sql:78-112`

### 2. **Proper Authentication Validation**
- All server actions check authentication before operations
- Consistent pattern: `supabase.auth.getUser()` → check `authError || !user`
- No operations proceed without valid authentication

**Files:**
- `app/actions/meal-logs.ts:14-23` (logMeal)
- `app/actions/profile.ts:10-22` (createUserProfile)
- `app/recipes/actions.ts:21-31` (toggleFavorite)

### 3. **Strong Input Validation**
- Zod schemas used for complex validation (UUID format)
- Numeric bounds checking (calories, protein, etc.)
- String length validation (meal names < 100 chars)
- Type safety with TypeScript strict mode

**Files:**
- `app/actions/meal-logs.ts:8-9` (recipeIdSchema)
- `app/actions/meal-logs.ts:25-50` (nutritional validation)
- `app/recipes/actions.ts:7-8` (recipeIdSchema)

### 4. **Secure Middleware Implementation**
- Uses `SUPABASE_SERVICE_ROLE_KEY` only in middleware (correct usage)
- Proper route protection (public vs. protected routes)
- Automatic auth token refresh
- Prevents authenticated users from accessing auth pages

**Files:**
- `middleware.ts:1-47`
- `lib/supabase/middleware.ts:4-38`

### 5. **No Sensitive Data Exposure**
- Environment variables properly templated (`.env.local.example`)
- Generic error messages returned to clients
- Detailed errors only in server-side console.error
- No database errors leaked to frontend

### 6. **SQL Injection Protection**
- Supabase client uses parameterized queries
- No raw SQL concatenation in application code
- `.eq()`, `.insert()`, `.update()` methods prevent injection

---

## 🟡 Medium Priority Recommendations

### 1. **Add Rate Limiting for Server Actions**

**Current State:** No rate limiting on server actions
**Risk:** Potential for abuse (spam meal logging, favorite toggling)
**Impact:** Medium - Could lead to database overload or abuse

**Recommendation:**
```typescript
// Example using Upstash Redis or Vercel KV
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
})

export async function logMeal(input: LogMealInput, recipeId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Authentication required' }

  // Rate limit check
  const { success } = await ratelimit.limit(user.id)
  if (!success) {
    return { error: 'Too many requests. Please try again later.' }
  }

  // ... rest of function
}
```

**Priority:** Medium
**Affected Files:** All files in `app/actions/`

---

### 2. **Missing Input Sanitization for XSS**

**Current State:** User inputs are validated but not sanitized for HTML/script content
**Risk:** Potential XSS if meal names/descriptions contain malicious scripts
**Impact:** Medium - Could affect other users if data is shared (future feature)

**Recommendation:**
```typescript
import DOMPurify from 'isomorphic-dompurify'

// Sanitize user inputs before storing
export async function logMeal(input: LogMealInput, recipeId?: string) {
  // ... auth check

  const sanitizedName = DOMPurify.sanitize(input.name.trim())
  const sanitizedDescription = input.description
    ? DOMPurify.sanitize(input.description.trim())
    : null

  const { data, error } = await supabase
    .from('logged_meals')
    .insert({
      name: sanitizedName,
      description: sanitizedDescription,
      // ...
    })
}
```

**Install:** `npm install isomorphic-dompurify`

**Priority:** Medium (becomes HIGH if you add social features)
**Affected Files:**
- `app/actions/meal-logs.ts:59` (meal name)
- `app/actions/meal-logs.ts:66` (meal description)

---

### 3. **Middleware Error Handling**

**Current State:** Middleware doesn't handle Supabase errors gracefully
**Risk:** Could crash middleware on Supabase outage
**Impact:** Medium - Users would see generic Next.js error page

**Recommendation:**
```typescript
// lib/supabase/middleware.ts
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  try {
    const supabase = createServerClient(/* ... */)
    const { data: { user } } = await supabase.auth.getUser()
    return { response, user }
  } catch (error) {
    console.error('Middleware auth error:', error)
    // Return response without user (will trigger redirect in main middleware)
    return { response, user: null }
  }
}
```

**Priority:** Medium
**Affected Files:** `lib/supabase/middleware.ts:4-38`

---

### 4. **Missing CSRF Protection for State-Changing Operations**

**Current State:** Server actions don't explicitly validate CSRF tokens (relies on Next.js defaults)
**Risk:** Low-Medium - Next.js has built-in CSRF protection, but explicit validation is better
**Impact:** Medium in worst case (session hijacking)

**Recommendation:**
```typescript
// Add CSRF token validation for critical operations
// Next.js Server Actions have built-in CSRF protection via Origin header checks
// But for extra security on critical actions:

import { headers } from 'next/headers'

async function validateRequest() {
  const headersList = await headers()
  const origin = headersList.get('origin')
  const host = headersList.get('host')

  if (!origin || !origin.includes(host)) {
    return { valid: false, error: 'Invalid request origin' }
  }

  return { valid: true }
}

// Use in critical actions like deleteMealLog, deleteUserProfile
```

**Priority:** Medium (for critical delete operations)
**Affected Files:**
- `app/actions/meal-logs.ts:204` (deleteMealLog)
- `app/actions/profile.ts:113` (deleteUserProfile)

---

## 🟢 Low Priority Improvements

### 1. **Add Security Headers**

**Recommendation:** Add security headers in `next.config.js`:
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}
```

**Priority:** Low (Vercel adds many of these by default)

---

### 2. **Add Content Security Policy (CSP)**

**Current State:** No CSP headers configured
**Recommendation:** Add CSP for additional XSS protection

```javascript
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ]
  },
}
```

**Priority:** Low (nice to have)

---

### 3. **Add Logging and Monitoring**

**Recommendation:** Add structured logging for security events:
```typescript
// lib/logger.ts
export function logSecurityEvent(event: {
  type: 'auth_failure' | 'rate_limit' | 'invalid_input'
  userId?: string
  details: string
}) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    severity: 'WARNING',
    ...event
  }))
}

// Usage in server actions
if (authError || !user) {
  logSecurityEvent({
    type: 'auth_failure',
    details: 'Unauthenticated meal log attempt'
  })
  return { error: 'Authentication required' }
}
```

**Priority:** Low (but useful for production monitoring)

---

## 🔒 Security Checklist

| Category | Status | Notes |
|----------|--------|-------|
| **Authentication** | ✅ Excellent | Proper auth checks in all server actions |
| **Authorization** | ✅ Excellent | RLS policies properly implemented |
| **Input Validation** | ✅ Good | Zod validation, bounds checking |
| **SQL Injection** | ✅ Excellent | Parameterized queries via Supabase |
| **XSS Protection** | 🟡 Good | Needs sanitization for user-generated content |
| **CSRF Protection** | ✅ Good | Next.js built-in protection |
| **Rate Limiting** | 🟡 Missing | Recommended for production |
| **Error Handling** | ✅ Good | Generic errors to client, detailed logs server-side |
| **Session Management** | ✅ Excellent | Supabase handles tokens securely |
| **Data Isolation** | ✅ Excellent | RLS ensures users only see their data |

---

## 📋 Action Items for Production

### Before Launch:
1. ✅ **DONE** - All RLS policies in place
2. ✅ **DONE** - All server actions validate auth
3. ✅ **DONE** - Environment variables documented
4. 🟡 **TODO** - Add rate limiting (Medium priority)
5. 🟡 **TODO** - Add input sanitization (Medium priority)
6. 🟢 **OPTIONAL** - Add security headers
7. 🟢 **OPTIONAL** - Add CSP
8. 🟢 **OPTIONAL** - Set up security monitoring

### Post-Launch Monitoring:
- Monitor Supabase logs for auth failures
- Track rate limit violations if implemented
- Monitor for unusual data access patterns

---

## Conclusion

**The MacroPlan codebase is secure and follows best practices.** The authentication and authorization implementation is excellent, with proper RLS policies and input validation. The recommended improvements are primarily preventative measures for production scale and edge cases.

**Security Status:** ✅ **PRODUCTION READY** with the understanding that rate limiting should be added before significant user growth.

**No critical vulnerabilities found.**
