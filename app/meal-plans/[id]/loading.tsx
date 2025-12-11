import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading skeleton for the meal plan detail view
 */
export default function MealPlanDetailLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header Skeleton */}
      <div className="sticky top-0 z-10 bg-white p-4 pb-2 flex items-center justify-between border-b border-gray-100">
        <Skeleton className="size-12 rounded-lg" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-12 w-20 rounded-lg" />
          <Skeleton className="size-12 rounded-lg" />
        </div>
      </div>

      {/* Page Title Skeleton */}
      <div className="px-4 pt-2 pb-4">
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-5 w-1/2" />
      </div>

      {/* Daily Totals Card Skeleton */}
      <div className="px-4 pb-4">
        <div className="rounded-xl border border-gray-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-14" />
          </div>
        </div>
      </div>

      {/* Generate Grocery List Button Skeleton */}
      <div className="px-4 pb-4">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 mx-4" />

      {/* Day Selector Pills Skeleton */}
      <div className="py-4">
        <div className="flex space-x-2 px-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-10 w-14 rounded-full" />
          ))}
        </div>
      </div>

      {/* Day Header Skeleton */}
      <div className="px-4 pt-2 pb-4">
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Meal Cards Skeleton */}
      <div className="flex flex-col gap-4 px-4 pb-8">
        {[1, 2, 3, 4].map((i) => (
          <MealCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton for a single meal card
 */
function MealCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden">
      {/* Meal Type */}
      <div className="p-4">
        <Skeleton className="h-5 w-36" />
      </div>

      {/* Image */}
      <Skeleton className="h-[200px] w-full" />

      {/* Info */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-14" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-1">
          <Skeleton className="h-12 flex-1 rounded-lg" />
          <Skeleton className="h-12 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
