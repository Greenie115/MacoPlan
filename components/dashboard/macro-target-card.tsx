'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CaloriesDonut } from './calories-donut'
import { MacroCard } from './macro-card'
import { MealLogList } from '@/components/meals/meal-log-list'
import { typography, card } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'
import type { LoggedMeal } from '@/lib/types/meal-log'

interface MacroTargetCardProps {
  // Targets
  targetCalories: number
  proteinGrams: number
  carbGrams: number
  fatGrams: number

  // Progress
  caloriesEaten?: number
  proteinEaten?: number
  carbsEaten?: number
  fatEaten?: number

  // Metadata
  mealsLogged?: number
  totalMealsPlanned?: number

  // Meal logging
  meals?: LoggedMeal[]
  onEditMeal?: (meal: LoggedMeal) => void
  onDeleteMeal?: (mealId: string) => void

  // Actions
  onLogMeal?: () => void
  onViewPlan?: () => void
}

export function MacroTargetCard({
  targetCalories,
  proteinGrams,
  carbGrams,
  fatGrams,
  caloriesEaten = 0,
  proteinEaten = 0,
  carbsEaten = 0,
  fatEaten = 0,
  mealsLogged = 0,
  totalMealsPlanned = 0,
  meals,
  onEditMeal,
  onDeleteMeal,
  onLogMeal,
  onViewPlan,
}: MacroTargetCardProps) {
  const router = useRouter()

  // Calculate overall progress
  const progressPercent =
    targetCalories > 0
      ? Math.round((caloriesEaten / targetCalories) * 100)
      : 0

  // Determine state
  const isComplete = progressPercent >= 95
  const isOver = progressPercent > 110

  return (
    <div className="flex flex-col items-stretch justify-start rounded-2xl shadow-sm bg-card p-5 md:p-6 border border-border-strong h-full">
      <p className="text-foreground text-lg md:text-xl font-bold leading-tight tracking-[-0.015em]">
        Today's Macro Target
      </p>

      {/* Calories Display */}
      <div className="flex items-baseline gap-2 pt-2">
        <p className="text-foreground text-3xl md:text-4xl font-extrabold leading-tight tracking-tighter">
          {targetCalories.toLocaleString()}
        </p>
        <p className="text-muted-foreground text-base font-normal">cal</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full pt-3 pb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-muted-foreground">Progress</span>
          <span className="text-sm font-medium text-muted-foreground">{progressPercent}% eaten</span>
        </div>
        <div className="w-full bg-background rounded-full h-2.5 md:h-3">
          <div
            className={cn(
              'h-2.5 md:h-3 rounded-full transition-all duration-500',
              isOver ? 'bg-warning' : 'bg-primary'
            )}
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Macro Grid - Responsive */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 border-t border-border-strong pt-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-protein/10 flex items-center justify-center flex-shrink-0">
            <span className="text-lg sm:text-xl">🥩</span>
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-muted-foreground text-xs sm:text-sm font-medium">Protein</p>
            <p className="text-protein text-sm sm:text-base font-bold">{proteinGrams}g</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-carb/10 flex items-center justify-center flex-shrink-0">
            <span className="text-lg sm:text-xl">🍚</span>
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-muted-foreground text-xs sm:text-sm font-medium">Carbs</p>
            <p className="text-carb text-sm sm:text-base font-bold">{carbGrams}g</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-fat/10 flex items-center justify-center flex-shrink-0">
            <span className="text-lg sm:text-xl">🥑</span>
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-muted-foreground text-xs sm:text-sm font-medium">Fat</p>
            <p className="text-fat text-sm sm:text-base font-bold">{fatGrams}g</p>
          </div>
        </div>
      </div>

      {/* Action Button - Pushed to bottom */}
      <div className="pt-4 mt-auto">
        <button
          onClick={onViewPlan || (() => router.push('/meal-plans'))}
          className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-11 md:h-12 px-4 bg-primary/10 text-primary text-sm md:text-base font-semibold leading-normal hover:bg-primary/20 transition-colors"
        >
          <span className="truncate">View Today's Plan →</span>
        </button>
      </div>
    </div>
  )
}
