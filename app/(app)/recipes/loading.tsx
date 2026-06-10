import { Skeleton } from '@/components/ui/skeleton'

export default function RecipesLoading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Search Skeleton */}
      <div className="max-w-7xl mx-auto">
        <div className="px-4 py-4">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>

      {/* Tabs Skeleton (Popular / Favorites / All) */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex border-b border-border">
          <div className="flex gap-1">
            {['Popular', 'Favorites', 'All Recipes'].map((tab, i) => (
              <div
                key={tab}
                className={`py-3 px-4 border-b-2 ${i === 0 ? 'border-primary' : 'border-transparent'}`}
              >
                <Skeleton className={`h-5 ${i === 2 ? 'w-24' : 'w-16'}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Filters Toggle Skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Upgrade Banner Skeleton */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Recipe Grid Skeleton - Responsive 2-4 columns */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-28">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Bottom Navigation Skeleton - Mobile only */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-card border-t border-border">
        <div className="flex justify-around py-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1 p-2">
              <Skeleton className="size-6" />
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton for a single recipe card
 */
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
