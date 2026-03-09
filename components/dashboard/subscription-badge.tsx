'use client'

import { useEffect, useState, useTransition } from 'react'
import { Crown, Settings, Loader2, Sparkles } from 'lucide-react'
import { getSubscriptionInfo, createPortalSession, type SubscriptionInfo } from '@/app/actions/stripe'
import { getSubscriptionStatus } from '@/app/actions/subscription'

interface SubscriptionBadgeProps {
  showManageButton?: boolean
}

export function SubscriptionBadge({ showManageButton = true }: SubscriptionBadgeProps) {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSubscription() {
      try {
        const [subscriptionInfo, status] = await Promise.all([
          getSubscriptionInfo(),
          getSubscriptionStatus(),
        ])
        setInfo(subscriptionInfo)
        setIsPremium(status?.isPremium ?? false)
      } catch {
        console.error('Failed to load subscription info')
      } finally {
        setIsLoading(false)
      }
    }
    loadSubscription()
  }, [])

  const handleManageSubscription = () => {
    setError(null)
    startTransition(async () => {
      const result = await createPortalSession()
      if (result.success && result.url) {
        window.location.href = result.url
      } else {
        setError(result.error || 'Failed to open subscription portal')
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  if (isPremium) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 px-3 py-1.5 rounded-full">
          <Crown className="size-4" />
          <span className="text-sm font-semibold">Premium</span>
          {info?.plan && (
            <span className="text-xs opacity-75">
              ({info.plan === 'annual' ? 'Annual' : 'Monthly'})
            </span>
          )}
        </div>

        {showManageButton && (
          <button
            onClick={handleManageSubscription}
            disabled={isPending}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Settings className="size-4" />
            )}
            Manage Subscription
          </button>
        )}

        {error && (
          <span className="text-xs text-red-600">{error}</span>
        )}

        {info?.cancelAtPeriodEnd && (
          <span className="text-xs text-amber-600">
            Cancels at period end
          </span>
        )}
      </div>
    )
  }

  // Free tier
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-2 bg-muted text-muted-foreground px-3 py-1.5 rounded-full">
        <span className="text-sm font-medium">Free Plan</span>
      </div>

      <a
        href="/pricing"
        className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
      >
        <Sparkles className="size-4" />
        Upgrade to Premium
      </a>
    </div>
  )
}
