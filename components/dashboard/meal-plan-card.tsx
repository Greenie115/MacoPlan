'use client'

import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MealPlanCardProps {
  id: string
  name: string
  dateRange: string
  caloriesPerDay: number
  images: string[]
  onClick?: () => void
}

export function MealPlanCard({
  id,
  name,
  dateRange,
  caloriesPerDay,
  images,
  onClick,
}: MealPlanCardProps) {
  return (
    <Card
      className={cn(
        'p-3 border border-border cursor-pointer transition-all hover:shadow-lg',
        onClick && 'hover:border-primary/50'
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
      aria-label={`View ${name} meal plan`}
    >
      {/* 2x2 Image Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {images.slice(0, 4).map((image, index) => (
          <div
            key={index}
            className="w-full aspect-square bg-muted rounded-lg overflow-hidden relative"
          >
            <Image
              src={image}
              alt={`Meal ${index + 1} from ${name}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 35vw, (max-width: 1024px) 20vw, 15vw"
            />
          </div>
        ))}
      </div>

      {/* Plan Details */}
      <div className="space-y-1">
        <p className="text-base font-bold text-charcoal leading-tight">
          {name}
        </p>
        <p className="text-sm text-muted-foreground">{dateRange}</p>
        <p className="text-sm font-medium text-primary">
          {caloriesPerDay.toLocaleString()} cal/day
        </p>
      </div>
    </Card>
  )
}
