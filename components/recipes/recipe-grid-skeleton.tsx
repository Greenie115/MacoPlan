import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton shown in place of the results grid while a search/tab change
 * streams in. The page chrome (search bar, tabs, filters) stays mounted.
 * Mirrors RecipeCard's shape exactly so the swap-in doesn't jump.
 */
export function RecipeGridSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-6 pb-28">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,45vw),1fr))] gap-4 md:gap-5 lg:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

function RecipeCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border-strong bg-card p-4 shadow-sm">
      {/* Image, with a favorite-button-shaped dot to match the real card */}
      <div className="relative aspect-square w-full shrink-0">
        <Skeleton className="size-full rounded-xl" />
        <Skeleton className="absolute top-2 right-2 size-9 rounded-full" />
      </div>

      {/* Title */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Calories */}
      <Skeleton className="h-4 w-16" />

      {/* Macros */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 w-10" />
      </div>
    </div>
  )
}
