'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { MacroDonutChart } from './macro-donut-chart'
import { MacroLegend } from './macro-legend'
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
    <Card className={cn('shadow-md', card.padding.md)}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={cn(typography.h3, 'text-charcoal')}>
            Today's Macro Target
          </h2>
          {totalMealsPlanned > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {mealsLogged} of {totalMealsPlanned} meals logged
            </p>
          )}
        </div>

        {/* Status Badge */}
        {isComplete && !isOver && (
          <div className="px-3 py-1 bg-green-50 border border-green-200 rounded-full">
            <p className="text-xs font-bold text-green-700">On Track ✓</p>
          </div>
        )}
        {isOver && (
          <div className="px-3 py-1 bg-red-50 border border-red-200 rounded-full">
            <p className="text-xs font-bold text-red-700">Over Target</p>
          </div>
        )}
      </div>

      {/* Donut Chart Visualization - Responsive sizing */}
      <div className="mb-6 flex justify-center">
        {/* Mobile: Small size */}
        <div className="block md:hidden">
          <MacroDonutChart
            targetCalories={targetCalories}
            proteinGrams={proteinGrams}
            carbGrams={carbGrams}
            fatGrams={fatGrams}
            caloriesEaten={caloriesEaten}
            proteinEaten={proteinEaten}
            carbsEaten={carbsEaten}
            fatEaten={fatEaten}
            size="sm"
            showTooltip={true}
          />
        </div>

        {/* Tablet: Medium size */}
        <div className="hidden md:block lg:hidden">
          <MacroDonutChart
            targetCalories={targetCalories}
            proteinGrams={proteinGrams}
            carbGrams={carbGrams}
            fatGrams={fatGrams}
            caloriesEaten={caloriesEaten}
            proteinEaten={proteinEaten}
            carbsEaten={carbsEaten}
            fatEaten={fatEaten}
            size="md"
            showTooltip={true}
          />
        </div>

        {/* Desktop: Large size */}
        <div className="hidden lg:block">
          <MacroDonutChart
            targetCalories={targetCalories}
            proteinGrams={proteinGrams}
            carbGrams={carbGrams}
            fatGrams={fatGrams}
            caloriesEaten={caloriesEaten}
            proteinEaten={proteinEaten}
            carbsEaten={carbsEaten}
            fatEaten={fatEaten}
            size="lg"
            showTooltip={true}
          />
        </div>
      </div>

      {/* Macro Legend */}
      <div className="mb-4">
        <MacroLegend
          proteinEaten={proteinEaten}
          proteinTarget={proteinGrams}
          carbsEaten={carbsEaten}
          carbsTarget={carbGrams}
          fatEaten={fatEaten}
          fatTarget={fatGrams}
          variant="compact"
        />
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
          onClick={onViewPlan || (() => router.push('/plans/today'))}
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
