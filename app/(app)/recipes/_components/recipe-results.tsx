import { RecipeResultsClient } from '@/components/recipes/recipe-results-client'
import { RecipeInfiniteScroll } from '@/components/recipes/recipe-infinite-scroll'
import { getFavoriteRecipeIds, getFavoriteRecipes, getMostFavoritedRecipes, getCachedRecipes, searchLibraryRecipes } from '@/app/actions/recipes'
import {
  validateRecipeFilters,
  hasActiveFilters,
  type RecipeAPIFilterParams,
} from '@/lib/utils/filter-validation'

const RECIPES_PER_PAGE = 20

export interface RecipesSearchParams {
  search?: string
  page?: string
  tab?: string
  // Recipe-API filter params
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
}

/**
 * Async server component that fetches and renders the recipe results for the
 * current tab/search/filters. Lives inside a keyed <Suspense> boundary so a
 * new search only swaps this subtree — the search bar, tabs, and filters
 * above it stay mounted.
 */
export async function RecipeResults({ params }: { params: RecipesSearchParams }) {
  const searchQuery = params.search?.trim() || ''
  const currentPage = Math.max(1, parseInt(params.page || '1', 10))
  const activeTab = params.tab || 'popular'

  // Validate all filter parameters
  const filterParams: RecipeAPIFilterParams = {
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
    source: 'recipe-api'
  }> = []
  let totalResults = 0
  let recipeApiError: string | null = null
  // Active filters must go through the Recipe-API search path — the cached
  // browse path can't filter. Infinite scroll only serves the unfiltered,
  // no-search "All Recipes" view.
  const filtersActive = hasActiveFilters(validatedFilters)
  const useInfiniteScroll =
    activeTab !== 'popular' && activeTab !== 'favorites' && !searchQuery && !filtersActive

  const favoriteIds = await getFavoriteRecipeIds()

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
      source: 'recipe-api' as const,
    }))

    // If fewer than 20 popular recipes, supplement from the library
    // (quality-first browse order) so the popular tab is never sparse.
    if (popularRecipes.length < RECIPES_PER_PAGE) {
      const needed = RECIPES_PER_PAGE - popularRecipes.length
      const supplement = await getCachedRecipes(1, needed + 10)

      const existingIds = new Set(popularRecipes.map((r) => r.id))
      const supplementRecipes = supplement.data
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
          source: 'recipe-api' as const,
        }))

      popularRecipes = [...popularRecipes, ...supplementRecipes]
    }

    recipes = popularRecipes.slice(0, RECIPES_PER_PAGE)
    // For popular tab, show total of popular recipes or 100 if blended with API
    totalResults = popularResult.totalCount > 0 ? popularResult.totalCount : 100
  } else if (activeTab === 'favorites') {
    // Fetch only favorite recipes
    const favoritesResult = await getFavoriteRecipes()

    if (favoritesResult.error) {
      recipeApiError = favoritesResult.error
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
        source: 'recipe-api' as const,
      }))

      // Apply pagination to favorites
      const startIndex = (currentPage - 1) * RECIPES_PER_PAGE
      const endIndex = startIndex + RECIPES_PER_PAGE
      recipes = allFavorites.slice(startIndex, endIndex)
      totalResults = allFavorites.length
    }
  } else {
    // "All Recipes" tab — cached recipes for plain browsing, Recipe-API when
    // searching or when any filter is active (the API filters server-side)
    if (!searchQuery && !filtersActive) {
      // No search query - fetch from local cached recipes
      const cachedResult = await getCachedRecipes(currentPage, RECIPES_PER_PAGE)

      if (cachedResult.error) {
        recipeApiError = cachedResult.error
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
          source: 'recipe-api' as const,
        }))
        totalResults = cachedResult.totalCount
      }
    } else {
      // Search query and/or active filters - query the self-hosted library
      const libraryResult = await searchLibraryRecipes(validatedFilters, currentPage, RECIPES_PER_PAGE)

      if (libraryResult.error) {
        recipeApiError = libraryResult.error
      } else {
        recipes = libraryResult.recipes.map((recipe) => ({
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
          source: 'recipe-api' as const,
        }))
        totalResults = libraryResult.totalResults
      }
    }
  }

  // Pagination (for non-infinite-scroll tabs)
  const totalPages = Math.ceil(totalResults / RECIPES_PER_PAGE)
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  const buildPaginationUrl = (page: number) => {
    const urlParams = new URLSearchParams()
    if (searchQuery) urlParams.set('search', searchQuery)
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
    if (params.tab) urlParams.set('tab', params.tab)
    urlParams.set('page', page.toString())
    return `/recipes?${urlParams.toString()}`
  }

  if (recipeApiError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
          <p className="text-sm text-destructive">
            Unable to fetch recipes. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  if (useInfiniteScroll) {
    return (
      <RecipeInfiniteScroll
        key="all-recipes-infinite"
        initialRecipes={recipes}
        totalCount={totalResults}
        favoriteIds={favoriteIds}
      />
    )
  }

  return (
    <>
      {/* Paginated grid */}
      <RecipeResultsClient
        key={`${activeTab}-${currentPage}-${searchQuery}`}
        initialRecipes={recipes}
        totalResults={totalResults}
        favoriteIds={favoriteIds}
        searchQuery={searchQuery}
        isAdaptiveRecommendation={false}
      />

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
    </>
  )
}
