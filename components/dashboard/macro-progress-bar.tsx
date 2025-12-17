'use client'

import { cn } from '@/lib/utils'

interface MacroProgressBarProps {
  type: 'protein' | 'carbs' | 'fat'
  eaten: number
  target: number
  showCalories?: boolean
}

const macroConfig = {
  protein: {
    emoji: '🥩',
    label: 'Protein',
    barColor: 'bg-protein',
    textColor: 'text-protein',
  },
  carbs: {
    emoji: '🍚',
    label: 'Carbs',
    barColor: 'bg-carb',
    textColor: 'text-carb',
  },
  fat: {
    emoji: '🥑',
    label: 'Fat',
    barColor: 'bg-fat',
    textColor: 'text-fat',
  },
} as const

export function MacroProgressBar({
  type,
  eaten,
  target,
  showCalories = false,
}: MacroProgressBarProps) {
  const config = macroConfig[type]
  const percentage = target > 0 ? Math.round((eaten / target) * 100) : 0
  const isOver = percentage > 100

  // Calculate calories for this macro
  const caloriesPerGram = type === 'fat' ? 9 : 4
  const caloriesEaten = Math.round(eaten * caloriesPerGram)

  return (
    <div className="flex items-center gap-3">
      {/* Emoji */}
      <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center flex-shrink-0">
        <span className="text-base">{config.emoji}</span>
      </div>

      {/* Progress Section */}
      <div className="flex-1 min-w-0">
        {/* Label Row */}
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm font-medium text-foreground">{config.label}</span>
          <div className="flex items-baseline gap-1.5">
            <span className={cn('text-sm font-bold', config.textColor)}>
              {Math.round(eaten)}g
            </span>
            <span className="text-xs text-muted-foreground">/ {Math.round(target)}g</span>
            {showCalories && (
              <span className="text-xs text-muted-foreground ml-1">
                • {caloriesEaten} cal
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-background rounded-full h-2 overflow-hidden">
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-500 ease-out',
              isOver ? 'bg-warning' : config.barColor
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        {/* Percentage / Over indicator */}
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-muted-foreground">{percentage}%</span>
          {isOver && (
            <span className="text-xs font-medium text-warning">
              +{Math.round(eaten - target)}g over
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
