import { UtensilsCrossed } from 'lucide-react'
import { cn } from '@/lib/utils'

// Brand-tinted gradients, picked deterministically per recipe so the grid
// stays varied but stable across renders.
const GRADIENTS = [
  'from-orange-400/90 to-rose-500/90',
  'from-amber-400/90 to-orange-500/90',
  'from-rose-400/90 to-red-500/90',
  'from-orange-500/90 to-amber-400/90',
] as const

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

interface RecipeImageFallbackProps {
  title: string
  className?: string
  iconClassName?: string
}

/**
 * Branded placeholder shown when a recipe has no photo yet.
 * Renders a stable gradient + dish initial instead of an empty grey box.
 */
export function RecipeImageFallback({ title, className, iconClassName }: RecipeImageFallbackProps) {
  const gradient = GRADIENTS[hashString(title) % GRADIENTS.length]
  const initial = title.trim().charAt(0).toUpperCase() || '?'

  return (
    <div
      aria-hidden="true"
      className={cn(
        'w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br text-white',
        gradient,
        className
      )}
    >
      <UtensilsCrossed className={cn('size-8 opacity-80', iconClassName)} strokeWidth={1.5} />
      <span className="text-2xl font-bold opacity-90">{initial}</span>
    </div>
  )
}
