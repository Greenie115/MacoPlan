'use client'

import { Card } from '@/components/ui/card'
import { MacroRing } from './macro-ring'
import { cn } from '@/lib/utils'

interface MealPlanCardProps {
  id: string
  name: string
  dateRange: string
  caloriesPerDay: number
  proteinGrams: number
  carbGrams: number
  fatGrams: number
  isActive?: boolean
  daysCompleted?: number
  totalDays?: number
  onClick?: () => void
}

export function MealPlanCard({
  id,
  name,
  dateRange,
  caloriesPerDay,
  proteinGrams,
  carbGrams,
  fatGrams,
  isActive = false,
  daysCompleted = 0,
  totalDays = 7,
  onClick,
}: MealPlanCardProps) {
  const completionPercent =
    totalDays > 0 ? Math.round((daysCompleted / totalDays) * 100) : 0

  return (
    <Card
      className={cn(
        'p-4 border-2 cursor-pointer transition-all hover:shadow-lg relative',
        isActive
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50'
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault()
          onClick()
        }
      }}
      aria-label={`${isActive ? 'Active: ' : ''}View ${name} meal plan`}
    >
      {/* Active Badge */}
      {isActive && (
        <div className="absolute top-3 right-3 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
          Active
        </div>
      )}

      {/* Macro Ring (replaces 2x2 image grid) */}
      <div className="flex justify-center mb-3 pt-2">
        <MacroRing
          proteinGrams={proteinGrams}
          carbGrams={carbGrams}
          fatGrams={fatGrams}
          size="sm"
        />
      </div>

      {/* Plan Details */}
      <div className="space-y-2">
        <p className="text-base font-bold text-charcoal leading-tight">
          {name}
        </p>

        <p className="text-sm text-muted-foreground">{dateRange}</p>

        {/* Macro Breakdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-charcoal">
            {caloriesPerDay.toLocaleString()} cal
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            {proteinGrams}P / {carbGrams}C / {fatGrams}F
          </span>
        </div>

        {/* Completion Progress */}
        {totalDays > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs font-medium text-charcoal">
                {daysCompleted}/{totalDays} days
              </span>
            </div>

            <div className="flex gap-1">
              {Array.from({ length: totalDays }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex-1 h-1 rounded-full',
                    i < daysCompleted ? 'bg-primary' : 'bg-muted'
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
