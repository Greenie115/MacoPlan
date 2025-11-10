import { Skeleton } from '@/components/ui/skeleton'

export default function OnboardingLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Progress indicator skeleton */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="size-3 rounded-full" />
          ))}
        </div>

        {/* Title skeleton */}
        <Skeleton className="h-8 w-3/4 mx-auto" />

        {/* Subtitle skeleton */}
        <Skeleton className="h-4 w-1/2 mx-auto" />

        {/* Content skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>

        {/* Button skeleton */}
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}
