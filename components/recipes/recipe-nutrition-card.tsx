'use client'

/**
 * Recipe Nutrition Card with Serving Multiplier
 *
 * Displays nutritional info and allows users to adjust serving size.
 * When linked from a meal plan (mealId provided), changes persist to the meal plan.
 * Otherwise, changes are view-only.
 */

import { useState, useTransition } from 'react'
import { Minus, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { updateMealServing } from '@/app/actions/meal-plans'

interface RecipeNutritionCardProps {
  calories: number
  protein: number
  carbs: number
  fat: number
  servings?: number
  // When viewing from a meal plan, these allow persistence
  mealId?: string | null
  mealPlanId?: string | null
  initialMultiplier?: number
}

export function RecipeNutritionCard({
  calories,
  protein,
  carbs,
  fat,
  servings = 1,
  mealId,
  mealPlanId,
  initialMultiplier = 1.0,
}: RecipeNutritionCardProps) {
  const [multiplier, setMultiplier] = useState(initialMultiplier)
  const [isPending, startTransition] = useTransition()

  const isLinkedToMealPlan = !!mealId

  async function handleMultiplierChange(newMultiplier: number) {
    const clampedMultiplier = Math.max(0.5, Math.min(5.0, newMultiplier))
    setMultiplier(clampedMultiplier)

    // Persist to meal plan if linked
    if (mealId) {
      startTransition(async () => {
        const result = await updateMealServing(mealId, clampedMultiplier)
        if (!result.success) {
          toast.error(result.error || 'Failed to update serving')
          // Don't revert - user can see the change locally
        } else {
          toast.success('Serving size updated')
        }
      })
    }
  }

  function handleDecrease() {
    handleMultiplierChange(multiplier - 0.5)
  }

  function handleIncrease() {
    handleMultiplierChange(multiplier + 0.5)
  }

  const adjustedCalories = Math.round(calories * multiplier)
  const adjustedProtein = Math.round(protein * multiplier)
  const adjustedCarbs = Math.round(carbs * multiplier)
  const adjustedFat = Math.round(fat * multiplier)

  return (
    <div className="bg-card rounded-2xl border border-border-strong p-4">
      {/* Header with Serving Adjuster */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Nutrition {multiplier !== 1.0 ? `(${multiplier}x serving)` : 'per serving'}
          </h2>
          {isLinkedToMealPlan && (
            <p className="text-xs text-primary mt-0.5">Linked to meal plan</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDecrease}
            disabled={multiplier <= 0.5 || isPending}
            className="flex size-8 items-center justify-center rounded-full bg-muted border border-border hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease serving"
          >
            <Minus className="size-4 text-foreground" />
          </button>
          <span className={cn(
            "min-w-[50px] text-center font-semibold text-sm",
            isPending && "opacity-50"
          )}>
            {isPending ? <Loader2 className="size-4 animate-spin mx-auto" /> : `${multiplier}x`}
          </span>
          <button
            onClick={handleIncrease}
            disabled={multiplier >= 5.0 || isPending}
            className="flex size-8 items-center justify-center rounded-full bg-muted border border-border hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Increase serving"
          >
            <Plus className="size-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Nutrition Grid */}
      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="bg-muted rounded-xl p-3">
          <p className={cn(
            "text-xl font-bold text-foreground",
            multiplier !== 1.0 && "text-primary"
          )}>
            {adjustedCalories}
          </p>
          <p className="text-xs text-muted-foreground">Calories</p>
        </div>
        <div className="bg-protein/10 rounded-xl p-3">
          <p className={cn(
            "text-xl font-bold text-protein",
            multiplier !== 1.0 && "text-protein"
          )}>
            {adjustedProtein}g
          </p>
          <p className="text-xs text-muted-foreground">Protein</p>
        </div>
        <div className="bg-carb/10 rounded-xl p-3">
          <p className={cn(
            "text-xl font-bold text-carb",
            multiplier !== 1.0 && "text-carb"
          )}>
            {adjustedCarbs}g
          </p>
          <p className="text-xs text-muted-foreground">Carbs</p>
        </div>
        <div className="bg-fat/10 rounded-xl p-3">
          <p className={cn(
            "text-xl font-bold text-fat",
            multiplier !== 1.0 && "text-fat"
          )}>
            {adjustedFat}g
          </p>
          <p className="text-xs text-muted-foreground">Fat</p>
        </div>
      </div>

      {/* Helper text when adjusted */}
      {multiplier !== 1.0 && (
        <p className="text-xs text-muted-foreground text-center mt-3">
          Base serving: {Math.round(calories)} cal, {Math.round(protein)}g P, {Math.round(carbs)}g C, {Math.round(fat)}g F
        </p>
      )}
    </div>
  )
}
