'use server'

import { createClient, getAuthUser } from '@/lib/supabase/server'
import {
  getUserSubscriptionTier,
  checkMealPlanQuota,
  type SubscriptionTier,
} from '@/lib/utils/subscription'
import {
  FREE_FAVORITES_LIMIT,
  PREMIUM_FAVORITES_LIMIT,
  type FavoritesQuota,
  type SubscriptionStatus,
} from '@/lib/constants/subscription'

/**
 * Get the count of favorites for a user
 */
async function getFavoritesCount(userId: string): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('user_recipe_favorites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) {
    console.error('Error counting favorites:', error)
    return 0
  }

  return count || 0
}

/**
 * Check favorites quota for a user
 */
export async function checkFavoritesQuota(
  userId: string,
  tier: SubscriptionTier
): Promise<FavoritesQuota> {
  const used = await getFavoritesCount(userId)
  const limit = tier === 'paid' ? PREMIUM_FAVORITES_LIMIT : FREE_FAVORITES_LIMIT
  const remaining = Math.max(0, limit - used)

  return {
    used,
    limit,
    remaining,
    allowed: remaining > 0,
  }
}

/**
 * Get the current user's subscription status including tier and quota
 * This action can be called from client components
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus | null> {
  try {
    const supabase = await createClient()

    const user = await getAuthUser()

    if (!user) {
      return null
    }

    // Get subscription tier
    const tier = await getUserSubscriptionTier(user.id)

    // Get quota info
    const [quota, favoritesQuota] = await Promise.all([
      checkMealPlanQuota(user.id, tier),
      checkFavoritesQuota(user.id, tier),
    ])

    return {
      tier,
      isPremium: tier === 'paid',
      quota,
      favoritesQuota,
    }
  } catch (err) {
    console.error('Unexpected error getting subscription status:', err)
    return null
  }
}

export async function canGenerateBatchPrepPlan(
  userId: string
): Promise<{ allowed: boolean; reason?: 'free_tier_limit'; used?: number; limit?: number }> {
  const tier = await getUserSubscriptionTier(userId)

  if (tier === 'paid') {
    return { allowed: true }
  }

  // Same count-based check the quota UI shows, so gate and display agree
  const quota = await checkMealPlanQuota(userId, tier)
  return quota.allowed
    ? { allowed: true, used: quota.used, limit: quota.total }
    : { allowed: false, reason: 'free_tier_limit', used: quota.used, limit: quota.total }
}

export async function isPremiumUser(): Promise<boolean> {
  try {
    const supabase = await createClient()

    const user = await getAuthUser()

    if (!user) {
      return false
    }

    const tier = await getUserSubscriptionTier(user.id)
    return tier === 'paid'
  } catch (err) {
    console.error('Unexpected error checking premium status:', err)
    return false
  }
}
