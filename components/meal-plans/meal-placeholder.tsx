'use client'

import { Utensils, Coffee, Sandwich, UtensilsCrossed, Cookie, Salad } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MealPlaceholderProps {
  mealType: string
  className?: string
  /** Use compact version with smaller icon for thumbnails */
  compact?: boolean
}

/**
 * Placeholder component for meals without images.
 * Shows a meal-type-appropriate icon with brand-consistent styling.
 */
export function MealPlaceholder({ mealType, className, compact = false }: MealPlaceholderProps) {
  const { icon: Icon, gradient } = getMealTypeVisuals(mealType)

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        gradient,
        className
      )}
    >
      <Icon
        className={cn(
          "text-white/70",
          compact ? "size-8" : "size-16"
        )}
        strokeWidth={1.5}
      />
    </div>
  )
}

/**
 * Returns the appropriate icon and gradient for each meal type.
 * Uses Macro Plan brand colors for consistency.
 */
function getMealTypeVisuals(mealType: string) {
  const type = mealType.toLowerCase()

  // Coral (primary) base with macro-palette accents, varied per meal type
  // to differentiate while staying on-brand

  if (type.includes('breakfast')) {
    return {
      icon: Coffee,
      // Coral to amber (fat)
      gradient: 'bg-gradient-to-br from-primary to-amber-400'
    }
  }

  if (type.includes('lunch')) {
    return {
      icon: Sandwich,
      // Coral to sky (carbs)
      gradient: 'bg-gradient-to-br from-primary to-sky-400'
    }
  }

  if (type.includes('dinner')) {
    return {
      icon: UtensilsCrossed,
      // Coral to rose
      gradient: 'bg-gradient-to-br from-primary to-rose-500'
    }
  }

  if (type.includes('snack')) {
    return {
      icon: Cookie,
      // Amber to coral
      gradient: 'bg-gradient-to-br from-amber-400 to-primary'
    }
  }

  if (type.includes('salad') || type.includes('side')) {
    return {
      icon: Salad,
      // Coral to emerald for a fresh feel
      gradient: 'bg-gradient-to-br from-primary to-emerald-400'
    }
  }

  // Default fallback - brand primary
  return {
    icon: Utensils,
    gradient: 'bg-gradient-to-br from-primary/90 to-primary'
  }
}
