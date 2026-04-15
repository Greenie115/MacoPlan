# Phase 3 + Cleanup: Commit Unstaged Work, SEO Enhancements, Stripe Finalization

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Commit all existing unstaged/untracked work (console cleanup, new Stripe features, blog/landing components, bug fixes), then implement remaining SEO items (JSON-LD structured data, canonical URLs), and finalize Stripe readiness.

**Architecture:** Logical grouping of existing changes into clean commits, then additive SEO enhancements to existing pages. No refactoring.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase, Stripe

---

### Task 1: Commit console.log cleanup + code quality improvements

**Context:** ~18 files had console.log/error statements removed for production readiness. These are already modified but unstaged.

**Files:**
- Modified: `lib/services/fatsecret.ts`
- Modified: `lib/services/fatsecret-meal-plans.ts`
- Modified: `lib/services/plan-service.ts`
- Modified: `lib/cache/recipe-cache.ts`
- Modified: `lib/cache/session-cache.ts`
- Modified: `lib/hooks/use-recipe-cache.ts`
- Modified: `lib/security/email-2fa.ts`
- Modified: `lib/security/rate-limiter.ts`
- Modified: `lib/utils/filter-validation.ts`
- Modified: `app/actions/dashboard.ts`
- Modified: `app/actions/meal-logs.ts`
- Modified: `app/actions/meal-plans.ts`
- Modified: `app/actions/recipe-tracking.ts`
- Modified: `app/actions/shopping-lists.ts`
- Modified: `app/recipes/actions.ts`
- Modified: `app/profile/page.tsx`
- Modified: `app/profile/editprofile/page.tsx`
- Modified: `components/recipes/recipe-results-client.tsx`

**Step 1: Stage and commit all console cleanup files**

```bash
git add lib/services/fatsecret.ts lib/services/fatsecret-meal-plans.ts lib/services/plan-service.ts lib/cache/recipe-cache.ts lib/cache/session-cache.ts lib/hooks/use-recipe-cache.ts lib/security/email-2fa.ts lib/security/rate-limiter.ts lib/utils/filter-validation.ts app/actions/dashboard.ts app/actions/meal-logs.ts app/actions/meal-plans.ts app/actions/recipe-tracking.ts app/actions/shopping-lists.ts app/recipes/actions.ts app/profile/page.tsx app/profile/editprofile/page.tsx components/recipes/recipe-results-client.tsx
```

Commit message:
```
chore: remove console.log/error statements for production readiness

Strip debug logging from services, actions, and components.
Server-side errors are still logged where critical for debugging.
```

---

### Task 2: Commit bug fixes and security improvements

**Context:** Several files have bug fixes and security improvements already applied but not committed.

**Files:**
- Modified: `app/login/verify-2fa/page.tsx` — Better session cleanup, redirect on failure
- Modified: `app/(auth)/onboarding/2/page.tsx` — ESLint comment improvement
- Modified: `app/(auth)/onboarding/3/page.tsx` — ESLint comment improvement
- Modified: `app/(auth)/onboarding/4/page.tsx` — ESLint comment improvement
- Modified: `app/(auth)/onboarding/5/page.tsx` — ESLint comment improvement
- Modified: `app/(auth)/onboarding/6/page.tsx` — localStorage SSR safety fix
- Modified: `app/meal-plans/_components/meal-plans-client.tsx` — Image alt text accessibility
- Modified: `scripts/seed-plans.ts` — Production guard + env var for password
- Deleted: `components/onboarding/skip-onboarding-dev.tsx` — Remove dev-only component

**Step 1: Stage and commit**

```bash
git add app/login/verify-2fa/page.tsx app/(auth)/onboarding/2/page.tsx app/(auth)/onboarding/3/page.tsx app/(auth)/onboarding/4/page.tsx app/(auth)/onboarding/5/page.tsx app/(auth)/onboarding/6/page.tsx app/meal-plans/_components/meal-plans-client.tsx scripts/seed-plans.ts components/onboarding/skip-onboarding-dev.tsx
```

Commit message:
```
fix: security and accessibility improvements

- Improve 2FA page session cleanup and error handling
- Add localStorage SSR safety check in onboarding step 6
- Add descriptive alt text to meal plan images
- Add production guard to seed script
- Remove dev-only skip-onboarding component
```

---

### Task 3: Commit new Stripe feature files

**Context:** Complete Stripe subscription integration exists as untracked files.

**Files:**
- Create (untracked): `app/actions/stripe.ts` — Checkout, portal, subscription info
- Create (untracked): `components/dashboard/subscription-badge.tsx` — Subscription UI
- Create (untracked): `app/checkout/success/page.tsx` — Post-checkout success
- Create (untracked): `app/checkout/cancel/page.tsx` — Checkout cancel page
- Create (untracked): `__tests__/stripe/checkout.test.ts` — Checkout tests
- Create (untracked): `__tests__/stripe/webhook.test.ts` — Webhook tests

**Step 1: Stage and commit**

```bash
git add app/actions/stripe.ts components/dashboard/subscription-badge.tsx app/checkout/success/page.tsx app/checkout/cancel/page.tsx __tests__/stripe/checkout.test.ts __tests__/stripe/webhook.test.ts
```

Commit message:
```
feat: add Stripe subscription integration

- Checkout session creation (monthly/annual plans)
- Customer portal for subscription management
- Subscription info retrieval with plan detection
- Subscription badge component for dashboard
- Checkout success and cancel pages
- Test stubs for checkout and webhook handlers
```

---

### Task 4: Commit blog components and landing page components

**Context:** Complete blog UI and landing page component libraries exist as untracked files.

**Files:**
- Create (untracked): `components/blog/BlogHeader.tsx`
- Create (untracked): `components/blog/FeaturedPost.tsx`
- Create (untracked): `components/blog/BlogCard.tsx`
- Create (untracked): `components/blog/BlogGrid.tsx`
- Create (untracked): `components/blog/CategoryFilter.tsx`
- Create (untracked): `components/blog/AuthorBio.tsx`
- Create (untracked): `components/blog/ShareButtons.tsx`
- Create (untracked): `components/blog/EmailCapture.tsx`
- Create (untracked): `components/blog/BlogSidebar.tsx`
- Create (untracked): `components/blog/index.ts`
- Create (untracked): `components/landing/` (all 19 files)

**Step 1: Stage and commit blog components**

```bash
git add components/blog/
```

Commit message:
```
feat: add blog UI component library

Blog components for SEO content: header, grid, cards,
featured post, category filter, author bio, share buttons,
email capture, sidebar, and barrel exports.
```

**Step 2: Stage and commit landing page components**

```bash
git add components/landing/
```

Commit message:
```
feat: add landing page component library

Landing page sections: hero demo, problem/solution cards,
testimonials, how-it-works, pricing preview, comparison table,
FAQ, ratings carousel, success stories, quiz CTA, blog preview,
recipe callout, trust bar, interactive demo, browser mockup, footer.
```

---

### Task 5: Commit config and remaining files

**Context:** CSS animation, cookie consent, gitignore updates.

**Files:**
- Modified: `app/globals.css` — slideUp animation for cookie consent
- Create (untracked): `components/cookie-consent.tsx` — Cookie consent banner
- Modified: `.gitignore` — Add `.auto-claude/`

**Step 1: Stage and commit**

```bash
git add app/globals.css components/cookie-consent.tsx .gitignore
```

Commit message:
```
feat: add cookie consent banner and update gitignore

- Cookie consent component with accept/reject options
- slideUp CSS animation for consent banner
- Add .auto-claude/ to gitignore
```

---

### Task 6: Add JSON-LD structured data to blog posts

**Context:** Homepage has JSON-LD but blog posts and recipe pages don't.

**Files:**
- Modify: `app/blog/[slug]/page.tsx` — Add Article JSON-LD schema

**Step 1: Add JSON-LD to blog post page**

In `app/blog/[slug]/page.tsx`, add a `jsonLd` object inside the `BlogPostPage` component (after the `baseUrl` declaration around line 60) and render it as a `<script type="application/ld+json">` tag at the top of the JSX return.

The JSON-LD schema should be:
```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.title,
  description: post.excerpt,
  image: post.image,
  datePublished: post.date,
  author: {
    '@type': 'Person',
    name: post.author,
  },
  publisher: {
    '@type': 'Organization',
    name: 'MacroPlan',
    url: baseUrl,
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${baseUrl}/blog/${post.slug}`,
  },
}
```

Add to JSX return, before all other content:
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

**Step 2: Run type check**

```bash
npx tsc --noEmit
```

Expected: no errors

**Step 3: Commit**

```bash
git add app/blog/[slug]/page.tsx
git commit -m "feat: add Article JSON-LD structured data to blog posts"
```

---

### Task 7: Add JSON-LD structured data to recipe pages

**Context:** Recipe detail pages have metadata but no JSON-LD.

**Files:**
- Modify: `app/recipes/[id]/page.tsx` — Add Recipe JSON-LD schema

**Step 1: Add JSON-LD to recipe page**

In `app/recipes/[id]/page.tsx`, inside the `RecipePage` component, after the recipe data is fetched and validated (after the `const recipe` assignment), add a `jsonLd` object for recipe structured data.

The recipe data is typed as `RecipeWithDetails` which has fields: `title`, `description`, `prep_time`, `cook_time`, `servings`, `calories`, `protein`, `carbs`, `fat`, `ingredients` (array of objects with `name` and `amount`), `instructions` (array of objects with `step_number` and `instruction`).

```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Recipe',
  name: recipe.title,
  description: recipe.description || `Recipe for ${recipe.title}`,
  prepTime: recipe.prep_time ? `PT${recipe.prep_time}M` : undefined,
  cookTime: recipe.cook_time ? `PT${recipe.cook_time}M` : undefined,
  recipeYield: recipe.servings ? `${recipe.servings} servings` : undefined,
  nutrition: {
    '@type': 'NutritionInformation',
    calories: recipe.calories ? `${recipe.calories} calories` : undefined,
    proteinContent: recipe.protein ? `${recipe.protein}g` : undefined,
    carbohydrateContent: recipe.carbs ? `${recipe.carbs}g` : undefined,
    fatContent: recipe.fat ? `${recipe.fat}g` : undefined,
  },
  recipeIngredient: recipe.ingredients?.map(
    (i: { name: string; amount: string }) => `${i.amount} ${i.name}`
  ),
  recipeInstructions: recipe.instructions?.map(
    (step: { step_number: number; instruction: string }) => ({
      '@type': 'HowToStep',
      position: step.step_number,
      text: step.instruction,
    })
  ),
}
```

Add `<script type="application/ld+json">` at top of JSX return, same pattern as blog.

**Important:** Check the actual `RecipeWithDetails` type in `lib/types/recipe.ts` first to confirm field names match. The `ingredients` and `instructions` field structures may differ — adapt the JSON-LD mapping accordingly.

**Step 2: Run type check**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add app/recipes/[id]/page.tsx
git commit -m "feat: add Recipe JSON-LD structured data to recipe pages"
```

---

### Task 8: Add canonical URLs to all public pages

**Context:** No canonical URLs are set. They prevent duplicate content issues with search engines.

**Files:**
- Modify: `app/layout.tsx` — Not needed (metadataBase already set, Next.js uses it)
- Modify: `app/page.tsx` — Add alternates.canonical
- Modify: `app/blog/page.tsx` — Add alternates.canonical
- Modify: `app/blog/[slug]/page.tsx` — Add alternates.canonical (dynamic)
- Modify: `app/pricing/layout.tsx` — Add alternates.canonical
- Modify: `app/login/layout.tsx` — Add alternates.canonical
- Modify: `app/signup/layout.tsx` — Add alternates.canonical
- Modify: `app/help/page.tsx` — Add alternates.canonical
- Modify: `app/recipes/[id]/page.tsx` — Add alternates.canonical (dynamic)

**Step 1: Add canonical to static pages**

For each static page's metadata, add the `alternates` property:

`app/page.tsx`:
```typescript
alternates: {
  canonical: '/',
},
```

`app/blog/page.tsx`:
```typescript
alternates: {
  canonical: '/blog',
},
```

`app/pricing/layout.tsx`:
```typescript
alternates: {
  canonical: '/pricing',
},
```

`app/login/layout.tsx`:
```typescript
alternates: {
  canonical: '/login',
},
```

`app/signup/layout.tsx`:
```typescript
alternates: {
  canonical: '/signup',
},
```

`app/help/page.tsx`:
```typescript
alternates: {
  canonical: '/help',
},
```

**Step 2: Add canonical to dynamic pages**

`app/blog/[slug]/page.tsx` — In the `generateMetadata` return object, add:
```typescript
alternates: {
  canonical: `/blog/${slug}`,
},
```

`app/recipes/[id]/page.tsx` — In the `generateMetadata` return object, add:
```typescript
alternates: {
  canonical: `/recipes/${validationResult.data.id}`,
},
```

**Step 3: Run type check**

```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add app/page.tsx app/blog/page.tsx app/blog/[slug]/page.tsx app/pricing/layout.tsx app/login/layout.tsx app/signup/layout.tsx app/help/page.tsx app/recipes/[id]/page.tsx
git commit -m "feat: add canonical URLs to all public pages for SEO"
```

---

### Task 9: Add checkout page metadata

**Context:** The checkout success and cancel pages need metadata and should be excluded from indexing.

**Files:**
- Create: `app/checkout/layout.tsx` — Metadata for checkout flow

**Step 1: Create checkout layout with noindex metadata**

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout',
  robots: {
    index: false,
    follow: false,
  },
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
```

**Step 2: Run type check**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add app/checkout/layout.tsx
git commit -m "feat: add noindex metadata to checkout pages"
```

---

### Task 10: Final verification

**Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors

**Step 2: Run build**

```bash
npm run build
```

Expected: Build succeeds, all routes listed

**Step 3: Run tests**

```bash
npm run test
```

Expected: All tests pass (91+)

**Step 4: Verify git is clean**

```bash
git status
```

Expected: Only untracked local dev files remain (`.claude/`, `.claude_settings.json`, `.playwright-mcp/`, `docs/plans/`)

---

### Post-Plan: Manual Steps (Not Automated)

These require manual action in external services:

1. **Run Stripe DB migration** — Copy `supabase/migrations/20260309_add_stripe_subscription_fields.sql` to Supabase SQL Editor and execute
2. **Create Stripe products** — In Stripe Dashboard, create Monthly ($9.99) and Annual ($79.99) subscription products
3. **Set environment variables** — Fill in `.env.local` with Stripe keys, price IDs, webhook secret
4. **Register webhook endpoint** — In Stripe Dashboard → Webhooks, add `https://your-domain/api/webhooks/stripe`
5. **Configure Customer Portal** — In Stripe Dashboard → Settings → Customer Portal
6. **Deploy to Vercel** — Connect GitHub repo, set environment variables, deploy
