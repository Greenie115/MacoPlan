import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading skeleton for the meal plans list page
 * Matches the responsive grid layout of MealPlansClient
 */
export default function MealPlansLoading() {
  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Sub-header with back button, title, and actions */}
      <div className="bg-background border-b border-border-strong">
        <div className="mx-auto max-w-5xl">
          <div className="flex h-14 items-center px-4">
            <Skeleton className="size-10 rounded-lg" />
            <div className="flex-1 flex justify-center">
              <Skeleton className="h-6 w-28" />
            </div>
            <Skeleton className="size-10 rounded-lg" />
          </div>

          {/* Tab Navigation Skeleton */}
          <div className="px-4">
            <div className="flex border-b border-border">
              {['All', 'This Week', 'Favorites'].map((tab, i) => (
                <div
                  key={tab}
                  className={`flex flex-1 flex-col items-center justify-center border-b-[3px] py-3 md:flex-none md:px-6 ${
                    i === 0 ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <Skeleton className={`h-5 ${i === 1 ? 'w-20' : i === 2 ? 'w-18' : 'w-8'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Plan Cards Grid - Responsive 1/2/3 columns */}
      <main className="mx-auto max-w-5xl p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <MealPlanCardSkeleton key={i} />
          ))}
        </div>
      </main>

      {/* Bottom Quota Footer Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-card/95 backdrop-blur-sm p-4 border-t border-border">
        <div className="text-center space-y-1">
          <Skeleton className="h-4 w-44 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton for a single meal plan card
 */
export function MealPlanCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border-strong bg-card p-4 space-y-4 shadow-sm">
      {/* Image Grid */}
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>

      {/* Title and Info */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>

      {/* Macros */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
      </div>

      {/* Button */}
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  )
}
