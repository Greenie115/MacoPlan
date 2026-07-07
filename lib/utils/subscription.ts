/**
 * Subscription Utilities
 *
 * Handles subscription tier detection via Stripe API
 * Supports test user bypass for internal testing
 */

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export type SubscriptionTier = 'free' | 'paid'

/**
 * Accounts permitted to simulate subscription tiers (internal testing only).
 * Gated on the authenticated email — which comes from the signed JWT and can't
 * be self-edited — NOT the user-writable is_test_user column.
 */
export function canSimulateTier(email: string | null | undefined): boolean {
  if (!email) return false
  const allow = ['dggreen545@gmail.com', process.env.TEST_USER_EMAIL]
    .filter((e): e is string => Boolean(e))
    .map((e) => e.toLowerCase())
  return allow.includes(email.toLowerCase())
}

// ============================================================================
// Get User's Subscription Tier
// ============================================================================

/**
 * Determines if user is on free or paid tier
 * - Honors a simulated tier only for allowlisted internal accounts
 * - Then checks Stripe subscription status
 */
export async function getUserSubscriptionTier(
  userId: string
): Promise<SubscriptionTier> {
  const supabase = await createClient()

  // Fetch simulated tier, webhook-maintained status, and Stripe customer ID
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('simulated_tier, stripe_customer_id, subscription_status')
    .eq('user_id', userId)
    .single()

  if (!profile) {
    return 'free'
  }

  // Honor a simulated tier only for the allowlisted account it belongs to.
  if (profile.simulated_tier !== null) {
    const { data } = await supabase.auth.getUser()
    if (data?.user?.id === userId && canSimulateTier(data.user.email)) {
      return profile.simulated_tier as SubscriptionTier
    }
  }

  // Otherwise fall through to the normal Stripe check

  // Webhooks keep subscription_status current (checkout.completed,
  // subscription.updated/deleted, invoice.payment_failed) — trust it and skip
  // the live Stripe API round-trip that used to run on every tier check.
  if (profile.subscription_status) {
    return profile.subscription_status === 'active' ||
      profile.subscription_status === 'trialing'
      ? 'paid'
      : 'free'
  }

  // Stripe fallback: customer exists but no status column yet (pre-webhook rows)
  if (profile.stripe_customer_id && stripe) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: 'active',
        limit: 1,
      })

      const hasPaidSubscription = subscriptions.data.length > 0

      return hasPaidSubscription ? 'paid' : 'free'
    } catch (error) {
      console.error('[Subscription] Error checking Stripe subscription:', error)
      // Fail gracefully - return free tier if Stripe check fails
      return 'free'
    }
  }

  // No Stripe customer ID = free tier
  return 'free'
}

// ============================================================================
// Check Meal Plan Generation Quota
// ============================================================================

export interface QuotaCheckResult {
  allowed: boolean
  used: number
  remaining: number
  total: number
  reason?: string
}

/**
 * Checks if user can generate another meal plan based on quota.
 * Free tier: 3 plans lifetime. Paid tier: 100 plans per month.
 *
 * Counts rows in batch_prep_plans — the same source the generation gate
 * uses — so the numbers shown to users can't drift from what's enforced.
 * (The old meal_plan_generation_quota counters were never incremented.)
 */
export async function checkMealPlanQuota(
  userId: string,
  tier: SubscriptionTier
): Promise<QuotaCheckResult> {
  const supabase = await createClient()

  let query = supabase
    .from('batch_prep_plans')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (tier === 'paid') {
    // Paid quota is per calendar month
    const monthStart = new Date()
    monthStart.setUTCDate(1)
    monthStart.setUTCHours(0, 0, 0, 0)
    query = query.gte('created_at', monthStart.toISOString())
  }

  const { count, error } = await query
  if (error) {
    console.error('[Quota] Error counting plans:', error)
    throw new Error('Failed to check quota')
  }

  const used = count ?? 0
  const total = tier === 'free' ? 3 : 100
  const remaining = Math.max(0, total - used)
  const allowed = remaining > 0

  return {
    allowed,
    used,
    remaining,
    total,
    reason: allowed
      ? undefined
      : tier === 'free'
        ? 'Free tier limit reached. Upgrade to generate 100 plans a month.'
        : 'Monthly generation limit reached. Please contact support if you need more.',
  }
}


