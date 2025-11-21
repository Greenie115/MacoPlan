export default function RecipeDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Skeleton */}
      <div className="relative w-full h-[300px] bg-gray-200 animate-pulse" />

      {/* Title Section Skeleton */}
      <div className="px-4 py-6 bg-white">
        <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse mt-3" />
        <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse mt-2" />
        <div className="flex gap-4 mt-4">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Macros Card Skeleton */}
      <div className="px-4 py-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="h-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-12 bg-gray-200 rounded animate-pulse mt-6" />
          <div className="space-y-4 mt-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="px-4 space-y-4">
        <div className="h-64 bg-white rounded-2xl animate-pulse" />
        <div className="h-64 bg-white rounded-2xl animate-pulse" />
      </div>
    </div>
  )
}
