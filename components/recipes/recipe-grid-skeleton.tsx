import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton shown in place of the results grid while a search/tab change
 * streams in. The page chrome (search bar, tabs, filters) stays mounted.
 */
export function RecipeGridSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-28">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

function RecipeCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
      {/* Image */}
      <Skeleton className="aspect-square w-full" />

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />

        {/* Calories */}
        <Skeleton className="h-4 w-20" />

        {/* Macros */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>

        {/* Add to Plan Button */}
        <Skeleton className="h-10 w-full rounded-xl mt-2" />
      </div>
    </div>
  )
}
