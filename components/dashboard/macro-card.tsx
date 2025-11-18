'use client'

import { cn } from '@/lib/utils'
import { macroColors } from '@/lib/design-tokens'

interface MacroCardProps {
  type: 'protein' | 'carbs' | 'fat'
  eaten: number
  target: number
}

export function MacroCard({ type, eaten, target }: MacroCardProps) {
  const macro = {
    protein: {
      emoji: macroColors.protein.emoji,
      label: 'Protein',
      color: macroColors.protein.primary,
      bgColor: macroColors.protein.bg,
      textColor: macroColors.protein.text,
      borderColor: macroColors.protein.border,
    },
    carbs: {
      emoji: macroColors.carbs.emoji,
      label: 'Carbs',
      color: macroColors.carbs.primary,
      bgColor: macroColors.carbs.bg,
      textColor: macroColors.carbs.text,
      borderColor: macroColors.carbs.border,
    },
    fat: {
      emoji: macroColors.fat.emoji,
      label: 'Fat',
      color: macroColors.fat.primary,
      bgColor: macroColors.fat.bg,
      textColor: macroColors.fat.text,
      borderColor: macroColors.fat.border,
    },
  }[type]

  const percentage = Math.min((eaten / target) * 100, 100)
  const isOver = (eaten / target) * 100 > 100
  const remaining = Math.max(0, target - eaten)

  // Mini donut ring configuration
  const size = 120
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (percentage / 100) * circumference

  return (
    <div
      className={cn(
        'relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all',
        'hover:shadow-md',
        macro.bgColor,
        macro.borderColor
      )}
    >
      {/* Left: Mini Donut Ring */}
      <div className="relative flex-shrink-0">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth={strokeWidth}
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={macro.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            style={{
              animation: 'drawCircle 1s ease-out',
            }}
          />
        </svg>

        {/* Center text - grams eaten */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color: macro.color }}>
            {eaten}
          </span>
          <span className="text-xs text-muted-foreground">of {target}g</span>
        </div>
      </div>

      {/* Right: Info */}
      <div className="flex-1 min-w-0">
        {/* Emoji and Label */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{macro.emoji}</span>
          <h3 className="text-lg font-semibold text-charcoal">{macro.label}</h3>
        </div>

        {/* Stats */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span
              className={cn(
                'text-sm font-bold',
                isOver ? 'text-red-600' : macro.textColor
              )}
            >
              {Math.round((eaten / target) * 100)}%
            </span>
          </div>

          {remaining > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Remaining</span>
              <span className="text-sm font-medium text-charcoal">
                {remaining}g
              </span>
            </div>
          )}

          {isOver && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Over target</span>
              <span className="text-sm font-bold text-red-600">
                +{eaten - target}g
              </span>
            </div>
          )}
        </div>

        {/* Calories */}
        <div className="mt-2 pt-2 border-t border-gray-200">
          <span className="text-xs text-muted-foreground">
            {eaten * (type === 'fat' ? 9 : 4)} of {target * (type === 'fat' ? 9 : 4)} cal
          </span>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes drawCircle {
          from {
            stroke-dasharray: 0 1000;
          }
        }
      `}</style>
    </div>
  )
}
