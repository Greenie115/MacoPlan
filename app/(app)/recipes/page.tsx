import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { RecipeSearch } from '@/components/recipes/recipe-search'
import { RecipeFiltersAdvanced } from '@/components/recipes/recipe-filters-advanced'
import { RecipeTabs } from '@/components/recipes/recipe-tabs'
import { RecipeGridSkeleton } from '@/components/recipes/recipe-grid-skeleton'
import { RecipeResults, type RecipesSearchParams } from './_components/recipe-results'
import { UpgradeBannerSection } from './_components/upgrade-banner-section'

interface RecipesPageProps {
  searchParams: Promise<RecipesSearchParams>
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const params = await searchParams
  const searchQuery = params.search?.trim() || ''
  const activeTab = params.tab || 'popular'

  // Check if any filters are applied (for auto-switching from popular tab)
  const hasFilters =
    searchQuery ||
    params.recipeTypes ||
    params.caloriesFrom ||
    params.caloriesTo ||
    params.proteinFrom ||
    params.proteinTo ||
    params.carbsFrom ||
    params.carbsTo ||
    params.fatFrom ||
    params.fatTo ||
    params.prepTimeFrom ||
    params.prepTimeTo ||
    params.mustHaveImages ||
    params.sortBy

  // Auto-switch to "all" tab when filters are applied on popular tab
  if (activeTab === 'popular' && hasFilters) {
    const redirectParams = new URLSearchParams()
    redirectParams.set('tab', 'all')
    if (searchQuery) redirectParams.set('search', searchQuery)
    if (params.recipeTypes) redirectParams.set('recipeTypes', params.recipeTypes)
    if (params.caloriesFrom) redirectParams.set('caloriesFrom', params.caloriesFrom)
    if (params.caloriesTo) redirectParams.set('caloriesTo', params.caloriesTo)
    if (params.proteinFrom) redirectParams.set('proteinFrom', params.proteinFrom)
    if (params.proteinTo) redirectParams.set('proteinTo', params.proteinTo)
    if (params.carbsFrom) redirectParams.set('carbsFrom', params.carbsFrom)
    if (params.carbsTo) redirectParams.set('carbsTo', params.carbsTo)
    if (params.fatFrom) redirectParams.set('fatFrom', params.fatFrom)
    if (params.fatTo) redirectParams.set('fatTo', params.fatTo)
    if (params.prepTimeFrom) redirectParams.set('prepTimeFrom', params.prepTimeFrom)
    if (params.prepTimeTo) redirectParams.set('prepTimeTo', params.prepTimeTo)
    if (params.mustHaveImages) redirectParams.set('mustHaveImages', params.mustHaveImages)
    if (params.sortBy) redirectParams.set('sortBy', params.sortBy)
    if (params.page) redirectParams.set('page', params.page)
    redirect(`/recipes?${redirectParams.toString()}`)
  }

  // Key the results boundary by the full query so a new search/tab/filter
  // swaps only the results subtree (showing its skeleton) while the search
  // bar, tabs, and filters above stay mounted and keep focus.
  const resultsKey = JSON.stringify(params)

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Search */}
      <div className="max-w-7xl mx-auto">
        <RecipeSearch />
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto">
        <RecipeTabs />
      </div>

      {/* Advanced Filters */}
      <RecipeFiltersAdvanced />

      {/* Upgrade Banner — streams independently, stable across searches */}
      <Suspense fallback={null}>
        <UpgradeBannerSection />
      </Suspense>

      {/* Results */}
      <Suspense key={resultsKey} fallback={<RecipeGridSkeleton />}>
        <RecipeResults params={params} />
      </Suspense>
    </div>
  )
}
