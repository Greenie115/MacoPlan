import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="p-8 space-y-6">
      {/* Header skeleton */}
      <Skeleton className="h-12 w-1/3" />

      {/* Macro cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>

      {/* Content skeleton */}
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
