import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton shown in place of the results grid while a search/tab change
 * streams in. The page chrome (search bar, tabs, filters) stays mounted.
 * Mirrors RecipeCard's shape exactly so the swap-in doesn't jump.
 */
export function RecipeGridSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-28 pt-12">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(220px,42vw),1fr))] gap-3 md:gap-5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

function RecipeCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-strong bg-card shadow-xs">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-2.5 p-3.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-1 w-full" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  )
}
