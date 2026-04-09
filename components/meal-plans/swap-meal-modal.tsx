'use client'

/**
 * Swap Meal Modal Component
 *
 * Allows users to swap a meal in their meal plan with an alternative
 * from Recipe-API.com matching their calorie/macro targets
 */

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, RefreshCw, Clock, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getSwapOptions, swapMeal } from '@/app/actions/meal-plans'
import { MealPlaceholder } from './meal-placeholder'
import type { MealPlanMeal } from '@/lib/types/database'

interface SwapOption {
  id: string | number
  title: string
  image: string | null
  readyInMinutes: number | null
  servings: number
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface SwapMealModalProps {
  isOpen: boolean
  onClose: () => void
  meal: MealPlanMeal
  targetCalories: number
  onSwapComplete: () => void
}

export function SwapMealModal({
  isOpen,
  onClose,
  meal,
  targetCalories,
  onSwapComplete,
}: SwapMealModalProps) {
  const [options, setOptions] = useState<SwapOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [selectedOption, setSelectedOption] = useState<SwapOption | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch swap options when modal opens
  useEffect(() => {
    if (isOpen && meal) {
      fetchSwapOptions()
    }
  }, [isOpen, meal])

  async function fetchSwapOptions() {
    setIsLoading(true)
    setError(null)
    setSelectedOption(null)

    try {
      const result = await getSwapOptions(
        meal.id,
        meal.meal_type,
        Math.round((meal.calories || 0) * meal.serving_multiplier)
      )

      if (result.success && result.data) {
        setOptions(result.data)
      } else {
        setError(result.error || 'Failed to fetch alternatives')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSwap() {
    if (!selectedOption) return

    setIsSwapping(true)
    try {
      const result = await swapMeal(meal.id, selectedOption.id.toString())

      if (result.success) {
        toast.success('Meal swapped successfully!')
        onSwapComplete()
      } else {
        toast.error(result.error || 'Failed to swap meal')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSwapping(false)
    }
  }

  // Close on escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="swap-modal-title"
        className="relative w-full sm:max-w-lg bg-card rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-4 flex items-center justify-between">
          <h2
            id="swap-modal-title"
            className="text-xl font-semibold text-foreground"
          >
            Swap Meal
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="flex size-10 items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <X className="size-5 text-icon" />
          </button>
        </div>

        {/* Current Meal Preview */}
        <div className="px-4 py-3 bg-muted border-b border-border">
          <p className="text-sm text-muted-foreground mb-2">Current meal:</p>
          <div className="flex items-center gap-3">
            <div className="relative size-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {meal.recipe_image_url ? (
                <Image
                  src={meal.recipe_image_url}
                  alt={meal.recipe_title}
                  fill
                  sizes="56px"
                  className="object-cover"
                  quality={85}
                />
              ) : (
                <MealPlaceholder
                  mealType={meal.meal_type}
                  className="h-full w-full"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{meal.recipe_title}</p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{Math.round((meal.calories || 0) * meal.serving_multiplier)} cal</span>
                <span className="text-protein">🥩 {Math.round((meal.protein_grams || 0) * meal.serving_multiplier)}g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="size-8 text-primary animate-spin mb-3" />
              <p className="text-muted-foreground">Finding alternatives...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchSwapOptions}
                className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-xl transition-colors"
              >
                <RefreshCw className="size-4" />
                Try Again
              </button>
            </div>
          ) : options.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-2">No alternatives found</p>
              <p className="text-sm text-muted-foreground/60 text-center">
                Try adjusting your dietary preferences or calorie targets
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-3">
                Select an alternative ({options.length} options):
              </p>
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option)}
                  className={cn(
                    'w-full flex items-start gap-3 p-3 rounded-2xl border-2 transition-all text-left',
                    selectedOption?.id === option.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-border-strong bg-card'
                  )}
                >
                  {/* Recipe Image */}
                  <div className="relative size-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {option.image ? (
                      <Image
                        src={option.image}
                        alt={option.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                        quality={85}
                      />
                    ) : (
                      <MealPlaceholder
                        mealType={meal.meal_type}
                        className="h-full w-full"
                      />
                    )}
                    {selectedOption?.id === option.id && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="size-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="size-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recipe Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground line-clamp-2 mb-1">
                      {option.title}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Clock className="size-3.5 text-icon" />
                      <span>{option.readyInMinutes} min</span>
                      <span>·</span>
                      <span>{option.servings} serving{option.servings > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-medium text-foreground">{option.calories} cal</span>
                      <span className="text-protein">🥩 {option.protein}g</span>
                      <span className="text-carb">🍚 {option.carbs}g</span>
                      <span className="text-fat">🥑 {option.fat}g</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-card border-t border-border px-4 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-xl border-2 border-border text-muted-foreground font-semibold hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSwap}
            disabled={!selectedOption || isSwapping}
            className={cn(
              'flex-1 h-12 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2',
              selectedOption
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            {isSwapping ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Swapping...
              </>
            ) : (
              'Confirm Swap'
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
