'use client'

/**
 * Advanced Recipe Filters Component for FatSecret API
 *
 * Filters:
 * - Recipe types (multi-select, dynamically fetched)
 * - Calorie range (from/to)
 * - Macro percentages (protein, carbs, fat)
 * - Prep time range
 * - Sort options
 * - Must have images toggle
 */

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, useEffect, useCallback } from 'react'
import { X, Filter, ChevronDown, ChevronUp, Image as ImageIcon, SlidersHorizontal } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { FILTER_LIMITS, ALLOWED_SORT_OPTIONS, type SortOption } from '@/lib/utils/filter-validation'
import { getRecipeTypeFilters, getSortOptions } from '@/app/actions/fatsecret-recipes'

// Types for recipe type options
interface RecipeTypeOption {
  value: string
  label: string
}

// Sort option labels
const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest First',
  oldest: 'Oldest First',
  caloriesPerServingAscending: 'Calories: Low to High',
  caloriesPerServingDescending: 'Calories: High to Low',
}

export function RecipeFiltersAdvanced() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Dynamic recipe types from API
  const [recipeTypes, setRecipeTypes] = useState<RecipeTypeOption[]>([])
  const [isLoadingTypes, setIsLoadingTypes] = useState(true)

  // Expanded state for filter sections
  const [showFilters, setShowFilters] = useState(false)
  const [showRecipeTypes, setShowRecipeTypes] = useState(false)
  const [showNutrition, setShowNutrition] = useState(false)

  // Parse current URL values
  const currentRecipeTypes = searchParams.get('recipeTypes')?.split(',').filter(Boolean) || []
  const currentCaloriesFrom = searchParams.get('caloriesFrom') || ''
  const currentCaloriesTo = searchParams.get('caloriesTo') || ''
  const currentProteinFrom = searchParams.get('proteinFrom') || ''
  const currentProteinTo = searchParams.get('proteinTo') || ''
  const currentCarbsFrom = searchParams.get('carbsFrom') || ''
  const currentCarbsTo = searchParams.get('carbsTo') || ''
  const currentFatFrom = searchParams.get('fatFrom') || ''
  const currentFatTo = searchParams.get('fatTo') || ''
  const currentPrepTimeFrom = searchParams.get('prepTimeFrom') || ''
  const currentPrepTimeTo = searchParams.get('prepTimeTo') || ''
  const currentSortBy = (searchParams.get('sortBy') || '') as SortOption | ''
  const currentMustHaveImages = searchParams.get('mustHaveImages') === 'true'

  // Pending state (before apply)
  const [pendingRecipeTypes, setPendingRecipeTypes] = useState<string[]>(currentRecipeTypes)
  const [pendingCaloriesFrom, setPendingCaloriesFrom] = useState(currentCaloriesFrom)
  const [pendingCaloriesTo, setPendingCaloriesTo] = useState(currentCaloriesTo)
  const [pendingProteinFrom, setPendingProteinFrom] = useState(currentProteinFrom)
  const [pendingProteinTo, setPendingProteinTo] = useState(currentProteinTo)
  const [pendingCarbsFrom, setPendingCarbsFrom] = useState(currentCarbsFrom)
  const [pendingCarbsTo, setPendingCarbsTo] = useState(currentCarbsTo)
  const [pendingFatFrom, setPendingFatFrom] = useState(currentFatFrom)
  const [pendingFatTo, setPendingFatTo] = useState(currentFatTo)
  const [pendingPrepTimeFrom, setPendingPrepTimeFrom] = useState(currentPrepTimeFrom)
  const [pendingPrepTimeTo, setPendingPrepTimeTo] = useState(currentPrepTimeTo)
  const [pendingSortBy, setPendingSortBy] = useState<SortOption | ''>(currentSortBy)
  const [pendingMustHaveImages, setPendingMustHaveImages] = useState(currentMustHaveImages)

  // Fetch recipe types on mount
  useEffect(() => {
    async function fetchRecipeTypes() {
      setIsLoadingTypes(true)
      const result = await getRecipeTypeFilters()
      if (result.success && result.data) {
        setRecipeTypes(result.data)
      }
      setIsLoadingTypes(false)
    }
    fetchRecipeTypes()
  }, [])

  // Sync pending state when URL changes
  useEffect(() => {
    setPendingRecipeTypes(currentRecipeTypes)
    setPendingCaloriesFrom(currentCaloriesFrom)
    setPendingCaloriesTo(currentCaloriesTo)
    setPendingProteinFrom(currentProteinFrom)
    setPendingProteinTo(currentProteinTo)
    setPendingCarbsFrom(currentCarbsFrom)
    setPendingCarbsTo(currentCarbsTo)
    setPendingFatFrom(currentFatFrom)
    setPendingFatTo(currentFatTo)
    setPendingPrepTimeFrom(currentPrepTimeFrom)
    setPendingPrepTimeTo(currentPrepTimeTo)
    setPendingSortBy(currentSortBy)
    setPendingMustHaveImages(currentMustHaveImages)
  }, [searchParams])

  // Check if there are pending changes
  const hasPendingChanges =
    JSON.stringify(pendingRecipeTypes.sort()) !== JSON.stringify(currentRecipeTypes.sort()) ||
    pendingCaloriesFrom !== currentCaloriesFrom ||
    pendingCaloriesTo !== currentCaloriesTo ||
    pendingProteinFrom !== currentProteinFrom ||
    pendingProteinTo !== currentProteinTo ||
    pendingCarbsFrom !== currentCarbsFrom ||
    pendingCarbsTo !== currentCarbsTo ||
    pendingFatFrom !== currentFatFrom ||
    pendingFatTo !== currentFatTo ||
    pendingPrepTimeFrom !== currentPrepTimeFrom ||
    pendingPrepTimeTo !== currentPrepTimeTo ||
    pendingSortBy !== currentSortBy ||
    pendingMustHaveImages !== currentMustHaveImages

  // Check if any filters are active
  const hasActiveFilters =
    currentRecipeTypes.length > 0 ||
    currentCaloriesFrom !== '' ||
    currentCaloriesTo !== '' ||
    currentProteinFrom !== '' ||
    currentProteinTo !== '' ||
    currentCarbsFrom !== '' ||
    currentCarbsTo !== '' ||
    currentFatFrom !== '' ||
    currentFatTo !== '' ||
    currentPrepTimeFrom !== '' ||
    currentPrepTimeTo !== '' ||
    currentSortBy !== '' ||
    currentMustHaveImages

  // Apply filters to URL
  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())

    // Recipe types
    if (pendingRecipeTypes.length > 0) {
      params.set('recipeTypes', pendingRecipeTypes.join(','))
    } else {
      params.delete('recipeTypes')
    }

    // Calories
    if (pendingCaloriesFrom) params.set('caloriesFrom', pendingCaloriesFrom)
    else params.delete('caloriesFrom')
    if (pendingCaloriesTo) params.set('caloriesTo', pendingCaloriesTo)
    else params.delete('caloriesTo')

    // Protein
    if (pendingProteinFrom) params.set('proteinFrom', pendingProteinFrom)
    else params.delete('proteinFrom')
    if (pendingProteinTo) params.set('proteinTo', pendingProteinTo)
    else params.delete('proteinTo')

    // Carbs
    if (pendingCarbsFrom) params.set('carbsFrom', pendingCarbsFrom)
    else params.delete('carbsFrom')
    if (pendingCarbsTo) params.set('carbsTo', pendingCarbsTo)
    else params.delete('carbsTo')

    // Fat
    if (pendingFatFrom) params.set('fatFrom', pendingFatFrom)
    else params.delete('fatFrom')
    if (pendingFatTo) params.set('fatTo', pendingFatTo)
    else params.delete('fatTo')

    // Prep time
    if (pendingPrepTimeFrom) params.set('prepTimeFrom', pendingPrepTimeFrom)
    else params.delete('prepTimeFrom')
    if (pendingPrepTimeTo) params.set('prepTimeTo', pendingPrepTimeTo)
    else params.delete('prepTimeTo')

    // Sort
    if (pendingSortBy) params.set('sortBy', pendingSortBy)
    else params.delete('sortBy')

    // Must have images
    if (pendingMustHaveImages) params.set('mustHaveImages', 'true')
    else params.delete('mustHaveImages')

    // Reset page
    params.delete('page')

    startTransition(() => {
      router.push(`/recipes?${params.toString()}`)
      setShowRecipeTypes(false)
    })
  }, [
    router,
    searchParams,
    pendingRecipeTypes,
    pendingCaloriesFrom,
    pendingCaloriesTo,
    pendingProteinFrom,
    pendingProteinTo,
    pendingCarbsFrom,
    pendingCarbsTo,
    pendingFatFrom,
    pendingFatTo,
    pendingPrepTimeFrom,
    pendingPrepTimeTo,
    pendingSortBy,
    pendingMustHaveImages,
  ])

  // Toggle recipe type selection
  const toggleRecipeType = (value: string) => {
    if (pendingRecipeTypes.includes(value)) {
      setPendingRecipeTypes(pendingRecipeTypes.filter((t) => t !== value))
    } else if (pendingRecipeTypes.length < FILTER_LIMITS.maxRecipeTypes) {
      setPendingRecipeTypes([...pendingRecipeTypes, value])
    }
  }

  // Clear all filters
  const handleClearAll = () => {
    setPendingRecipeTypes([])
    setPendingCaloriesFrom('')
    setPendingCaloriesTo('')
    setPendingProteinFrom('')
    setPendingProteinTo('')
    setPendingCarbsFrom('')
    setPendingCarbsTo('')
    setPendingFatFrom('')
    setPendingFatTo('')
    setPendingPrepTimeFrom('')
    setPendingPrepTimeTo('')
    setPendingSortBy('')
    setPendingMustHaveImages(false)

    const params = new URLSearchParams(searchParams.toString())
    // Keep only search param
    const search = params.get('search')
    const newParams = new URLSearchParams()
    if (search) newParams.set('search', search)

    startTransition(() => {
      router.push(`/recipes?${newParams.toString()}`)
    })
  }

  // Remove individual filter
  const removeFilter = (filterKey: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (filterKey === 'recipeTypes' && value) {
      const newTypes = currentRecipeTypes.filter((t) => t !== value)
      setPendingRecipeTypes(newTypes)
      if (newTypes.length > 0) {
        params.set('recipeTypes', newTypes.join(','))
      } else {
        params.delete('recipeTypes')
      }
    } else {
      params.delete(filterKey)
      // Reset corresponding pending state
      switch (filterKey) {
        case 'caloriesFrom':
          setPendingCaloriesFrom('')
          break
        case 'caloriesTo':
          setPendingCaloriesTo('')
          break
        case 'proteinFrom':
          setPendingProteinFrom('')
          break
        case 'proteinTo':
          setPendingProteinTo('')
          break
        case 'carbsFrom':
          setPendingCarbsFrom('')
          break
        case 'carbsTo':
          setPendingCarbsTo('')
          break
        case 'fatFrom':
          setPendingFatFrom('')
          break
        case 'fatTo':
          setPendingFatTo('')
          break
        case 'prepTimeFrom':
          setPendingPrepTimeFrom('')
          break
        case 'prepTimeTo':
          setPendingPrepTimeTo('')
          break
        case 'sortBy':
          setPendingSortBy('')
          break
        case 'mustHaveImages':
          setPendingMustHaveImages(false)
          break
      }
    }

    params.delete('page')

    startTransition(() => {
      router.push(`/recipes?${params.toString()}`)
    })
  }

  // Range input component
  const RangeInput = ({
    label,
    fromValue,
    toValue,
    onFromChange,
    onToChange,
    min,
    max,
    unit = '',
  }: {
    label: string
    fromValue: string
    toValue: string
    onFromChange: (val: string) => void
    onToChange: (val: string) => void
    min: number
    max: number
    unit?: string
  }) => (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Min"
          value={fromValue}
          onChange={(e) => onFromChange(e.target.value)}
          min={min}
          max={max}
          className="w-20 px-2 py-1.5 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <span className="text-muted-foreground">-</span>
        <input
          type="number"
          placeholder="Max"
          value={toValue}
          onChange={(e) => onToChange(e.target.value)}
          min={min}
          max={max}
          className="w-20 px-2 py-1.5 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  )

  return (
    <div className="bg-muted border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Toggle Filters Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors',
              showFilters || hasActiveFilters
                ? 'bg-primary text-primary-foreground'
                : 'bg-background border border-input hover:bg-accent'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-foreground/20 rounded-full">
                {[
                  currentRecipeTypes.length > 0,
                  currentCaloriesFrom || currentCaloriesTo,
                  currentProteinFrom || currentProteinTo,
                  currentCarbsFrom || currentCarbsTo,
                  currentFatFrom || currentFatTo,
                  currentPrepTimeFrom || currentPrepTimeTo,
                  currentSortBy,
                  currentMustHaveImages,
                ].filter(Boolean).length}
              </span>
            )}
            {showFilters ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              disabled={isPending}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Expanded Filters Panel */}
        {showFilters && (
          <div className="mt-4 space-y-4">
            {/* Row 1: Recipe Types, Sort, Has Images */}
            <div className="flex flex-wrap items-start gap-4">
              {/* Recipe Types Dropdown */}
              <div className="relative flex-1 min-w-[200px]">
                <button
                  onClick={() => setShowRecipeTypes(!showRecipeTypes)}
                  disabled={isPending || isLoadingTypes}
                  className={cn(
                    'w-full px-4 py-2.5 text-sm font-medium text-left rounded-xl bg-background border border-input',
                    'hover:bg-accent hover:border-ring/50',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'transition-all flex items-center justify-between'
                  )}
                >
                  <span className="text-foreground">
                    {isLoadingTypes
                      ? 'Loading...'
                      : pendingRecipeTypes.length === 0
                        ? 'All Recipe Types'
                        : `${pendingRecipeTypes.length} type${pendingRecipeTypes.length > 1 ? 's' : ''} selected`}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>

                {showRecipeTypes && (
                  <div className="absolute z-50 mt-2 w-full bg-popover border border-border rounded-xl shadow-lg max-h-64 overflow-y-auto">
                    {recipeTypes.map((type) => (
                      <label
                        key={type.value}
                        className="flex items-center px-4 py-2.5 hover:bg-accent cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={pendingRecipeTypes.includes(type.value)}
                          onCheckedChange={() => toggleRecipeType(type.value)}
                        />
                        <span className="ml-3 text-sm text-foreground">{type.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="relative min-w-[180px]">
                <select
                  value={pendingSortBy}
                  onChange={(e) => setPendingSortBy(e.target.value as SortOption | '')}
                  disabled={isPending}
                  className={cn(
                    'w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-background border border-input',
                    'hover:bg-accent hover:border-ring/50',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'transition-all appearance-none cursor-pointer'
                  )}
                >
                  <option value="">Sort: Default</option>
                  {ALLOWED_SORT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {SORT_LABELS[option]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Must Have Images Toggle */}
              <label className="flex items-center gap-2 px-4 py-2.5 bg-background border border-input rounded-xl cursor-pointer hover:bg-accent transition-colors">
                <Checkbox
                  checked={pendingMustHaveImages}
                  onCheckedChange={(checked) => setPendingMustHaveImages(checked === true)}
                />
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Has Images</span>
              </label>
            </div>

            {/* Row 2: Nutrition Filters */}
            <div className="p-4 bg-background rounded-xl border border-input">
              <button
                onClick={() => setShowNutrition(!showNutrition)}
                className="flex items-center justify-between w-full text-sm font-medium"
              >
                <span>Nutrition Filters</span>
                {showNutrition ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showNutrition && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <RangeInput
                    label="Calories"
                    fromValue={pendingCaloriesFrom}
                    toValue={pendingCaloriesTo}
                    onFromChange={setPendingCaloriesFrom}
                    onToChange={setPendingCaloriesTo}
                    min={FILTER_LIMITS.minCalories}
                    max={FILTER_LIMITS.maxCalories}
                    unit="kcal"
                  />
                  <RangeInput
                    label="Protein %"
                    fromValue={pendingProteinFrom}
                    toValue={pendingProteinTo}
                    onFromChange={setPendingProteinFrom}
                    onToChange={setPendingProteinTo}
                    min={FILTER_LIMITS.minPercentage}
                    max={FILTER_LIMITS.maxPercentage}
                    unit="%"
                  />
                  <RangeInput
                    label="Carbs %"
                    fromValue={pendingCarbsFrom}
                    toValue={pendingCarbsTo}
                    onFromChange={setPendingCarbsFrom}
                    onToChange={setPendingCarbsTo}
                    min={FILTER_LIMITS.minPercentage}
                    max={FILTER_LIMITS.maxPercentage}
                    unit="%"
                  />
                  <RangeInput
                    label="Fat %"
                    fromValue={pendingFatFrom}
                    toValue={pendingFatTo}
                    onFromChange={setPendingFatFrom}
                    onToChange={setPendingFatTo}
                    min={FILTER_LIMITS.minPercentage}
                    max={FILTER_LIMITS.maxPercentage}
                    unit="%"
                  />
                  <RangeInput
                    label="Prep Time"
                    fromValue={pendingPrepTimeFrom}
                    toValue={pendingPrepTimeTo}
                    onFromChange={setPendingPrepTimeFrom}
                    onToChange={setPendingPrepTimeTo}
                    min={FILTER_LIMITS.minPrepTime}
                    max={FILTER_LIMITS.maxPrepTime}
                    unit="min"
                  />
                </div>
              )}
            </div>

            {/* Apply Button */}
            {hasPendingChanges && (
              <div className="flex justify-end">
                <button
                  onClick={applyFilters}
                  disabled={isPending}
                  className="px-6 py-2.5 text-sm font-semibold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Apply Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active Filter Chips */}
        {hasActiveFilters && !showFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {/* Recipe Type Chips */}
            {currentRecipeTypes.map((type) => (
              <button
                key={type}
                onClick={() => removeFilter('recipeTypes', type)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                {type}
                <X className="h-3 w-3" />
              </button>
            ))}

            {/* Calorie Chip */}
            {(currentCaloriesFrom || currentCaloriesTo) && (
              <button
                onClick={() => {
                  removeFilter('caloriesFrom')
                  removeFilter('caloriesTo')
                }}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                Calories: {currentCaloriesFrom || '0'}-{currentCaloriesTo || '∞'}
                <X className="h-3 w-3" />
              </button>
            )}

            {/* Prep Time Chip */}
            {(currentPrepTimeFrom || currentPrepTimeTo) && (
              <button
                onClick={() => {
                  removeFilter('prepTimeFrom')
                  removeFilter('prepTimeTo')
                }}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                Prep: {currentPrepTimeFrom || '0'}-{currentPrepTimeTo || '∞'} min
                <X className="h-3 w-3" />
              </button>
            )}

            {/* Sort Chip */}
            {currentSortBy && (
              <button
                onClick={() => removeFilter('sortBy')}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                {SORT_LABELS[currentSortBy]}
                <X className="h-3 w-3" />
              </button>
            )}

            {/* Has Images Chip */}
            {currentMustHaveImages && (
              <button
                onClick={() => removeFilter('mustHaveImages')}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                Has Images
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Close dropdowns when clicking outside */}
      {showRecipeTypes && (
        <div className="fixed inset-0 z-40" onClick={() => setShowRecipeTypes(false)} />
      )}
    </div>
  )
}
