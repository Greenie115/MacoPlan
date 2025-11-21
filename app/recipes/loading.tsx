export default function RecipesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
      </div>

      {/* Search Skeleton */}
      <div className="px-4 py-2">
        <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex gap-2 p-4 pt-2 overflow-x-auto">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-12 w-32 bg-gray-200 rounded-xl animate-pulse shrink-0"
          />
        ))}
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4 px-4 pb-28">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4"
          >
            <div className="aspect-square w-full rounded-xl bg-gray-200 animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="flex gap-3">
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
