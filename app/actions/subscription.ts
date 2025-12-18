'use server'

import { createClient } from '@/lib/supabase/server'
import {
  getUserSubscriptionTier,
  checkMealPlanQuota,
  type SubscriptionTier,
  type QuotaCheckResult,
} from '@/lib/utils/subscription'
import {
  FREE_FAVORITES_LIMIT,
  PREMIUM_FAVORITES_LIMIT,
  type FavoritesQuota,
} from '@/lib/constants/subscription'

interface SubscriptionStatus {
  tier: SubscriptionTier
  isPremium: boolean
  quota: QuotaCheckResult
  favoritesQuota: FavoritesQuota
}

/**
 * Get the count of favorites for a user
 */
async function getFavoritesCount(userId: string): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('user_fatsecret_favorites')
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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
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

/**
 * Check if the current user is on the premium tier
 * Lightweight check for components that only need boolean status
 */
export async function isPremiumUser(): Promise<boolean> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return false
    }

    const tier = await getUserSubscriptionTier(user.id)
    return tier === 'paid'
  } catch (err) {
    console.error('Unexpected error checking premium status:', err)
    return false
  }
}
