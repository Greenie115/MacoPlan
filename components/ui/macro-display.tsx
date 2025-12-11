/**
 * MacroDisplay Component
 *
 * Reusable component for displaying macro information consistently
 * across the app (meal cards, plan summaries, recipe details, etc.)
 */

import { cn } from '@/lib/utils'

interface MacroDisplayProps {
  protein: number
  carbs: number
  fat: number
  calories?: number
  /** Display size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Show emoji icons before values */
  showEmojis?: boolean
  /** Show labels (P, C, F or Protein, Carbs, Fat) */
  showLabels?: boolean
  /** Use full labels instead of abbreviations */
  fullLabels?: boolean
  /** Additional CSS classes */
  className?: string
  /** Layout direction */
  direction?: 'row' | 'column'
}

const sizeStyles = {
  sm: 'text-xs gap-2',
  md: 'text-sm gap-3',
  lg: 'text-base gap-4',
}

const macroConfig = {
  protein: {
    color: 'text-protein',
    emoji: '🥩',
    label: 'Protein',
    abbr: 'P',
  },
  carbs: {
    color: 'text-carb',
    emoji: '🍚',
    label: 'Carbs',
    abbr: 'C',
  },
  fat: {
    color: 'text-fat',
    emoji: '🥑',
    label: 'Fat',
    abbr: 'F',
  },
}

export function MacroDisplay({
  protein,
  carbs,
  fat,
  calories,
  size = 'md',
  showEmojis = true,
  showLabels = false,
  fullLabels = false,
  className,
  direction = 'row',
}: MacroDisplayProps) {
  const renderMacro = (
    value: number,
    config: (typeof macroConfig)[keyof typeof macroConfig]
  ) => {
    const label = fullLabels ? config.label : config.abbr
    return (
      <span className={cn('font-normal', config.color)}>
        {showEmojis && <span className="mr-0.5">{config.emoji}</span>}
        {Math.round(value)}g
        {showLabels && <span className="ml-0.5 text-gray-500">({label})</span>}
      </span>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center',
        sizeStyles[size],
        direction === 'column' && 'flex-col items-start',
        className
      )}
    >
      {calories !== undefined && (
        <span className="font-medium text-gray-700">
          {Math.round(calories)} cal
        </span>
      )}
      {renderMacro(protein, macroConfig.protein)}
      {renderMacro(carbs, macroConfig.carbs)}
      {renderMacro(fat, macroConfig.fat)}
    </div>
  )
}

/**
 * Compact macro display for tight spaces (e.g., list items)
 */
export function MacroDisplayCompact({
  protein,
  carbs,
  fat,
  className,
}: Pick<MacroDisplayProps, 'protein' | 'carbs' | 'fat' | 'className'>) {
  return (
    <div className={cn('flex items-center gap-2 text-xs text-gray-500', className)}>
      <span className="text-protein">{Math.round(protein)}g P</span>
      <span className="text-carb">{Math.round(carbs)}g C</span>
      <span className="text-fat">{Math.round(fat)}g F</span>
    </div>
  )
}

/**
 * Macro display with calories prominently featured
 */
export function MacroDisplayWithCalories({
  calories,
  protein,
  carbs,
  fat,
  className,
}: Required<Pick<MacroDisplayProps, 'calories' | 'protein' | 'carbs' | 'fat'>> & {
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="text-lg font-semibold text-gray-900">
        {Math.round(calories).toLocaleString()} cal
      </span>
      <MacroDisplay
        protein={protein}
        carbs={carbs}
        fat={fat}
        size="sm"
        showEmojis={true}
      />
    </div>
  )
}
