'use client'

/**
 * Advanced Recipe Filters Component
 *
 * Multi-select dropdown filters for Spoonacular recipe search:
 * - Cuisine type (multi-select)
 * - Max prep time (multi-select)
 * - Meal type (multi-select)
 *
 * Features:
 * - Multi-select checkboxes for all filters
 * - Apply button to batch changes (saves API calls)
 * - Removable filter chips with X button
 * - Matches MacroPlan design system with shadcn/ui components
 */

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, useMemo } from 'react'
import { X, Filter, ChevronDown } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import {
  ALLOWED_CUISINES,
  ALLOWED_PREP_TIMES,
  ALLOWED_MEAL_TYPES,
  MAX_CUISINES,
  MAX_PREP_TIMES,
  MAX_MEAL_TYPES,
  isValidCuisine,
  isValidMealType,
  isValidPrepTime,
} from '@/lib/utils/filter-validation'

// Filter option labels (values come from validation utility)
const CUISINES = ALLOWED_CUISINES.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}))

const PREP_TIMES = ALLOWED_PREP_TIMES.map((value) => ({
  value,
  label:
    value === '60'
      ? '1 hour'
      : value === '30'
      ? '30 minutes'
      : '15 minutes',
}))

const MEAL_TYPES = ALLOWED_MEAL_TYPES.map((value) => ({
  value,
  label:
    value === 'main course'
      ? 'Lunch/Dinner'
      : value.charAt(0).toUpperCase() + value.slice(1),
}))

export function RecipeFiltersAdvanced() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // P0 Fix: Validate URL parameters to prevent injection attacks
  const urlCuisines = useMemo(() => {
    const raw = searchParams.get('cuisine')?.split(',').filter(Boolean) || []
    return raw.filter(isValidCuisine).slice(0, MAX_CUISINES)
  }, [searchParams])

  const urlPrepTimes = useMemo(() => {
    const raw = searchParams.get('maxTime')?.split(',').filter(Boolean) || []
    return raw.filter(isValidPrepTime).slice(0, MAX_PREP_TIMES)
  }, [searchParams])

  const urlMealTypes = useMemo(() => {
    const raw = searchParams.get('type')?.split(',').filter(Boolean) || []
    return raw.filter(isValidMealType).slice(0, MAX_MEAL_TYPES)
  }, [searchParams])

  // Local state for pending changes (before Apply is clicked)
  const [pendingCuisines, setPendingCuisines] = useState<string[]>(urlCuisines)
  const [pendingPrepTimes, setPendingPrepTimes] = useState<string[]>(urlPrepTimes)
  const [pendingMealTypes, setPendingMealTypes] = useState<string[]>(urlMealTypes)

  // Dropdown visibility state
  const [showCuisineDropdown, setShowCuisineDropdown] = useState(false)
  const [showPrepTimeDropdown, setShowPrepTimeDropdown] = useState(false)
  const [showMealTypeDropdown, setShowMealTypeDropdown] = useState(false)

  // P1 Fix: Optimize array comparison with useMemo (no mutation)
  const hasPendingChanges = useMemo(() => {
    const arraysEqual = (a: string[], b: string[]) => {
      if (a.length !== b.length) return false
      const sortedA = [...a].sort() // Create copy to avoid mutation
      const sortedB = [...b].sort()
      return sortedA.every((val, idx) => val === sortedB[idx])
    }

    return (
      !arraysEqual(pendingCuisines, urlCuisines) ||
      !arraysEqual(pendingPrepTimes, urlPrepTimes) ||
      !arraysEqual(pendingMealTypes, urlMealTypes)
    )
  }, [
    pendingCuisines,
    urlCuisines,
    pendingPrepTimes,
    urlPrepTimes,
    pendingMealTypes,
    urlMealTypes,
  ])

  // Apply filters to URL (triggers re-fetch)
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Handle cuisines
    if (pendingCuisines.length > 0) {
      params.set('cuisine', pendingCuisines.join(','))
    } else {
      params.delete('cuisine')
    }

    // Handle prep times (find max value)
    if (pendingPrepTimes.length > 0) {
      params.set('maxTime', pendingPrepTimes.join(','))
    } else {
      params.delete('maxTime')
    }

    // Handle meal types
    if (pendingMealTypes.length > 0) {
      params.set('type', pendingMealTypes.join(','))
    } else {
      params.delete('type')
    }

    // Reset to page 1 when filters change
    params.delete('page')

    startTransition(() => {
      router.push(`/recipes?${params.toString()}`)
      // Close all dropdowns
      setShowCuisineDropdown(false)
      setShowPrepTimeDropdown(false)
      setShowMealTypeDropdown(false)
    })
  }

  // P2 Fix: Toggle selection with max limits enforcement
  const toggleSelection = (
    type: 'cuisine' | 'prepTime' | 'mealType',
    value: string
  ) => {
    if (type === 'cuisine') {
      if (pendingCuisines.includes(value)) {
        setPendingCuisines(pendingCuisines.filter((c) => c !== value))
      } else if (pendingCuisines.length < MAX_CUISINES) {
        setPendingCuisines([...pendingCuisines, value])
      } else {
        console.warn(`Maximum ${MAX_CUISINES} cuisines can be selected`)
        // Could add toast notification here
      }
    } else if (type === 'prepTime') {
      if (pendingPrepTimes.includes(value)) {
        setPendingPrepTimes(pendingPrepTimes.filter((t) => t !== value))
      } else if (pendingPrepTimes.length < MAX_PREP_TIMES) {
        setPendingPrepTimes([...pendingPrepTimes, value])
      } else {
        console.warn(`Maximum ${MAX_PREP_TIMES} prep times can be selected`)
      }
    } else if (type === 'mealType') {
      if (pendingMealTypes.includes(value)) {
        setPendingMealTypes(pendingMealTypes.filter((m) => m !== value))
      } else if (pendingMealTypes.length < MAX_MEAL_TYPES) {
        setPendingMealTypes([...pendingMealTypes, value])
      } else {
        console.warn(`Maximum ${MAX_MEAL_TYPES} meal types can be selected`)
      }
    }
  }

  // Remove individual filter chip
  const removeFilter = (
    filterType: 'cuisine' | 'prepTime' | 'mealType',
    value: string
  ) => {
    const params = new URLSearchParams(searchParams.toString())

    if (filterType === 'cuisine') {
      const newCuisines = urlCuisines.filter((c) => c !== value)
      setPendingCuisines(newCuisines)
      if (newCuisines.length > 0) {
        params.set('cuisine', newCuisines.join(','))
      } else {
        params.delete('cuisine')
      }
    } else if (filterType === 'prepTime') {
      const newPrepTimes = urlPrepTimes.filter((t) => t !== value)
      setPendingPrepTimes(newPrepTimes)
      if (newPrepTimes.length > 0) {
        params.set('maxTime', newPrepTimes.join(','))
      } else {
        params.delete('maxTime')
      }
    } else if (filterType === 'mealType') {
      const newMealTypes = urlMealTypes.filter((m) => m !== value)
      setPendingMealTypes(newMealTypes)
      if (newMealTypes.length > 0) {
        params.set('type', newMealTypes.join(','))
      } else {
        params.delete('type')
      }
    }

    params.delete('page')

    startTransition(() => {
      router.push(`/recipes?${params.toString()}`)
    })
  }

  // Clear all filters
  const handleClearAll = () => {
    setPendingCuisines([])
    setPendingPrepTimes([])
    setPendingMealTypes([])

    const params = new URLSearchParams(searchParams.toString())
    params.delete('cuisine')
    params.delete('maxTime')
    params.delete('type')
    params.delete('page')

    startTransition(() => {
      router.push(`/recipes?${params.toString()}`)
    })
  }

  const hasActiveFilters =
    urlCuisines.length > 0 || urlPrepTimes.length > 0 || urlMealTypes.length > 0

  return (
    <div className="bg-muted border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Cuisine Multi-Select Dropdown */}
          <div className="relative flex-1 min-w-[200px]">
            <button
              onClick={() => {
                setShowCuisineDropdown(!showCuisineDropdown)
                setShowPrepTimeDropdown(false)
                setShowMealTypeDropdown(false)
              }}
              disabled={isPending}
              className={cn(
                "w-full px-4 py-2.5 text-sm font-medium text-left rounded-xl bg-background border border-input",
                "hover:bg-accent hover:border-ring/50",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all flex items-center justify-between"
              )}
            >
              <span className="text-foreground">
                {pendingCuisines.length === 0
                  ? 'All Cuisines'
                  : `${pendingCuisines.length} cuisine${pendingCuisines.length > 1 ? 's' : ''}`}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Dropdown Menu */}
            {showCuisineDropdown && (
              <div className="absolute z-50 mt-2 w-full bg-popover border border-border rounded-xl shadow-lg max-h-64 overflow-y-auto">
                {CUISINES.map((cuisine) => (
                  <label
                    key={cuisine.value}
                    className="flex items-center px-4 py-2.5 hover:bg-accent cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={pendingCuisines.includes(cuisine.value)}
                      onCheckedChange={() => toggleSelection('cuisine', cuisine.value)}
                    />
                    <span className="ml-3 text-sm text-foreground">{cuisine.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Prep Time Multi-Select Dropdown */}
          <div className="relative flex-1 min-w-[180px]">
            <button
              onClick={() => {
                setShowPrepTimeDropdown(!showPrepTimeDropdown)
                setShowCuisineDropdown(false)
                setShowMealTypeDropdown(false)
              }}
              disabled={isPending}
              className={cn(
                "w-full px-4 py-2.5 text-sm font-medium text-left rounded-xl bg-background border border-input",
                "hover:bg-accent hover:border-ring/50",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all flex items-center justify-between"
              )}
            >
              <span className="text-foreground">
                {pendingPrepTimes.length === 0
                  ? 'Any Time'
                  : `${pendingPrepTimes.length} time${pendingPrepTimes.length > 1 ? 's' : ''}`}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Dropdown Menu */}
            {showPrepTimeDropdown && (
              <div className="absolute z-50 mt-2 w-full bg-popover border border-border rounded-xl shadow-lg max-h-64 overflow-y-auto">
                {PREP_TIMES.map((time) => (
                  <label
                    key={time.value}
                    className="flex items-center px-4 py-2.5 hover:bg-accent cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={pendingPrepTimes.includes(time.value)}
                      onCheckedChange={() => toggleSelection('prepTime', time.value)}
                    />
                    <span className="ml-3 text-sm text-foreground">{time.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Meal Type Multi-Select Dropdown */}
          <div className="relative flex-1 min-w-[180px]">
            <button
              onClick={() => {
                setShowMealTypeDropdown(!showMealTypeDropdown)
                setShowCuisineDropdown(false)
                setShowPrepTimeDropdown(false)
              }}
              disabled={isPending}
              className={cn(
                "w-full px-4 py-2.5 text-sm font-medium text-left rounded-xl bg-background border border-input",
                "hover:bg-accent hover:border-ring/50",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all flex items-center justify-between"
              )}
            >
              <span className="text-foreground">
                {pendingMealTypes.length === 0
                  ? 'All Meals'
                  : `${pendingMealTypes.length} meal${pendingMealTypes.length > 1 ? 's' : ''}`}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Dropdown Menu */}
            {showMealTypeDropdown && (
              <div className="absolute z-50 mt-2 w-full bg-popover border border-border rounded-xl shadow-lg max-h-64 overflow-y-auto">
                {MEAL_TYPES.map((meal) => (
                  <label
                    key={meal.value}
                    className="flex items-center px-4 py-2.5 hover:bg-accent cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={pendingMealTypes.includes(meal.value)}
                      onCheckedChange={() => toggleSelection('mealType', meal.value)}
                    />
                    <span className="ml-3 text-sm text-foreground">{meal.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Apply Button (shows when there are pending changes) */}
          {hasPendingChanges && (
            <button
              onClick={applyFilters}
              disabled={isPending}
              className="px-5 py-2.5 text-sm font-semibold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Apply Filters
            </button>
          )}

          {/* Clear All Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              disabled={isPending}
              className="px-4 py-2.5 text-sm font-medium text-muted-foreground bg-muted rounded-xl hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {/* Cuisine Chips */}
            {urlCuisines.map((cuisineValue) => {
              const cuisine = CUISINES.find((c) => c.value === cuisineValue)
              return (
                <button
                  key={cuisineValue}
                  onClick={() => removeFilter('cuisine', cuisineValue)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cuisine?.label || cuisineValue}
                  <X className="h-3 w-3" />
                </button>
              )
            })}

            {/* Prep Time Chips */}
            {urlPrepTimes.map((timeValue) => {
              const time = PREP_TIMES.find((t) => t.value === timeValue)
              return (
                <button
                  key={timeValue}
                  onClick={() => removeFilter('prepTime', timeValue)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {time?.label || `${timeValue} min`}
                  <X className="h-3 w-3" />
                </button>
              )
            })}

            {/* Meal Type Chips */}
            {urlMealTypes.map((mealValue) => {
              const meal = MEAL_TYPES.find((m) => m.value === mealValue)
              return (
                <button
                  key={mealValue}
                  onClick={() => removeFilter('mealType', mealValue)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {meal?.label || mealValue}
                  <X className="h-3 w-3" />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showCuisineDropdown || showPrepTimeDropdown || showMealTypeDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowCuisineDropdown(false)
            setShowPrepTimeDropdown(false)
            setShowMealTypeDropdown(false)
          }}
        />
      )}
    </div>
  )
}
