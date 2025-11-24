'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CaloriesDonut } from './calories-donut'
import { MacroCard } from './macro-card'
import { typography, card } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

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
  onLogMeal,
  onViewPlan,
}: MacroTargetCardProps) {
  const router = useRouter()

  // Calculate overall progress
  const progressPercent =
    targetCalories > 0
      ? Math.round((caloriesEaten / targetCalories) * 100)
      : 0

  const caloriesRemaining = Math.max(0, targetCalories - caloriesEaten)

  // Determine state
  const isEmpty = caloriesEaten === 0
  const isComplete = progressPercent >= 95
  const isOver = progressPercent > 110

  return (
    <Card className={cn('shadow-md', 'p-4 md:p-6 lg:p-8 xl:p-10')}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div>
          <h2 className={cn(typography.h3Lg, 'text-charcoal')}>
            Today's Macro Target
          </h2>
          {totalMealsPlanned > 0 && (
            <p className="text-sm lg:text-base text-muted-foreground mt-1">
              {mealsLogged} of {totalMealsPlanned} meals logged
            </p>
          )}
        </div>

        {/* Status Badge */}
        {isComplete && !isOver && (
          <div className="px-3 py-1 lg:px-4 lg:py-2 bg-green-50 border border-green-200 rounded-full">
            <p className="text-xs lg:text-sm font-bold text-green-700">On Track ✓</p>
          </div>
        )}
        {isOver && (
          <div className="px-3 py-1 lg:px-4 lg:py-2 bg-red-50 border border-red-200 rounded-full">
            <p className="text-xs lg:text-sm font-bold text-red-700">Over Target</p>
          </div>
        )}
      </div>

      {/* Unified Layout - Donut + Macro Cards (All Screen Sizes) */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-6 lg:gap-8 xl:gap-10 mb-6">
        {/* Left Column: Calories Donut */}
        <div className="flex items-center justify-center md:justify-start">
          {/* Mobile: Extra Small */}
          <div className="block sm:hidden">
            <CaloriesDonut
              targetCalories={targetCalories}
              caloriesEaten={caloriesEaten}
              proteinGrams={proteinGrams}
              carbGrams={carbGrams}
              fatGrams={fatGrams}
              proteinEaten={proteinEaten}
              carbsEaten={carbsEaten}
              fatEaten={fatEaten}
              size="xs"
            />
          </div>

          {/* Small screens: Small */}
          <div className="hidden sm:block md:hidden">
            <CaloriesDonut
              targetCalories={targetCalories}
              caloriesEaten={caloriesEaten}
              proteinGrams={proteinGrams}
              carbGrams={carbGrams}
              fatGrams={fatGrams}
              proteinEaten={proteinEaten}
              carbsEaten={carbsEaten}
              fatEaten={fatEaten}
              size="sm"
            />
          </div>

          {/* Tablet: Medium */}
          <div className="hidden md:block lg:hidden">
            <CaloriesDonut
              targetCalories={targetCalories}
              caloriesEaten={caloriesEaten}
              proteinGrams={proteinGrams}
              carbGrams={carbGrams}
              fatGrams={fatGrams}
              proteinEaten={proteinEaten}
              carbsEaten={carbsEaten}
              fatEaten={fatEaten}
              size="md"
            />
          </div>

          {/* Desktop: Large */}
          <div className="hidden lg:block xl:hidden">
            <CaloriesDonut
              targetCalories={targetCalories}
              caloriesEaten={caloriesEaten}
              proteinGrams={proteinGrams}
              carbGrams={carbGrams}
              fatGrams={fatGrams}
              proteinEaten={proteinEaten}
              carbsEaten={carbsEaten}
              fatEaten={fatEaten}
              size="lg"
            />
          </div>

          {/* Desktop XL: Extra Large */}
          <div className="hidden xl:block">
            <CaloriesDonut
              targetCalories={targetCalories}
              caloriesEaten={caloriesEaten}
              proteinGrams={proteinGrams}
              carbGrams={carbGrams}
              fatGrams={fatGrams}
              proteinEaten={proteinEaten}
              carbsEaten={carbsEaten}
              fatEaten={fatEaten}
              size="xl"
            />
          </div>
        </div>

        {/* Right Column: Individual Macro Cards */}
        <div className="flex flex-col gap-2 md:gap-3 lg:gap-4">
          {/* Protein Card */}
          <MacroCard
            type="protein"
            eaten={proteinEaten}
            target={proteinGrams}
          />

          {/* Carbs Card */}
          <MacroCard type="carbs" eaten={carbsEaten} target={carbGrams} />

          {/* Fat Card */}
          <MacroCard type="fat" eaten={fatEaten} target={fatGrams} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={onLogMeal || (() => router.push('/meals/log'))}
          className="flex-1 font-semibold"
          aria-label="Log a meal"
        >
          <Plus className="size-4 mr-2" />
          Log Meal
        </Button>

        <Button
          variant="outline"
          onClick={onViewPlan || (() => router.push('/plans'))}
          className="flex-1 font-medium"
          aria-label="View today's meal plan"
        >
          View Plan
        </Button>
      </div>

      {/* Empty State */}
      {isEmpty && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> Log your first meal to start tracking your
            macros
          </p>
        </div>
      )}
    </Card>
  )
}
