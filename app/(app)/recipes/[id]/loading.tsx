import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading skeleton for the recipe detail page
 * Matches the structure: Hero -> Title Card -> Macros -> Tags -> Ingredients -> Instructions -> Nutrition
 */
export default function RecipeDetailLoading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Image Skeleton with Back Button */}
      <div className="relative">
        <Skeleton className="w-full h-[300px]" />
        {/* Back button placeholder */}
        <div className="absolute top-4 left-4">
          <Skeleton className="size-10 rounded-full" />
        </div>
        {/* Favorite button placeholder */}
        <div className="absolute top-4 right-4">
          <Skeleton className="size-10 rounded-full" />
        </div>
      </div>

      <div className="flex flex-col gap-6 -mt-8 relative z-10 px-4 max-w-4xl mx-auto w-full">
        {/* Title & Meta Card */}
        <div className="bg-card rounded-t-2xl pt-6 pb-2 shadow-sm border border-border-strong">
          <div className="px-4 space-y-3">
            <Skeleton className="h-9 w-4/5" />
            <div className="flex items-center gap-2 pb-3 pt-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>

        {/* Macros Card Skeleton */}
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border-strong space-y-4">
          {/* Calories header */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-lg" />
              <Skeleton className="h-6 w-8" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
          </div>
          {/* Macro bars */}
          <div className="space-y-3">
            {['Protein', 'Carbs', 'Fat'].map((macro) => (
              <div key={macro} className="space-y-1">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Tags Skeleton */}
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-full" />
          ))}
        </div>

        {/* Ingredients Section Skeleton */}
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border-strong space-y-4">
          <Skeleton className="h-6 w-28" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-5 rounded" />
                <Skeleton className="h-4 flex-1" style={{ width: `${60 + Math.random() * 30}%` }} />
              </div>
            ))}
          </div>
        </div>

        {/* Instructions Section Skeleton */}
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border-strong space-y-4">
          <Skeleton className="h-6 w-28" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="size-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nutrition Facts Skeleton */}
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border-strong space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-px w-full" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>

        {/* Action Button Skeleton */}
        <div className="pt-2 pb-6">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
