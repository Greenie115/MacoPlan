'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Edit3 } from 'lucide-react'

interface MacroSummaryProps {
  protein: number
  carbs: number
  fat: number
  targetCalories: number
  isCustom: boolean
  showCustomizeButton?: boolean
  onCustomizeClick?: () => void
}

/**
 * Displays macro breakdown with visual bars
 * Shows calculated vs custom indicator
 */
export function MacroSummary({
  protein,
  carbs,
  fat,
  targetCalories,
  isCustom,
  showCustomizeButton = false,
  onCustomizeClick,
}: MacroSummaryProps) {
  // Calculate calories and percentages
  const proteinCal = protein * 4
  const carbsCal = carbs * 4
  const fatCal = fat * 9
  const totalCal = proteinCal + carbsCal + fatCal

  const proteinPct = Math.round((proteinCal / totalCal) * 100)
  const carbsPct = Math.round((carbsCal / totalCal) * 100)
  const fatPct = Math.round((fatCal / totalCal) * 100)

  // Macro data for rendering
  const macros = [
    {
      name: 'Protein',
      grams: protein,
      calories: proteinCal,
      percentage: proteinPct,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-100',
    },
    {
      name: 'Carbs',
      grams: carbs,
      calories: carbsCal,
      percentage: carbsPct,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100',
    },
    {
      name: 'Fat',
      grams: fat,
      calories: fatCal,
      percentage: fatPct,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-100',
    },
  ]

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-charcoal">
            Your Macro Plan
          </h3>
          {isCustom && (
            <p className="text-xs text-muted-foreground mt-1">
              Custom macros
            </p>
          )}
        </div>
        {showCustomizeButton && onCustomizeClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCustomizeClick}
            className="gap-2"
          >
            <Edit3 className="h-4 w-4" />
            {isCustom ? 'Edit' : 'Customize'}
          </Button>
        )}
      </div>

      <div className="space-y-1 text-center pb-2 border-b">
        <p className="text-sm text-muted-foreground">Daily Calorie Target</p>
        <p className="text-3xl font-bold text-charcoal">
          {targetCalories.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          calories per day
        </p>
      </div>

      <div className="space-y-4">
        {macros.map((macro) => (
          <div key={macro.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-charcoal">{macro.name}</span>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span>{macro.grams}g</span>
                <span>·</span>
                <span>{macro.calories} cal</span>
                <span>·</span>
                <span>{macro.percentage}%</span>
              </div>
            </div>
            <div className="relative h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 ${macro.color} rounded-full transition-all duration-300`}
                style={{ width: `${macro.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {!isCustom && (
        <p className="text-xs text-muted-foreground text-center pt-2">
          Based on ISSN evidence-based recommendations
        </p>
      )}
    </Card>
  )
}
