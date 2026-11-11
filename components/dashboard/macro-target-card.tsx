'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, Plus, ChevronDown, ChevronUp } from 'lucide-react'
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
    <div className="flex h-full flex-col rounded-2xl border border-border-strong bg-card p-5 shadow-xs md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-sans text-sm font-medium tracking-normal text-muted-foreground">Today</h2>
          <p className="mt-1 font-display text-4xl font-extrabold sm:text-5xl tabular-nums tracking-tight text-foreground">
            {isOver ? (caloriesEaten - targetCalories).toLocaleString() : caloriesRemaining.toLocaleString()}
            <span className={cn('ml-2 whitespace-nowrap font-sans text-base font-medium tracking-normal', isOver ? 'text-warning' : 'text-muted-foreground')}>
              kcal {isOver ? 'over' : 'left'}
            </span>
          </p>
        </div>
        <Button onClick={onLogMeal} size="sm" className="shrink-0 gap-1.5">
          <Plus className="size-4" />
          Log meal
        </Button>
      </div>

      <div className="pt-5">
        <div className="h-2 rounded-full bg-muted" role="progressbar" aria-label="Calories" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
          <div
            className={cn('h-full rounded-full transition-[width] duration-500 ease-out-quint', isOver ? 'bg-warning' : 'bg-foreground')}
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
        <p className="mt-2 font-mono text-xs tabular-nums text-muted-foreground">
          {caloriesEaten.toLocaleString()} eaten of {targetCalories.toLocaleString()} kcal
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-5 border-t border-border pt-5">
        <MacroProgressBar type="protein" eaten={proteinEaten} target={proteinGrams} />
        <MacroProgressBar type="carbs" eaten={carbsEaten} target={carbGrams} />
        <MacroProgressBar type="fat" eaten={fatEaten} target={fatGrams} />
      </div>

      {/* Today&apos;s meals Section - Collapsible */}
      <div className="border-t border-border pt-4 mt-5">
        <button
          onClick={() => setIsMealsExpanded(!isMealsExpanded)}
          className="flex items-center justify-between w-full text-left group"
          aria-expanded={isMealsExpanded}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              Today&apos;s meals
            </span>
            <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full tabular-nums">
              {meals.length}
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground group-hover:text-foreground transition-colors duration-150">
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
            'overflow-hidden transition-all duration-200 ease-out-quint',
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

      <div className="mt-auto pt-4">
        <Button variant="outline" className="h-11 w-full" onClick={onViewPlan || (() => router.push('/meal-plans'))}>
          View today&apos;s plan
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
