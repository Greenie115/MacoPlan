'use client'

import { X, Sparkles, Crown } from 'lucide-react'
import { useState } from 'react'

export function UpgradeBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="px-4 py-2">
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
                Free Tier: 100 Recipes Available
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3 sm:mb-2">
              Unlock unlimited recipes, custom meal plans, and advanced nutrition tracking
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
