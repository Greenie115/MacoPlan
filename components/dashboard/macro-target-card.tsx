'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { MacroProgressBar } from './macro-progress-bar'
import { MealLogList } from '@/components/meals/meal-log-list'
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
  meals = [],
  onEditMeal,
  onDeleteMeal,
  onLogMeal,
  onViewPlan,
}: MacroTargetCardProps) {
  const router = useRouter()
  const [isMealsExpanded, setIsMealsExpanded] = useState(false)

  // Calculate overall progress
  const progressPercent =
    targetCalories > 0
      ? Math.round((caloriesEaten / targetCalories) * 100)
      : 0

  const isOver = progressPercent > 110
  const caloriesRemaining = Math.max(0, targetCalories - caloriesEaten)

  // Limit meals shown to 3, with scroll if more
  const displayedMeals = meals

  return (
    <div className="flex flex-col items-stretch justify-start rounded-2xl shadow-sm bg-card p-5 md:p-6 border border-border-strong h-full">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-foreground text-lg md:text-xl font-bold leading-tight tracking-[-0.015em]">
            Today's Macro Target
          </p>
          {/* Calories Display */}
          <div className="flex items-baseline gap-2 pt-1">
            <p className="text-foreground text-3xl md:text-4xl font-extrabold leading-tight tracking-tighter">
              {targetCalories.toLocaleString()}
            </p>
            <p className="text-muted-foreground text-base font-normal">cal</p>
          </div>
        </div>

        {/* Log Meal Button */}
        <Button
          onClick={onLogMeal}
          size="sm"
          className="flex-shrink-0 gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Log Meal</span>
        </Button>
      </div>

      {/* Overall Progress Bar */}
      <div className="w-full pt-4 pb-2">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            {caloriesEaten.toLocaleString()} eaten
          </span>
          <span className={cn(
            'text-sm font-medium',
            isOver ? 'text-warning' : 'text-muted-foreground'
          )}>
            {isOver ? `${progressPercent - 100}% over` : `${caloriesRemaining.toLocaleString()} remaining`}
          </span>
        </div>
        <div className="w-full bg-background rounded-full h-2.5 md:h-3">
          <div
            className={cn(
              'h-2.5 md:h-3 rounded-full transition-all duration-500',
              isOver ? 'bg-warning' : 'bg-primary'
            )}
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Macro Breakdown Section */}
      <div className="border-t border-border-strong pt-4 mt-2 space-y-4">
        <MacroProgressBar
          type="protein"
          eaten={proteinEaten}
          target={proteinGrams}
          showCalories
        />
        <MacroProgressBar
          type="carbs"
          eaten={carbsEaten}
          target={carbGrams}
          showCalories
        />
        <MacroProgressBar
          type="fat"
          eaten={fatEaten}
          target={fatGrams}
          showCalories
        />
      </div>

      {/* Today's Meals Section - Collapsible */}
      <div className="border-t border-border-strong pt-4 mt-4">
        <button
          onClick={() => setIsMealsExpanded(!isMealsExpanded)}
          className="flex items-center justify-between w-full text-left group"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              Today's Meals
            </span>
            <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
              {meals.length}
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground group-hover:text-foreground transition-colors">
            <span className="text-xs">{isMealsExpanded ? 'Hide' : 'Show'}</span>
            {isMealsExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </button>

        {/* Meals List - Collapsible Content */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out',
            isMealsExpanded ? 'max-h-[400px] opacity-100 mt-3' : 'max-h-0 opacity-0'
          )}
        >
          <div className="max-h-[280px] overflow-y-auto scrollbar-thin">
            {onEditMeal && onDeleteMeal ? (
              <MealLogList
                meals={displayedMeals}
                onEdit={onEditMeal}
                onDelete={onDeleteMeal}
              />
            ) : (
              <MealLogList
                meals={displayedMeals}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            )}
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
