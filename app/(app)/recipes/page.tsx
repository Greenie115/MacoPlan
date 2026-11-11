import { Suspense } from 'react'
import { RecipeFilters } from '@/components/recipes/recipe-filters'
import { RecipeGridSkeleton } from '@/components/recipes/recipe-grid-skeleton'
import type { RecipeFilterParams } from '@/lib/utils/filter-validation'
import { RecipeResults } from './_components/recipe-results'
import { UpgradeBannerSection } from './_components/upgrade-banner-section'

export default async function RecipesPage({ searchParams }: { searchParams: Promise<RecipeFilterParams> }) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-background pb-20">
      <Suspense fallback={null}>
        <RecipeFilters />
      </Suspense>

      {/* Streams independently, stable across searches */}
      <Suspense fallback={null}>
        <UpgradeBannerSection />
      </Suspense>

      {/* Keyed by the full query so a change swaps only the results */}
      <Suspense key={JSON.stringify(params)} fallback={<RecipeGridSkeleton />}>
        <RecipeResults params={params} />
      </Suspense>
    </div>
  )
}
