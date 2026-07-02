/**
 * Subscription Constants
 *
 * Shared constants for subscription tiers and limits
 */

import type { QuotaCheckResult } from '@/lib/utils/subscription'

// Favorites limits
export const FREE_FAVORITES_LIMIT = 10
export const PREMIUM_FAVORITES_LIMIT = Infinity

// Meal plan limits
export const FREE_MEAL_PLANS_LIMIT = 3
export const PREMIUM_MEAL_PLANS_PER_MONTH = 100

// Types
export type SubscriptionTier = 'free' | 'paid'

export interface FavoritesQuota {
  used: number
  limit: number
  remaining: number
  allowed: boolean
}

export interface SubscriptionStatus {
  tier: SubscriptionTier
  isPremium: boolean
  quota: QuotaCheckResult
  favoritesQuota: FavoritesQuota
}
