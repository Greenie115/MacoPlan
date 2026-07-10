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

  // Macro data for rendering — tokenized macro colors, never color alone (name is always printed)
  const macros = [
    {
      name: 'Protein',
      grams: protein,
      calories: proteinCal,
      percentage: proteinPct,
      textClass: 'text-protein',
      barClass: 'bg-protein',
    },
    {
      name: 'Carbs',
      grams: carbs,
      calories: carbsCal,
      percentage: carbsPct,
      textClass: 'text-carb',
      barClass: 'bg-carb',
    },
    {
      name: 'Fat',
      grams: fat,
      calories: fatCal,
      percentage: fatPct,
      textClass: 'text-fat',
      barClass: 'bg-fat',
    },
  ]

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Your MacroPlan
          </h3>
          {isCustom && (
            <p className="mt-1 text-xs font-semibold text-coral-700 dark:text-primary">
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

      <div className="space-y-1 border-b border-border pb-4 text-center">
        <p className="text-sm text-muted-foreground">Daily Calorie Target</p>
        <p className="font-mono text-3xl font-bold tabular-nums text-foreground">
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
              <span className={`font-semibold ${macro.textClass}`}>{macro.name}</span>
              <div className="flex items-center gap-3 font-mono tabular-nums text-muted-foreground">
                <span>{macro.grams}g</span>
                <span>·</span>
                <span>{macro.calories} cal</span>
                <span>·</span>
                <span>{macro.percentage}%</span>
              </div>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-[var(--duration-slow)] ease-out-quint ${macro.barClass}`}
                style={{ width: `${macro.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {!isCustom && (
        <p className="pt-2 text-center text-xs text-muted-foreground">
          Based on ISSN evidence-based recommendations
        </p>
      )}
    </Card>
  )
}
