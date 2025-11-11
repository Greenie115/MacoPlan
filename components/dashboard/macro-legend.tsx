'use client'

import { cn } from '@/lib/utils'
import { macroColors } from '@/lib/design-tokens'

interface MacroLegendProps {
  proteinEaten: number
  proteinTarget: number
  carbsEaten: number
  carbsTarget: number
  fatEaten: number
  fatTarget: number
  variant?: 'default' | 'compact'
}

export function MacroLegend({
  proteinEaten,
  proteinTarget,
  carbsEaten,
  carbsTarget,
  fatEaten,
  fatTarget,
  variant = 'default',
}: MacroLegendProps) {
  const macros = [
    {
      type: 'protein',
      icon: macroColors.protein.emoji,
      label: 'Protein',
      eaten: proteinEaten,
      target: proteinTarget,
      color: macroColors.protein.primary,
      bgColor: macroColors.protein.bg,
      textColor: macroColors.protein.text,
      borderColor: macroColors.protein.border,
    },
    {
      type: 'carbs',
      icon: macroColors.carbs.emoji,
      label: 'Carbs',
      eaten: carbsEaten,
      target: carbsTarget,
      color: macroColors.carbs.primary,
      bgColor: macroColors.carbs.bg,
      textColor: macroColors.carbs.text,
      borderColor: macroColors.carbs.border,
    },
    {
      type: 'fat',
      icon: macroColors.fat.emoji,
      label: 'Fat',
      eaten: fatEaten,
      target: fatTarget,
      color: macroColors.fat.primary,
      bgColor: macroColors.fat.bg,
      textColor: macroColors.fat.text,
      borderColor: macroColors.fat.border,
    },
  ]

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-3 gap-2 w-full">
        {macros.map((macro) => {
          const remaining = Math.max(0, macro.target - macro.eaten)
          const percentage = (macro.eaten / macro.target) * 100

          return (
            <div
              key={macro.type}
              className="flex flex-col items-center text-center"
            >
              {/* Color indicator */}
              <div
                className="w-3 h-3 rounded-full mb-1"
                style={{ backgroundColor: macro.color }}
              />

              {/* Label */}
              <p className="text-xs text-muted-foreground font-medium mb-1">
                {macro.label}
              </p>

              {/* Values */}
              <p className="text-sm font-bold text-charcoal">
                <span
                  className={cn(percentage > 100 && 'text-red-600')}
                  style={{ color: percentage <= 100 ? macro.color : undefined }}
                >
                  {macro.eaten}
                </span>
                <span className="text-muted-foreground text-xs">
                  /{macro.target}g
                </span>
              </p>

              {/* Remaining */}
              {remaining > 0 && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {remaining}g left
                </p>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Default variant - more detailed
  return (
    <div className="space-y-3">
      {macros.map((macro) => {
        const remaining = Math.max(0, macro.target - macro.eaten)
        const percentage = (macro.eaten / macro.target) * 100
        const caloriesPerGram = macro.type === 'fat' ? 9 : 4
        const caloriesEaten = macro.eaten * caloriesPerGram
        const caloriesTarget = macro.target * caloriesPerGram

        return (
          <div
            key={macro.type}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg border-2 transition-all',
              'hover:shadow-md hover:border-opacity-100',
              macro.bgColor,
              'border-opacity-50'
            )}
            style={{ borderColor: macro.color }}
          >
            <div className="flex items-center gap-3">
              {/* Icon */}
              <span className="text-2xl">{macro.icon}</span>

              {/* Info */}
              <div>
                <p className="text-sm font-semibold text-charcoal">
                  {macro.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {caloriesEaten}/{caloriesTarget} cal
                </p>
              </div>
            </div>

            {/* Values */}
            <div className="text-right">
              <p className="text-base font-bold text-charcoal">
                <span
                  className={cn(percentage > 100 && 'text-red-600')}
                  style={{
                    color: percentage <= 100 ? macro.color : undefined,
                  }}
                >
                  {macro.eaten}
                </span>
                <span className="text-muted-foreground text-sm">
                  /{macro.target}g
                </span>
              </p>
              {remaining > 0 && (
                <p className="text-xs text-muted-foreground">
                  {remaining}g remaining
                </p>
              )}
              {percentage > 100 && (
                <p className="text-xs text-red-600 font-medium">
                  {Math.round(percentage - 100)}% over
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
