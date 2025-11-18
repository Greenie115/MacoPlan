'use client'

import { cn } from '@/lib/utils'
import { macroColors, progressColors } from '@/lib/design-tokens'

interface MacroProgressBarProps {
  type: 'protein' | 'carbs' | 'fat'
  eaten: number
  target: number
  showCalories?: boolean // Show calorie breakdown
}

export function MacroProgressBar({
  type,
  eaten,
  target,
  showCalories = false,
}: MacroProgressBarProps) {
  const percentage = target > 0 ? (eaten / target) * 100 : 0
  const remaining = Math.max(0, target - eaten)

  // Determine progress color based on percentage
  const getProgressColor = () => {
    if (percentage >= 90 && percentage <= 110) return progressColors.onTrack
    if (
      (percentage >= 80 && percentage < 90) ||
      (percentage > 110 && percentage <= 120)
    ) {
      return progressColors.warning
    }
    return progressColors.danger
  }

  // Get macro-specific colors
  const colors = macroColors[type]

  // Calculate calories for this macro
  const caloriesPerGram = type === 'fat' ? 9 : 4
  const caloriesEaten = eaten * caloriesPerGram
  const caloriesTarget = target * caloriesPerGram

  return (
    <div className="space-y-2">
      {/* Macro Name & Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Icon/Emoji */}
          <span className="text-lg">
            {type === 'protein' ? '🥩' : type === 'carbs' ? '🍞' : '🥑'}
          </span>

          {/* Label */}
          <div className="flex flex-col">
            <p className="text-xs font-medium text-muted-foreground capitalize">
              {type}
            </p>
            {showCalories && (
              <p className="text-[10px] text-muted-foreground">
                {caloriesEaten}/{caloriesTarget} cal
              </p>
            )}
          </div>
        </div>

        {/* Eaten/Target */}
        <div className="text-right">
          <p className="text-sm font-bold text-charcoal">
            <span className={cn(percentage > 100 && 'text-red-600')}>
              {eaten}
            </span>
            <span className="text-muted-foreground">/{target}g</span>
          </p>
          {remaining > 0 && (
            <p className="text-[10px] text-muted-foreground">{remaining}g left</p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <div
          className={cn(
            'h-1.5 rounded-full transition-all duration-500',
            getProgressColor()
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Warning text if over */}
      {percentage > 110 && (
        <p className="text-xs text-red-600 font-medium">
          {Math.round(percentage - 100)}% over target
        </p>
      )}
    </div>
  )
}
