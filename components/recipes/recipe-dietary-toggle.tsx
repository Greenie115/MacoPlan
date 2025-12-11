'use client'

/**
 * Recipe Dietary Filter Toggle Component
 *
 * Allows users to toggle between:
 * - "Match my diet" (filtered by user's dietary preferences)
 * - "Show all recipes" (no dietary filtering)
 *
 * State persists in localStorage
 */

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, FilterX } from 'lucide-react'

const STORAGE_KEY = 'macroplan_dietary_filter_enabled'

export function RecipeDietaryToggle() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isEnabled, setIsEnabled] = useState(true) // Default: ON

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      setIsEnabled(stored === 'true')
    }
  }, [])

  const handleToggle = () => {
    const newValue = !isEnabled
    setIsEnabled(newValue)

    // Persist to localStorage
    localStorage.setItem(STORAGE_KEY, newValue.toString())

    // Update URL to trigger re-fetch with new filter
    const params = new URLSearchParams(searchParams.toString())
    params.set('dietFilter', newValue.toString())
    params.delete('page') // Reset to page 1 when toggling filter

    router.push(`/recipes?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Filter Status Badge */}
        <div className="flex items-center gap-2">
          {isEnabled ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
              <Filter className="h-4 w-4" />
              <span>Filtered for your diet</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-sm font-medium">
              <FilterX className="h-4 w-4" />
              <span>Showing all recipes</span>
            </div>
          )}
        </div>

        {/* Toggle Switch */}
        <button
          onClick={handleToggle}
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          style={{
            backgroundColor: isEnabled ? '#F97316' : '#e8d5ce',
          }}
          aria-label={
            isEnabled
              ? 'Disable dietary filtering'
              : 'Enable dietary filtering'
          }
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Help Text */}
      <p className="mt-2 text-xs text-muted-foreground">
        {isEnabled
          ? 'Recipes match your dietary preferences and exclude allergens'
          : 'Browse all available recipes without dietary restrictions'}
      </p>
    </div>
  )
}
