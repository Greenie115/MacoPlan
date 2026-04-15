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

  // All use primary orange (#F97316) as base with slight variations
  // to maintain brand consistency while differentiating meal types

  if (type.includes('breakfast')) {
    return {
      icon: Coffee,
      // Primary orange to warm amber
      gradient: 'bg-gradient-to-br from-primary to-amber-500'
    }
  }

  if (type.includes('lunch')) {
    return {
      icon: Sandwich,
      // Primary orange to deeper orange
      gradient: 'bg-gradient-to-br from-primary to-orange-600'
    }
  }

  if (type.includes('dinner')) {
    return {
      icon: UtensilsCrossed,
      // Primary orange to warm red-orange
      gradient: 'bg-gradient-to-br from-primary to-red-500'
    }
  }

  if (type.includes('snack')) {
    return {
      icon: Cookie,
      // Lighter orange tones
      gradient: 'bg-gradient-to-br from-amber-400 to-primary'
    }
  }

  if (type.includes('salad') || type.includes('side')) {
    return {
      icon: Salad,
      // Orange to yellow for fresh feel
      gradient: 'bg-gradient-to-br from-primary to-yellow-500'
    }
  }

  // Default fallback - brand primary
  return {
    icon: Utensils,
    gradient: 'bg-gradient-to-br from-primary/90 to-primary'
  }
}
