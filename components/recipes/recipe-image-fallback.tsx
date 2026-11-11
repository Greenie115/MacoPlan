import { cn } from '@/lib/utils'

/**
 * Quiet placeholder for recipes without a photo yet: the dish initial on a
 * neutral tile, so a grid of missing photos doesn't shout over real ones.
 */
export function RecipeImageFallback({ title, className }: { title: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex size-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,var(--color-card),var(--color-muted))] font-display text-5xl font-bold text-foreground/15',
        className
      )}
    >
      {title.trim().charAt(0).toUpperCase() || '?'}
    </div>
  )
}
