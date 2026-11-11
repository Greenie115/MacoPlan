import { Utensils, Coffee, Sandwich, UtensilsCrossed, Cookie, Salad } from 'lucide-react'
import { cn } from '@/lib/utils'

const ICONS = [
  ['breakfast', Coffee],
  ['lunch', Sandwich],
  ['dinner', UtensilsCrossed],
  ['snack', Cookie],
  ['salad', Salad],
  ['side', Salad],
] as const

/** Quiet placeholder for meals without a photo: a meal-type icon on a neutral tile. */
export function MealPlaceholder({
  mealType,
  className,
  compact = false,
}: {
  mealType: string
  className?: string
  /** Smaller icon for thumbnails */
  compact?: boolean
}) {
  const Icon = ICONS.find(([key]) => mealType.toLowerCase().includes(key))?.[1] ?? Utensils

  return (
    <div
      className={cn(
        'flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,var(--color-card),var(--color-muted))]',
        className
      )}
    >
      <Icon className={cn('text-foreground/20', compact ? 'size-8' : 'size-14')} strokeWidth={1.5} />
    </div>
  )
}
