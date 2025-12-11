/**
 * Subscription Utilities
 *
 * Handles subscription tier detection via Stripe API
 * Supports test user bypass for internal testing
 */

import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

// Initialize Stripe (only if key is available)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
    })
  : null

export type SubscriptionTier = 'free' | 'paid'

// ============================================================================
// Get User's Subscription Tier
// ============================================================================

/**
 * Determines if user is on free or paid tier
 * - Checks test_user flag first (bypass for testing)
 * - Then checks Stripe subscription status
 */
export async function getUserSubscriptionTier(
  userId: string
): Promise<SubscriptionTier> {
  const supabase = await createClient()

  // Fetch user profile with test user flag and Stripe customer ID
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_test_user, stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (!profile) {
    console.warn('[Subscription] User profile not found:', userId)
    return 'free'
  }

  // Test users get paid tier benefits
  if (profile.is_test_user) {
    console.log('[Subscription] Test user detected, granting paid tier access')
    return 'paid'
  }

  // Check Stripe subscription if customer ID exists
  if (profile.stripe_customer_id && stripe) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: 'active',
        limit: 1,
      })

      const hasPaidSubscription = subscriptions.data.length > 0

      console.log(
        `[Subscription] User ${userId} tier: ${hasPaidSubscription ? 'paid' : 'free'}`
      )

      return hasPaidSubscription ? 'paid' : 'free'
    } catch (error) {
      console.error('[Subscription] Error checking Stripe subscription:', error)
      // Fail gracefully - return free tier if Stripe check fails
      return 'free'
    }
  }

  // No Stripe customer ID = free tier
  console.log(`[Subscription] User ${userId} has no Stripe customer ID, tier: free`)
  return 'free'
}

// ============================================================================
// Check Meal Plan Generation Quota
// ============================================================================

export interface QuotaCheckResult {
  allowed: boolean
  remaining: number
  total: number
  reason?: string
}

/**
 * Checks if user can generate another meal plan based on quota
 * Free tier: 3 plans lifetime
 * Paid tier: 100 plans per month
 */
export async function checkMealPlanQuota(
  userId: string,
  tier: SubscriptionTier
): Promise<QuotaCheckResult> {
  const supabase = await createClient()

  // Get or create quota record
  let { data: quota } = await supabase
    .from('meal_plan_generation_quota')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!quota) {
    // Create quota record for new user
    const { data, error } = await supabase
      .from('meal_plan_generation_quota')
      .insert({ user_id: userId })
      .select()
      .single()

    if (error) {
      console.error('[Quota] Error creating quota record:', error)
      throw new Error('Failed to check quota')
    }

    quota = data
  }

  if (tier === 'free') {
    // Free tier: max 3 plans
    const remaining = Math.max(0, 3 - quota.free_tier_generated)
    const allowed = remaining > 0

    return {
      allowed,
      remaining,
      total: 3,
      reason: allowed
        ? undefined
        : 'Free tier limit reached. Upgrade to generate unlimited meal plans.',
    }
  } else {
    // Paid tier: max 100 per month
    const remaining = Math.max(0, 100 - quota.current_period_generated)
    const allowed = remaining > 0

    return {
      allowed,
      remaining,
      total: 100,
      reason: allowed
        ? undefined
        : 'Monthly generation limit reached. Please contact support if you need more.',
    }
  }
}

// ============================================================================
// Increment Quota Counter
// ============================================================================

/**
 * Increments the meal plan generation counter after successful generation
 */
export async function incrementMealPlanQuota(
  userId: string,
  tier: SubscriptionTier
): Promise<void> {
  const supabase = await createClient()

  // Build update object
  const updates: any = {
    total_generated: { increment: 1 } as any,
    current_period_generated: { increment: 1 } as any,
    last_generation_at: new Date().toISOString(),
  }

  if (tier === 'free') {
    updates.free_tier_generated = { increment: 1 } as any
  }

  // Note: Supabase doesn't support increment syntax directly in TypeScript
  // We need to use raw SQL update
  const { error } = await supabase.rpc('increment_meal_plan_quota', {
    p_user_id: userId,
    p_is_free_tier: tier === 'free',
  })

  if (error) {
    console.error('[Quota] Error incrementing quota:', error)
  } else {
    console.log(`[Quota] Incremented quota for user ${userId} (${tier} tier)`)
  }
}

// ============================================================================
// Reset Monthly Quota (Called by Stripe webhook)
// ============================================================================

/**
 * Resets current_period_generated counter for a user
 * Called by Stripe webhook on invoice.paid event
 */
export async function resetMonthlyQuota(
  userId: string,
  subscriptionId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('meal_plan_generation_quota')
    .update({
      current_period_generated: 0,
      stripe_subscription_id: subscriptionId,
      period_start_date: periodStart.toISOString(),
      period_end_date: periodEnd.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) {
    console.error('[Quota] Error resetting monthly quota:', error)
    throw error
  }

  console.log(`[Quota] Reset monthly quota for user ${userId}`)
}
