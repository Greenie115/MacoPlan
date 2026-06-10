import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 lg:pb-8">
        {/* Greeting Header Skeleton */}
        <div className="space-y-1 mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>

        {/* Dashboard Grid - Side by side on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Left Column - Macro Target Card Skeleton */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>

              {/* Calories Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
              </div>

              {/* Macro Bars */}
              <div className="space-y-3">
                {['protein', 'carbs', 'fat'].map((macro) => (
                  <div key={macro} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>

              {/* Meals Logged Section */}
              <div className="pt-4 border-t border-border space-y-3">
                <Skeleton className="h-5 w-28" />
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <Skeleton className="size-10 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - CTA and Recent Plans */}
          <div className="space-y-6">
            {/* Generate Plan CTA Skeleton */}
            <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="size-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="size-10 rounded-full" />
              </div>
            </div>

            {/* Recent Plans Section Skeleton */}
            <div>
              <Skeleton className="h-6 w-28 mb-3" />
              <div className="flex gap-4 overflow-hidden">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-[280px] rounded-2xl border border-border bg-card p-4 space-y-3"
                  >
                    {/* Plan Image Grid */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {[1, 2, 3, 4].map((j) => (
                        <Skeleton key={j} className="aspect-square rounded-lg" />
                      ))}
                    </div>
                    {/* Plan Info */}
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

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
