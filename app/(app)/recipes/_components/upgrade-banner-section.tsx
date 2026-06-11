import { UpgradeBanner } from '@/components/recipes/upgrade-banner'
import { getSubscriptionStatus } from '@/app/actions/subscription'

/**
 * Async wrapper so the subscription fetch streams in independently and the
 * banner doesn't reset when search results re-render.
 */
export async function UpgradeBannerSection() {
  const subscriptionStatus = await getSubscriptionStatus()
  const isPremium = subscriptionStatus?.isPremium ?? false

  return (
    <div className="max-w-7xl mx-auto px-4">
      <UpgradeBanner
        isPremium={isPremium}
        favoritesUsed={subscriptionStatus?.favoritesQuota.used ?? 0}
        favoritesLimit={subscriptionStatus?.favoritesQuota.limit ?? 10}
        mealPlansUsed={subscriptionStatus ? subscriptionStatus.quota.total - subscriptionStatus.quota.remaining : 0}
        mealPlansLimit={subscriptionStatus?.quota.total ?? 3}
      />
    </div>
  )
}
