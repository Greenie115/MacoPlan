'use client'

import { Card } from '@/components/ui/card'
import { MealPlaceholder } from '@/components/meal-plans/meal-placeholder'
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
  images?: string[]
  onClick?: () => void
  className?: string
}

// Meal types for placeholder grid positions
const GRID_MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const

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
  images = [],
  onClick,
  className,
}: MealPlanCardProps) {
  const completionPercent =
    totalDays > 0 ? Math.round((daysCompleted / totalDays) * 100) : 0

  // Take first 4 images (or fewer if not available)
  const gridImages = images.slice(0, 4)

  return (
    <Card
      className={cn(
        'p-4 cursor-pointer transition-all relative flex flex-col h-full',
        isActive
          ? 'border-primary border-2 bg-card'
          : 'border-border-strong hover:border-primary/50 bg-card',
        className
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
      {/* Image Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3 aspect-square w-full">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-full h-full rounded-xl overflow-hidden bg-muted"
          >
            {gridImages[i] ? (
              <div
                className="w-full h-full bg-center bg-no-repeat bg-cover"
                style={{ backgroundImage: `url(${gridImages[i]})` }}
                role="img"
                aria-label={`Meal preview ${i + 1}`}
              />
            ) : (
              <MealPlaceholder
                mealType={GRID_MEAL_TYPES[i]}
                className="w-full h-full"
                compact
              />
            )}
          </div>
        ))}
      </div>

      {/* Plan Details */}
      <div className="flex flex-col flex-1">
        <p className="text-base font-bold text-foreground leading-tight mb-0.5">
          {name}
        </p>

        <p className="text-sm text-muted-foreground mb-1">{dateRange}</p>

        <p className="text-primary text-sm font-medium mt-auto">
          {caloriesPerDay.toLocaleString()} cal/day
        </p>
      </div>
    </Card>
  )
}
