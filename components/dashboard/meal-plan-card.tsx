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
  images?: string[]
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
  images = [],
  onClick,
}: MealPlanCardProps) {
  const completionPercent =
    totalDays > 0 ? Math.round((daysCompleted / totalDays) * 100) : 0

  // Ensure we have 4 images for the grid, filling with placeholders if needed
  const displayImages = [...images]
  while (displayImages.length < 4) {
    displayImages.push('/placeholder-meal.jpg') // You might want a better placeholder strategy
  }
  const gridImages = displayImages.slice(0, 4)

  return (
    <Card
      className={cn(
        'p-4 cursor-pointer transition-all hover:shadow-lg relative flex flex-col h-full',
        isActive
          ? 'border-primary border-2 bg-card'
          : 'border-border-strong hover:border-primary/50 bg-card'
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
        {gridImages.map((img, i) => (
          <div
            key={i}
            className="w-full h-full bg-center bg-no-repeat bg-cover rounded-xl bg-muted"
            style={{ backgroundImage: `url(${img})` }}
            role="img"
            aria-label={`Meal preview ${i + 1}`}
          />
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
