'use client'

import { MealLogItem } from './meal-log-item'
import type { LoggedMeal } from '@/lib/types/meal-log'
import { cn } from '@/lib/utils'

interface MealLogListProps {
  meals: LoggedMeal[]
  onEdit: (meal: LoggedMeal) => void
  onDelete: (mealId: string) => void
}

export function MealLogList({ meals, onEdit, onDelete }: MealLogListProps) {
  if (meals.length === 0) {
    return (
      <div className="py-6 md:py-8 text-center">
        <div className="text-4xl md:text-5xl mb-3">🍽️</div>
        <p className="text-sm md:text-base text-muted-foreground">
          No meals logged today
        </p>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          Click &quot;Log Meal&quot; to get started!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2 md:space-y-3">
      {meals.map((meal) => (
        <MealLogItem
          key={meal.id}
          meal={meal}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
