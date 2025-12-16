import { BottomNav } from '@/components/layout/bottom-nav'
import { RecipeSearch } from '@/components/recipes/recipe-search'
import { RecipeFiltersAdvanced } from '@/components/recipes/recipe-filters-advanced'
import { RecipeTabs } from '@/components/recipes/recipe-tabs'
import { UpgradeBanner } from '@/components/recipes/upgrade-banner'
import { RecipeResultsClient } from '@/components/recipes/recipe-results-client'
import { getFavoriteRecipeIds } from './actions'
import { searchRecipes } from '@/app/actions/fatsecret-recipes'
import { validateRecipeFilters } from '@/lib/utils/filter-validation'

// Pagination configuration
const RECIPES_PER_PAGE = 20

interface RecipesPageProps {
  searchParams: Promise<{
    search?: string
    filters?: string
    page?: string
    tab?: string
    dietFilter?: string
    cuisine?: string
    maxTime?: string
    type?: string // Meal type filter
  }>
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const params = await searchParams
  const searchQuery = params.search?.trim() || ''
  const filterTags = params.filters?.split(',').filter(Boolean) || []
  const currentPage = Math.max(1, parseInt(params.page || '1', 10))
  const activeTab = params.tab || 'all'

  // Validate filter parameters
  const validatedFilters = validateRecipeFilters({
    cuisine: params.cuisine,
    maxTime: params.maxTime,
    type: params.type,
  })

  const mealTypeFilter = validatedFilters.mealTypes?.[0] || undefined

  // Fetch FatSecret recipes
  let fatSecretRecipes: any[] = []
  let fatSecretTotalResults = 0
  let fatSecretError: string | null = null

  // Map meal type to FatSecret recipe type
  const recipeTypeMap: Record<string, string> = {
    'main-course': 'Main Dish',
    'side-dish': 'Side Dish',
    'dessert': 'Dessert',
    'appetizer': 'Appetizer',
    'salad': 'Salad',
    'bread': 'Bread',
    'breakfast': 'Breakfast',
    'soup': 'Soup',
    'beverage': 'Beverage',
    'sauce': 'Sauce',
    'marinade': 'Marinade',
    'fingerfood': 'Snack',
    'snack': 'Snack',
    'drink': 'Beverage',
  }

  const fatSecretRecipeType = mealTypeFilter
    ? recipeTypeMap[mealTypeFilter] || undefined
    : undefined

  // Search FatSecret
  const defaultSearchTerm = searchQuery || 'high protein healthy'

  const fatSecretResult = await searchRecipes({
    search_expression: defaultSearchTerm,
    recipe_type: fatSecretRecipeType as any,
    max_results: RECIPES_PER_PAGE,
    page_number: currentPage - 1,
  })

  if (fatSecretResult.success && fatSecretResult.data) {
    fatSecretRecipes = fatSecretResult.data.recipes.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      name: recipe.title,
      imageUrl: recipe.imageUrl,
      image_url: recipe.imageUrl,
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

      {/* Advanced Filters: Cuisine, Prep Time, Meal Type */}
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
                  Note: The FatSecret API requires IP whitelisting. Please check your FatSecret developer account.
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
              href={
                hasPrevPage
                  ? `/recipes?${new URLSearchParams({
                      ...(searchQuery && { search: searchQuery }),
                      ...(filterTags.length > 0 && {
                        filters: filterTags.join(','),
                      }),
                      page: (currentPage - 1).toString(),
                    }).toString()}`
                  : '#'
              }
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
              href={
                hasNextPage
                  ? `/recipes?${new URLSearchParams({
                      ...(searchQuery && { search: searchQuery }),
                      ...(filterTags.length > 0 && {
                        filters: filterTags.join(','),
                      }),
                      page: (currentPage + 1).toString(),
                    }).toString()}`
                  : '#'
              }
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

      {/* FatSecret Attribution - Required by API Terms (visible without login) */}
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
