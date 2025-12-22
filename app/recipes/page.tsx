import { BottomNav } from '@/components/layout/bottom-nav'
import { RecipeSearch } from '@/components/recipes/recipe-search'
import { RecipeFiltersAdvanced } from '@/components/recipes/recipe-filters-advanced'
import { RecipeTabs } from '@/components/recipes/recipe-tabs'
import { UpgradeBanner } from '@/components/recipes/upgrade-banner'
import { RecipeResultsClient } from '@/components/recipes/recipe-results-client'
import { getFavoriteRecipeIds, getFavoriteRecipes, getMostFavoritedRecipes, getCachedRecipes } from './actions'
import { redirect } from 'next/navigation'
import { searchRecipes } from '@/app/actions/fatsecret-recipes'
import { getSubscriptionStatus } from '@/app/actions/subscription'
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

  // Fetch recipes based on active tab
  let recipes: Array<{
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
  let totalResults = 0
  let fatSecretError: string | null = null

  // Get user's favorite recipe IDs and subscription status
  const [favoriteIds, subscriptionStatus] = await Promise.all([
    getFavoriteRecipeIds(),
    getSubscriptionStatus(),
  ])

  const isPremium = subscriptionStatus?.isPremium ?? false

  if (activeTab === 'popular') {
    // Fetch most favorited recipes across all users
    const popularResult = await getMostFavoritedRecipes(currentPage, RECIPES_PER_PAGE)

    // Start with popular recipes
    let popularRecipes = popularResult.data.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      name: recipe.title,
      imageUrl: recipe.imageUrl ?? undefined,
      image_url: recipe.imageUrl ?? undefined,
      calories: recipe.calories ?? 0,
      protein: recipe.protein ?? 0,
      protein_grams: recipe.protein ?? 0,
      carbs: recipe.carbs ?? 0,
      carb_grams: recipe.carbs ?? 0,
      fat: recipe.fat ?? 0,
      fat_grams: recipe.fat ?? 0,
      source: 'fatsecret' as const,
    }))

    // If fewer than 20 popular recipes, supplement with FatSecret API
    if (popularRecipes.length < RECIPES_PER_PAGE) {
      const needed = RECIPES_PER_PAGE - popularRecipes.length
      const supplementResult = await searchRecipes({
        search_expression: 'healthy',
        max_results: needed + 10, // Fetch extra in case of duplicates
        page_number: 0,
      })

      if (supplementResult.success && supplementResult.data) {
        // Deduplicate by recipe ID
        const existingIds = new Set(popularRecipes.map((r) => r.id))
        const supplementRecipes = supplementResult.data.recipes
          .filter((r) => !existingIds.has(r.id))
          .slice(0, needed)
          .map((recipe) => ({
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

        popularRecipes = [...popularRecipes, ...supplementRecipes]
      }
    }

    recipes = popularRecipes.slice(0, RECIPES_PER_PAGE)
    // For popular tab, show total of popular recipes or 100 if blended with API
    totalResults = popularResult.totalCount > 0 ? popularResult.totalCount : 100
  } else if (activeTab === 'favorites') {
    // Fetch only favorite recipes
    const favoritesResult = await getFavoriteRecipes()

    if (favoritesResult.error) {
      fatSecretError = favoritesResult.error
    } else {
      // Map all favorites to recipe format
      const allFavorites = favoritesResult.data.map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        name: recipe.title,
        imageUrl: recipe.imageUrl ?? undefined,
        image_url: recipe.imageUrl ?? undefined,
        calories: recipe.calories ?? 0,
        protein: recipe.protein ?? 0,
        protein_grams: recipe.protein ?? 0,
        carbs: recipe.carbs ?? 0,
        carb_grams: recipe.carbs ?? 0,
        fat: recipe.fat ?? 0,
        fat_grams: recipe.fat ?? 0,
        source: 'fatsecret' as const,
      }))

      // Apply pagination to favorites
      const startIndex = (currentPage - 1) * RECIPES_PER_PAGE
      const endIndex = startIndex + RECIPES_PER_PAGE
      recipes = allFavorites.slice(startIndex, endIndex)
      totalResults = allFavorites.length
    }
  } else {
    // "All Recipes" tab - use cached recipes when no search, FatSecret API when searching
    if (!searchQuery) {
      // No search query - fetch from local cached recipes
      const cachedResult = await getCachedRecipes(currentPage, RECIPES_PER_PAGE)

      if (cachedResult.error) {
        fatSecretError = cachedResult.error
      } else {
        recipes = cachedResult.data.map((recipe) => ({
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
        totalResults = cachedResult.totalCount
      }
    } else {
      // Has search query - use FatSecret API
      // When image filter is active, fetch more to compensate for client-side filtering
      // FatSecret API max is 50 results per request
      const needsImageFilter = validatedFilters.must_have_images === true
      const maxResultsToFetch = needsImageFilter ? 50 : RECIPES_PER_PAGE

      const fatSecretResult = await searchRecipes({
        ...searchParams_api,
        search_expression: searchQuery,
        max_results: maxResultsToFetch,
        page_number: currentPage - 1,
      })

      if (fatSecretResult.success && fatSecretResult.data) {
        let mappedRecipes = fatSecretResult.data.recipes.map((recipe) => ({
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

        // Apply client-side image filter as fallback (API/cache may not filter reliably)
        if (needsImageFilter) {
          mappedRecipes = mappedRecipes.filter((recipe) => recipe.imageUrl)
        }

        // Ensure consistent page size after filtering
        recipes = mappedRecipes.slice(0, RECIPES_PER_PAGE)

        // Adjust total results estimate for image filter
        // (rough estimate: assume same ratio of images across all results)
        if (needsImageFilter && fatSecretResult.data.recipes.length > 0) {
          const imageRatio = mappedRecipes.length / fatSecretResult.data.recipes.length
          totalResults = Math.floor(fatSecretResult.data.totalResults * imageRatio)
        } else {
          totalResults = fatSecretResult.data.totalResults
        }
      } else {
        fatSecretError = fatSecretResult.error || 'Failed to fetch recipes'
      }
    }
  }

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

    // Preserve tab selection
    if (params.tab) urlParams.set('tab', params.tab)

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

      {/* Tabs: All / Favorites */}
      <div className="max-w-7xl mx-auto">
        <RecipeTabs />
      </div>

      {/* Advanced Filters */}
      <RecipeFiltersAdvanced />

      {/* Upgrade Banner */}
      <div className="max-w-7xl mx-auto px-4">
        <UpgradeBanner
          isPremium={isPremium}
          favoritesUsed={subscriptionStatus?.favoritesQuota.used ?? 0}
          favoritesLimit={subscriptionStatus?.favoritesQuota.limit ?? 10}
          mealPlansUsed={subscriptionStatus ? subscriptionStatus.quota.total - subscriptionStatus.quota.remaining : 0}
          mealPlansLimit={subscriptionStatus?.quota.total ?? 3}
        />
      </div>

      {/* Recipe Grid with Session Cache */}
      <RecipeResultsClient
        key={`${activeTab}-${currentPage}-${searchQuery}`}
        initialRecipes={recipes}
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
