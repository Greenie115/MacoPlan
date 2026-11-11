'use client'

import { X } from 'lucide-react'
import { useState } from 'react'

interface UpgradeBannerProps {
  isPremium?: boolean
  favoritesUsed?: number
  favoritesLimit?: number
  mealPlansUsed?: number
  mealPlansLimit?: number
}

export function UpgradeBanner({
  isPremium = false,
  favoritesUsed = 0,
  favoritesLimit = 10,
  mealPlansUsed = 0,
  mealPlansLimit = 3,
}: UpgradeBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  // Don't show banner for premium users or if dismissed
  if (isPremium || !isVisible) return null

  const favoritesNearLimit = favoritesUsed >= favoritesLimit - 2
  const mealPlansNearLimit = mealPlansUsed >= mealPlansLimit - 1

  return (
    <div className="pt-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border-strong bg-card px-4 py-3 text-sm shadow-xs">
        <p className="font-mono text-xs tabular-nums text-muted-foreground">
          Free plan: {favoritesUsed}/{favoritesLimit} favorites, {mealPlansUsed}/{mealPlansLimit} plans
        </p>
        <p className="min-w-0 flex-1 text-muted-foreground">
          {favoritesNearLimit || mealPlansNearLimit
            ? 'You are close to the free limits.'
            : 'Premium gives you unlimited favorites and 100 plans a month.'}
        </p>
        <a href="/pricing" className="font-semibold text-coral-700 hover:underline dark:text-coral-300">
          Upgrade
        </a>
        <button
          className="rounded-md p-1 text-icon transition-colors duration-fast hover:bg-muted hover:text-foreground"
          onClick={() => setIsVisible(false)}
          aria-label="Dismiss upgrade banner"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
