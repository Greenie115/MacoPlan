'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface MacroTargetCardProps {
  targetCalories: number
  proteinGrams: number
  carbGrams: number
  fatGrams: number
  caloriesEaten?: number
  proteinEaten?: number
  carbsEaten?: number
  fatEaten?: number
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
}: MacroTargetCardProps) {
  const router = useRouter()

  // Calculate progress percentage
  const progressPercent = targetCalories > 0
    ? Math.round((caloriesEaten / targetCalories) * 100)
    : 0

  return (
    <Card className="shadow-md p-4 md:p-6">
      <h2 className="text-lg font-bold text-charcoal">Today's Macro Target</h2>

      {/* Calorie Display */}
      <div className="flex items-baseline gap-2 mt-2">
        <p className="text-3xl md:text-4xl font-extrabold text-charcoal">
          {targetCalories.toLocaleString()}
        </p>
        <p className="text-base text-muted-foreground">cal</p>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-muted-foreground">Progress</span>
          <span className="text-sm font-medium text-muted-foreground">
            {progressPercent}% eaten
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Macro Breakdown */}
      <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
        {/* Protein */}
        <div className="flex items-center gap-2">
          <span className="text-xl">🥩</span>
          <div className="flex flex-col">
            <p className="text-xs text-muted-foreground">Protein</p>
            <p className="text-sm font-bold text-charcoal">{proteinGrams}g</p>
          </div>
        </div>

        {/* Carbs */}
        <div className="flex items-center gap-2">
          <span className="text-xl">🍚</span>
          <div className="flex flex-col">
            <p className="text-xs text-muted-foreground">Carbs</p>
            <p className="text-sm font-bold text-charcoal">{carbGrams}g</p>
          </div>
        </div>

        {/* Fat */}
        <div className="flex items-center gap-2">
          <span className="text-xl">🥑</span>
          <div className="flex flex-col">
            <p className="text-xs text-muted-foreground">Fat</p>
            <p className="text-sm font-bold text-charcoal">{fatGrams}g</p>
          </div>
        </div>
      </div>

      {/* View Plan Button */}
      <div className="mt-4">
        <Button
          variant="ghost"
          className="w-full text-primary hover:bg-primary/10"
          onClick={() => router.push('/plans/today')}
          aria-label="View today's meal plan"
        >
          View Today's Plan →
        </Button>
      </div>
    </Card>
  )
}
