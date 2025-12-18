'use client'

import { X, Sparkles, Crown } from 'lucide-react'
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
    <div className="py-2">
      <div className="relative rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 p-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 opacity-10">
          <Sparkles className="h-32 w-32 text-primary" />
        </div>

        {/* Main content */}
        <div className="relative flex items-start gap-3">
          {/* Icon */}
          <div className="hidden sm:flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-primary/20">
            <Crown className="h-5 w-5 text-primary" />
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0 pr-8">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-4 w-4 text-primary sm:hidden" />
              <h3 className="text-sm font-bold text-foreground">
                Free Tier: {favoritesUsed}/{favoritesLimit} Favorites · {mealPlansUsed}/{mealPlansLimit} Meal Plans
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3 sm:mb-2">
              {favoritesNearLimit || mealPlansNearLimit
                ? 'Running low on your free tier limits! Upgrade for unlimited favorites and meal plans.'
                : 'Upgrade to Premium for unlimited saved recipes, meal plans, and priority support.'}
            </p>
            <a
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors group"
              href="#"
            >
              <span>Upgrade to Premium</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>

          {/* Close button */}
          <button
            className="absolute top-0 right-0 p-2 text-icon hover:text-primary hover:bg-muted rounded-lg transition-all"
            onClick={() => setIsVisible(false)}
            aria-label="Dismiss upgrade banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
