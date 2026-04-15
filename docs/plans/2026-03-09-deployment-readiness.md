# Deployment Readiness — Phase 1 Blockers

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all blockers preventing production deployment to Vercel — SEO foundation, error pages, security headers, Stripe DB schema, webhook idempotency, and blog safety.

**Architecture:** All changes are additive (new files or appending to existing config). No refactoring of existing features. Metadata is added via layout.tsx files for client-component pages, or directly on server-component pages. Stripe schema changes are SQL migration files to be applied in Supabase dashboard.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase, Stripe

---

### Task 1: Create sitemap.ts

**Files:**
- Create: `app/sitemap.ts`

**Step 1: Create the sitemap file**

```typescript
import type { MetadataRoute } from 'next'
import { blogPosts } from '@/lib/blog-data'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://macroplan.vercel.app'

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...blogRoutes]
}
```

**Step 2: Verify build succeeds**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/sitemap.ts
git commit -m "feat: add dynamic sitemap for SEO"
```

---

### Task 2: Create robots.ts

**Files:**
- Create: `app/robots.ts`

**Step 1: Create the robots file**

```typescript
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://macroplan.vercel.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/blog', '/blog/*', '/pricing'],
        disallow: [
          '/dashboard',
          '/profile',
          '/meal-plans',
          '/recipes',
          '/onboarding',
          '/checkout',
          '/api',
          '/auth',
          '/help',
          '/forgot-password',
          '/reset-password',
          '/login/verify-2fa',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

**Step 2: Verify build succeeds**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/robots.ts
git commit -m "feat: add robots.ts to control search engine crawling"
```

---

### Task 3: Enhance root layout metadata

**Files:**
- Modify: `app/layout.tsx`

**Step 1: Update the metadata export**

Replace the existing `metadata` export (lines 18-21) with:

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://macroplan.vercel.app'),
  title: {
    default: 'MacroPlan - Smart Meal Planning & Macro Tracking',
    template: '%s | MacroPlan',
  },
  description: 'Stop wasting hours on meal prep. MacroPlan generates personalized meal plans that hit your exact macros instantly. Join 10,000+ users eating better with less effort.',
  keywords: ['meal planning', 'macro calculator', 'nutrition', 'diet', 'fitness', 'personalized meal plans', 'healthy eating', 'macro tracking'],
  openGraph: {
    type: 'website',
    siteName: 'MacroPlan',
    title: 'MacroPlan - Smart Meal Planning & Macro Tracking',
    description: 'Stop wasting hours on meal prep. MacroPlan generates personalized meal plans that hit your exact macros instantly.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MacroPlan - Smart Meal Planning & Macro Tracking',
    description: 'Stop wasting hours on meal prep. MacroPlan generates personalized meal plans that hit your exact macros instantly.',
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

**Step 2: Verify build succeeds**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: enhance root metadata with Open Graph, Twitter cards, and template"
```

---

### Task 4: Add metadata to public pages via layout.tsx files

Since login, signup, forgot-password, pricing, and dashboard pages are client components (`'use client'`), they cannot export metadata directly. Create layout.tsx files in each directory.

**Files:**
- Create: `app/login/layout.tsx`
- Create: `app/signup/layout.tsx`
- Create: `app/forgot-password/layout.tsx`
- Create: `app/pricing/layout.tsx`
- Create: `app/dashboard/layout.tsx`
- Create: `app/profile/layout.tsx`

**Step 1: Create all layout files**

`app/login/layout.tsx`:
```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Log in to your MacroPlan account to access your personalized meal plans and macro tracking.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
```

`app/signup/layout.tsx`:
```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your free MacroPlan account and get personalized meal plans that hit your macros perfectly.',
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children
}
```

`app/forgot-password/layout.tsx`:
```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your MacroPlan account password.',
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}
```

`app/pricing/layout.tsx`:
```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Choose the MacroPlan subscription that fits your goals. Free and premium plans available with personalized meal planning.',
  openGraph: {
    title: 'MacroPlan Pricing - Plans for Every Goal',
    description: 'Choose the MacroPlan subscription that fits your goals. Free and premium plans available.',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
```

`app/dashboard/layout.tsx`:
```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your MacroPlan dashboard — track macros, view meal plans, and monitor your nutrition progress.',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
```

`app/profile/layout.tsx`:
```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your MacroPlan profile settings and preferences.',
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
```

**Step 2: Verify build succeeds**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/login/layout.tsx app/signup/layout.tsx app/forgot-password/layout.tsx app/pricing/layout.tsx app/dashboard/layout.tsx app/profile/layout.tsx
git commit -m "feat: add metadata to all public/auth pages via layout files"
```

---

### Task 5: Add metadata to server-component pages

**Files:**
- Modify: `app/blog/page.tsx` (add metadata export)
- Modify: `app/blog/[slug]/page.tsx` (add generateMetadata)
- Modify: `app/help/page.tsx` (add metadata export)
- Modify: `app/recipes/[id]/page.tsx` (add generateMetadata)

**Step 1: Add metadata to blog index**

At top of `app/blog/page.tsx`, after imports, add:

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Expert nutrition tips, meal planning guides, and macro tracking advice from the MacroPlan team.',
  openGraph: {
    title: 'MacroPlan Blog - Nutrition Tips & Meal Planning Guides',
    description: 'Expert nutrition tips, meal planning guides, and macro tracking advice.',
  },
}
```

**Step 2: Add generateMetadata to blog post page**

At top of `app/blog/[slug]/page.tsx`, after the imports and interface, add:

```typescript
import type { Metadata } from 'next'

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    return { title: 'Post Not Found' }
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: post.image ? [{ url: post.image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  }
}
```

Also fix the hardcoded URL on line 32:
```typescript
// Replace:
const postUrl = `https://macroplan.com/blog/${post.slug}`
// With:
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://macroplan.vercel.app'
const postUrl = `${baseUrl}/blog/${post.slug}`
```

**Step 3: Add metadata to help page**

At top of `app/help/page.tsx`, after imports, add:

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help Center',
  description: 'Get help with your MacroPlan account, meal plans, and macro tracking.',
}
```

**Step 4: Add generateMetadata to recipe detail page**

At top of `app/recipes/[id]/page.tsx`, after imports and before the component, add:

```typescript
import type { Metadata } from 'next'

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { id } = await params
  const validationResult = recipeParamsSchema.safeParse({ id })
  if (!validationResult.success) {
    return { title: 'Recipe Not Found' }
  }

  const supabase = await createClient()
  const { data: recipe } = await supabase
    .from('recipes')
    .select('title, description')
    .eq('id', validationResult.data.id)
    .single()

  if (!recipe) {
    return { title: 'Recipe Not Found' }
  }

  return {
    title: recipe.title,
    description: recipe.description || `View the full recipe for ${recipe.title} with nutritional information and macro breakdown.`,
  }
}
```

**Step 5: Verify build succeeds**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 6: Commit**

```bash
git add app/blog/page.tsx app/blog/[slug]/page.tsx app/help/page.tsx app/recipes/[id]/page.tsx
git commit -m "feat: add dynamic metadata to blog, help, and recipe pages"
```

---

### Task 6: Create root error pages

**Files:**
- Create: `app/not-found.tsx`
- Create: `app/error.tsx`
- Create: `app/global-error.tsx`

**Step 1: Create 404 page**

`app/not-found.tsx`:
```typescript
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="text-8xl font-bold text-primary/20">404</div>
        <h1 className="text-3xl font-bold text-foreground">Page not found</h1>
        <p className="text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl border border-border text-foreground font-semibold hover:bg-accent transition-colors"
          >
            Read Blog
          </Link>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Create root error boundary**

`app/error.tsx`:
```typescript
'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
        <p className="text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
```

**Step 3: Create global error boundary**

`app/global-error.tsx`:
```typescript
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{ maxWidth: '28rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              A critical error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
```

**Step 4: Verify build succeeds**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add app/not-found.tsx app/error.tsx app/global-error.tsx
git commit -m "feat: add root 404, error, and global-error pages"
```

---

### Task 7: Add security headers (CSP + HSTS)

**Files:**
- Modify: `next.config.ts` (lines 8-14, add to headers array)

**Step 1: Add CSP and HSTS headers**

In `next.config.ts`, add these two entries to the headers array (after the Permissions-Policy line):

```typescript
{
  key: 'Strict-Transport-Security',
  value: 'max-age=63072000; includeSubDomains; preload',
},
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://platform.fatsecret.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; '),
},
```

**Step 2: Verify build succeeds**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat: add HSTS and Content-Security-Policy headers"
```

---

### Task 8: Stripe database migration — add missing columns

**Files:**
- Create: `supabase/migrations/20260309_add_stripe_subscription_fields.sql`

**Step 1: Create the migration file**

```sql
-- Add missing Stripe subscription columns to user_profiles
-- These are referenced by the webhook handler but may not exist yet

-- Add subscription tracking columns (idempotent with IF NOT EXISTS pattern)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN stripe_subscription_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN subscription_status TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'subscription_period_end'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN subscription_period_end TIMESTAMPTZ;
  END IF;
END $$;

-- Create webhook_events table for idempotency tracking
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);

-- Auto-cleanup: delete events older than 30 days (run manually or via cron)
-- This prevents the table from growing unbounded

-- Create meal_plan_generation_quota table if it doesn't exist
CREATE TABLE IF NOT EXISTS meal_plan_generation_quota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_generated INT DEFAULT 0,
  free_tier_generated INT DEFAULT 0,
  current_period_generated INT DEFAULT 0,
  free_tier_swaps INT DEFAULT 0,
  stripe_subscription_id TEXT,
  period_start_date TIMESTAMPTZ DEFAULT now(),
  period_end_date TIMESTAMPTZ,
  last_generation_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS for meal_plan_generation_quota
ALTER TABLE meal_plan_generation_quota ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quota"
  ON meal_plan_generation_quota FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own quota"
  ON meal_plan_generation_quota FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quota"
  ON meal_plan_generation_quota FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS for webhook_events (only service role should access)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
-- No user policies — only service role (used by webhook handler) can access
```

**Step 2: Update TypeScript types**

In `lib/types/database.ts`, add the missing fields to `UserProfile` interface. After line 52 (`stripe_customer_id`), add:

```typescript
  stripe_subscription_id: string | null
  subscription_status: string | null
  subscription_period_end: string | null
```

**Step 3: Verify build succeeds**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add supabase/migrations/20260309_add_stripe_subscription_fields.sql lib/types/database.ts
git commit -m "feat: add Stripe subscription DB migration and update types"
```

**IMPORTANT:** After commit, this SQL must be run manually in the Supabase SQL Editor before the webhook will work in production.

---

### Task 9: Add webhook idempotency

**Files:**
- Modify: `app/api/webhooks/stripe/route.ts`

**Step 1: Add idempotency check to the POST handler**

In `app/api/webhooks/stripe/route.ts`, after the event is constructed (after line 59), add an idempotency check before the switch statement. Replace the try block (lines 61-95) with:

```typescript
  try {
    // Idempotency check — skip already-processed events
    const supabaseAdmin = await createClient()
    const { data: existingEvent } = await supabaseAdmin
      .from('webhook_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .single()

    if (existingEvent) {
      return NextResponse.json({ received: true, deduplicated: true })
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        break
    }

    // Record event as processed
    await supabaseAdmin
      .from('webhook_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
      })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(`[Webhook] Error handling ${event.type}:`, error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
```

**Step 2: Verify build succeeds**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/api/webhooks/stripe/route.ts
git commit -m "feat: add webhook idempotency to prevent duplicate event processing"
```

---

### Task 10: Add NEXT_PUBLIC_APP_URL to env example

**Files:**
- Modify or create: `.env.local.example` (add the new env var)

**Step 1: Add env var documentation**

Ensure `.env.local.example` includes:

```
# App URL (used for sitemap, canonical URLs, social sharing)
NEXT_PUBLIC_APP_URL=https://macroplan.vercel.app
```

**Step 2: Commit**

```bash
git add .env.local.example
git commit -m "docs: add NEXT_PUBLIC_APP_URL to env example"
```

---

### Task 11: Final verification

**Step 1: Run full type check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 3: Run tests**

Run: `npm run test`
Expected: All tests pass

**Step 4: Commit any remaining fixes**

If build or tests surface issues, fix and commit.

---

## Post-Implementation Checklist

After all tasks are complete, before deploying to Vercel:

- [ ] Run the SQL migration in Supabase SQL Editor (Task 8)
- [ ] Set `NEXT_PUBLIC_APP_URL` in Vercel environment variables
- [ ] Set `STRIPE_WEBHOOK_SECRET` in Vercel environment variables
- [ ] Switch Stripe keys from `sk_test_` / `pk_test_` to live keys when ready
- [ ] Register webhook endpoint in Stripe dashboard: `https://<your-domain>/api/webhooks/stripe`
- [ ] Configure Stripe Customer Portal in Stripe dashboard
- [ ] Verify sitemap loads: `https://<your-domain>/sitemap.xml`
- [ ] Verify robots.txt loads: `https://<your-domain>/robots.txt`
- [ ] Submit sitemap to Google Search Console
