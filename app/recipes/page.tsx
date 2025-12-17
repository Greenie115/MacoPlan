import { BottomNav } from '@/components/layout/bottom-nav'
import { RecipeSearch } from '@/components/recipes/recipe-search'
import { RecipeFiltersAdvanced } from '@/components/recipes/recipe-filters-advanced'
import { RecipeTabs } from '@/components/recipes/recipe-tabs'
import { UpgradeBanner } from '@/components/recipes/upgrade-banner'
import { RecipeResultsClient } from '@/components/recipes/recipe-results-client'
import { getFavoriteRecipeIds } from './actions'
import { searchRecipes } from '@/app/actions/fatsecret-recipes'
import {
  validateRecipeFilters,
  toSearchParams,
  type FatSecretFilterParams,
} from '@/lib/utils/filter-validation'

// Pagination configuration
const RECIPES_PER_PAGE = 20

interface RecipesPageProps {
  searchParams: Promise<{
    search?: string
    page?: string
    tab?: string
    // FatSecret filter params
    recipeTypes?: string
    caloriesFrom?: string
    caloriesTo?: string
    proteinFrom?: string
    proteinTo?: string
    carbsFrom?: string
    carbsTo?: string
    fatFrom?: string
    fatTo?: string
    prepTimeFrom?: string
    prepTimeTo?: string
    mustHaveImages?: string
    sortBy?: string
  }>
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const params = await searchParams
  const searchQuery = params.search?.trim() || ''
  const currentPage = Math.max(1, parseInt(params.page || '1', 10))
  const activeTab = params.tab || 'all'

  // Validate all filter parameters
  const filterParams: FatSecretFilterParams = {
    search: searchQuery,
    recipeTypes: params.recipeTypes,
    caloriesFrom: params.caloriesFrom,
    caloriesTo: params.caloriesTo,
    proteinFrom: params.proteinFrom,
    proteinTo: params.proteinTo,
    carbsFrom: params.carbsFrom,
    carbsTo: params.carbsTo,
    fatFrom: params.fatFrom,
    fatTo: params.fatTo,
    prepTimeFrom: params.prepTimeFrom,
    prepTimeTo: params.prepTimeTo,
    mustHaveImages: params.mustHaveImages,
    sortBy: params.sortBy,
    page: params.page,
  }

  const validatedFilters = validateRecipeFilters(filterParams)
  const searchParams_api = toSearchParams(validatedFilters)

  // Fetch FatSecret recipes
  let fatSecretRecipes: Array<{
    id: string
    title: string
    name: string
    imageUrl?: string
    image_url?: string
    calories: number
    protein: number
    protein_grams: number
    carbs: number
    carb_grams: number
    fat: number
    fat_grams: number
    source: 'fatsecret'
  }> = []
  let fatSecretTotalResults = 0
  let fatSecretError: string | null = null

  // Default search term if none provided
  const defaultSearchTerm = searchQuery || 'high protein healthy'

  const fatSecretResult = await searchRecipes({
    ...searchParams_api,
    search_expression: defaultSearchTerm,
    max_results: RECIPES_PER_PAGE,
    page_number: currentPage - 1,
  })

  if (fatSecretResult.success && fatSecretResult.data) {
    fatSecretRecipes = fatSecretResult.data.recipes.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      name: recipe.title,
      imageUrl: recipe.imageUrl ?? undefined,
      image_url: recipe.imageUrl ?? undefined,
      calories: recipe.calories,
      protein: recipe.protein,
      protein_grams: recipe.protein,
      carbs: recipe.carbs,
      carb_grams: recipe.carbs,
      fat: recipe.fat,
      fat_grams: recipe.fat,
      source: 'fatsecret' as const,
    }))
    fatSecretTotalResults = fatSecretResult.data.totalResults
  } else {
    fatSecretError = fatSecretResult.error || 'Failed to fetch recipes'
  }

  // Get user's favorite recipe IDs
  const favoriteIds = await getFavoriteRecipeIds()

  const allRecipes = fatSecretRecipes
  const totalResults = fatSecretTotalResults

  // Calculate pagination info
  const totalPages = Math.ceil(totalResults / RECIPES_PER_PAGE)
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  // Build pagination URL preserving all current filters
  const buildPaginationUrl = (page: number) => {
    const urlParams = new URLSearchParams()

    // Preserve search
    if (searchQuery) urlParams.set('search', searchQuery)

    // Preserve all filter params
    if (params.recipeTypes) urlParams.set('recipeTypes', params.recipeTypes)
    if (params.caloriesFrom) urlParams.set('caloriesFrom', params.caloriesFrom)
    if (params.caloriesTo) urlParams.set('caloriesTo', params.caloriesTo)
    if (params.proteinFrom) urlParams.set('proteinFrom', params.proteinFrom)
    if (params.proteinTo) urlParams.set('proteinTo', params.proteinTo)
    if (params.carbsFrom) urlParams.set('carbsFrom', params.carbsFrom)
    if (params.carbsTo) urlParams.set('carbsTo', params.carbsTo)
    if (params.fatFrom) urlParams.set('fatFrom', params.fatFrom)
    if (params.fatTo) urlParams.set('fatTo', params.fatTo)
    if (params.prepTimeFrom) urlParams.set('prepTimeFrom', params.prepTimeFrom)
    if (params.prepTimeTo) urlParams.set('prepTimeTo', params.prepTimeTo)
    if (params.mustHaveImages) urlParams.set('mustHaveImages', params.mustHaveImages)
    if (params.sortBy) urlParams.set('sortBy', params.sortBy)

    // Set the new page
    urlParams.set('page', page.toString())

    return `/recipes?${urlParams.toString()}`
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Search */}
      <div className="max-w-7xl mx-auto">
        <RecipeSearch />
      </div>

      {/* Tabs: All / Favorites (hide when searching) */}
      {!searchQuery && (
        <div className="max-w-7xl mx-auto">
          <RecipeTabs />
        </div>
      )}

      {/* Advanced Filters */}
      <RecipeFiltersAdvanced />

      {/* Upgrade Banner */}
      <div className="max-w-7xl mx-auto px-4">
        <UpgradeBanner />
      </div>

      {/* Recipe Grid with Session Cache */}
      <RecipeResultsClient
        initialRecipes={allRecipes}
        totalResults={totalResults}
        favoriteIds={favoriteIds}
        searchQuery={searchQuery}
        isAdaptiveRecommendation={false}
      />

      {/* Error Message */}
      {fatSecretError && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
            <p className="text-sm text-destructive">
              Unable to fetch recipes from FatSecret. Please try again later.
              {fatSecretError.includes('IP') && (
                <span className="block mt-1 text-xs">
                  Note: The FatSecret API requires IP whitelisting. Please check your FatSecret
                  developer account.
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            <a
              href={hasPrevPage ? buildPaginationUrl(currentPage - 1) : '#'}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                hasPrevPage
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed pointer-events-none'
              }`}
            >
              Previous
            </a>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <a
              href={hasNextPage ? buildPaginationUrl(currentPage + 1) : '#'}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                hasNextPage
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed pointer-events-none'
              }`}
            >
              Next
            </a>
          </div>
        </div>
      )}

      {/* FatSecret Attribution - Required by API Terms */}
      <div className="max-w-7xl mx-auto px-4 pb-6 flex justify-center">
        <a href="https://www.fatsecret.com" target="_blank" rel="noopener noreferrer">
          <img
            src="https://platform.fatsecret.com/api/static/images/powered_by_fatsecret.svg"
            alt="Powered by fatsecret"
            className="h-5 opacity-50 hover:opacity-100 transition-opacity"
          />
        </a>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="recipes" />
    </div>
  )
}
