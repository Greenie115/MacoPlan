import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading skeleton for the meal plans list page
 */
export default function MealPlansLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="px-4 pt-4">
        <div className="flex border-b border-border">
          <Skeleton className="h-10 w-16 mx-2" />
          <Skeleton className="h-10 w-24 mx-2" />
          <Skeleton className="h-10 w-28 mx-2" />
        </div>
      </div>

      {/* Plan Cards Skeleton */}
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <MealPlanCardSkeleton key={i} />
        ))}
      </div>

      {/* Bottom Quota Footer Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-52" />
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
