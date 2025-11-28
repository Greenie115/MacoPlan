import { createClient } from '@/lib/supabase/server'
import { TopAppBar } from '@/components/layout/top-app-bar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { RecipeSearch } from '@/components/recipes/recipe-search'
import { RecipeFiltersAdvanced } from '@/components/recipes/recipe-filters-advanced'
import { RecipeTabs } from '@/components/recipes/recipe-tabs'
import { UpgradeBanner } from '@/components/recipes/upgrade-banner'
import { RecipeGrid } from '@/components/recipes/recipe-grid'
import { RecipeDietaryToggle } from '@/components/recipes/recipe-dietary-toggle'
import { getFavoriteRecipeIds } from './actions'
import {
  searchSpoonacularRecipes,
  getUserFavoriteSpoonacularIds,
} from '@/app/actions/spoonacular-recipes'
import { getUserTopKeywords } from '@/app/actions/recipe-tracking'

// Pagination configuration
const RECIPES_PER_PAGE = 20

/**
 * Helper function to search recipes with multiple meal types
 * Makes parallel queries when multiple meal types are selected, then merges and deduplicates
 */
async function searchWithMealTypes(
  baseParams: {
    query?: string
    number?: number
    page?: number
    sort?: 'popularity' | 'healthiness' | 'price' | 'time' | 'random' | 'max-used-ingredients' | 'min-missing-ingredients'
    applyDietaryFilter?: boolean
    cuisines?: string[]
    maxReadyTime?: number
  },
  mealTypes: string[] | undefined
) {
  // If no meal types or only one, make a single query
  if (!mealTypes || mealTypes.length === 0) {
    return await searchSpoonacularRecipes(baseParams)
  }

  if (mealTypes.length === 1) {
    return await searchSpoonacularRecipes({
      ...baseParams,
      type: mealTypes[0],
    })
  }

  // Multiple meal types: make parallel queries
  const results = await Promise.all(
    mealTypes.map((mealType) =>
      searchSpoonacularRecipes({
        ...baseParams,
        type: mealType,
      })
    )
  )

  // Merge all successful results
  const allRecipes: any[] = []
  let totalResults = 0
  let hasError = false
  let errorMessage: string | undefined

  for (const result of results) {
    if (result.success && result.data) {
      allRecipes.push(...(result.data.results || []))
      totalResults += result.data.totalResults || 0
    } else if (result.error) {
      hasError = true
      errorMessage = result.error
    }
  }

  // If all queries failed, return error
  if (hasError && allRecipes.length === 0) {
    return {
      success: false,
      error: errorMessage || 'Failed to fetch recipes',
    }
  }

  // Deduplicate by recipe ID
  const uniqueRecipes = Array.from(
    new Map(allRecipes.map((r) => [r.id, r])).values()
  )

  // Sort by popularity (healthScore is a good proxy for quality)
  const sortedRecipes = uniqueRecipes.sort((a, b) => {
    // Primary: sort by aggregated likes (popularity)
    if (b.aggregateLikes !== a.aggregateLikes) {
      return (b.aggregateLikes || 0) - (a.aggregateLikes || 0)
    }
    // Secondary: health score
    return (b.healthScore || 0) - (a.healthScore || 0)
  })

  return {
    success: true,
    data: {
      results: sortedRecipes,
      totalResults: sortedRecipes.length,
    },
    error: undefined,
  }
}

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
  const dietFilter = params.dietFilter !== 'false' // Default: true (enabled)

  // Advanced filters from URL (support comma-separated values)
  const cuisineFilters = params.cuisine?.split(',').filter(Boolean)
  const cuisineFilter = cuisineFilters && cuisineFilters.length > 0 ? cuisineFilters : undefined

  // For maxTime: take the maximum value from comma-separated list
  const maxTimeFilter = params.maxTime
    ? Math.max(...params.maxTime.split(',').map((t) => parseInt(t, 10)))
    : undefined

  // For type: Parse all meal types for multi-select support
  const mealTypeFilters = params.type?.split(',').filter(Boolean)
  const mealTypeFilter = mealTypeFilters && mealTypeFilters.length > 0 ? mealTypeFilters : undefined

  const supabase = await createClient()

  // Fetch user profile for avatar
  const { data: { user } } = await supabase.auth.getUser()
  let userName = 'User'
  let avatarUrl: string | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name, avatar_url')
      .eq('user_id', user.id)
      .single()

    if (profile) {
      userName = profile.full_name || user.email?.split('@')[0] || 'User'
      avatarUrl = profile.avatar_url
    }
  }

  // Fetch Spoonacular recipes (with dietary filtering if enabled)
  let spoonacularRecipes: any[] = []
  let spoonacularTotalResults = 0
  let spoonacularError = null
  let isAdaptiveRecommendation = false

  if (searchQuery) {
    // User is searching - fetch search results sorted by popularity
    const spoonacularResult = await searchWithMealTypes(
      {
        query: searchQuery,
        page: currentPage,
        applyDietaryFilter: dietFilter,
        sort: 'popularity', // Sort search results by popularity
        cuisines: cuisineFilter,
        maxReadyTime: maxTimeFilter,
      },
      mealTypeFilter
    )

    if (spoonacularResult.success && spoonacularResult.data) {
      spoonacularRecipes = spoonacularResult.data.results || []
      spoonacularTotalResults = spoonacularResult.data.totalResults || 0
    } else {
      spoonacularError = spoonacularResult.error
    }
  } else if (user) {
    // No search query - show adaptive recommendations
    // Get user's top keywords (recipes they've viewed 3+ times)
    const topKeywordsResult = await getUserTopKeywords(2, 3) // Top 2 keywords, min 3 views

    if (topKeywordsResult.success && topKeywordsResult.data && topKeywordsResult.data.length > 0) {
      // User has established preferences - show personalized blend
      isAdaptiveRecommendation = true
      const topKeywords = topKeywordsResult.data

      console.log('[AdaptiveRecipes] User has preferences:', topKeywords)

      // Fetch 60% keyword-based + 40% general top-rated
      const keyword1 = topKeywords[0]?.keyword
      const keyword2 = topKeywords[1]?.keyword

      const [keywordResult1, keywordResult2, generalResult] = await Promise.all([
        // Keyword-based recipe 1 (30% of results)
        keyword1
          ? searchWithMealTypes(
              {
                query: keyword1,
                number: 6,
                sort: 'popularity',
                applyDietaryFilter: dietFilter,
                cuisines: cuisineFilter,
                maxReadyTime: maxTimeFilter,
              },
              mealTypeFilter
            )
          : null,
        // Keyword-based recipe 2 (30% of results)
        keyword2
          ? searchWithMealTypes(
              {
                query: keyword2,
                number: 6,
                sort: 'popularity',
                applyDietaryFilter: dietFilter,
                cuisines: cuisineFilter,
                maxReadyTime: maxTimeFilter,
              },
              mealTypeFilter
            )
          : null,
        // General top-rated (40% of results)
        searchWithMealTypes(
          {
            query: 'high protein',
            number: 8,
            sort: 'popularity',
            applyDietaryFilter: dietFilter,
            cuisines: cuisineFilter,
            maxReadyTime: maxTimeFilter,
          },
          mealTypeFilter
        ),
      ])

      // Combine results
      const keywordRecipes1 = keywordResult1?.data?.results || []
      const keywordRecipes2 = keywordResult2?.data?.results || []
      const generalRecipes = generalResult?.data?.results || []

      // Interleave for variety: general, keyword1, keyword2, general, keyword1...
      spoonacularRecipes = []
      const maxLength = Math.max(
        generalRecipes.length,
        keywordRecipes1.length,
        keywordRecipes2.length
      )

      for (let i = 0; i < maxLength; i++) {
        if (generalRecipes[i]) spoonacularRecipes.push(generalRecipes[i])
        if (keywordRecipes1[i]) spoonacularRecipes.push(keywordRecipes1[i])
        if (keywordRecipes2[i]) spoonacularRecipes.push(keywordRecipes2[i])
      }

      // Remove duplicates by ID
      spoonacularRecipes = Array.from(
        new Map(spoonacularRecipes.map((r: any) => [r.id, r])).values()
      )

      spoonacularTotalResults = spoonacularRecipes.length
    } else {
      // New user or not enough data - show general top-rated recipes
      console.log('[AdaptiveRecipes] New user - showing top-rated high-protein recipes')

      const spoonacularResult = await searchWithMealTypes(
        {
          query: 'high protein',
          number: 20,
          sort: 'popularity',
          applyDietaryFilter: dietFilter,
          cuisines: cuisineFilter,
          maxReadyTime: maxTimeFilter,
        },
        mealTypeFilter
      )

      if (spoonacularResult.success && spoonacularResult.data) {
        spoonacularRecipes = spoonacularResult.data.results || []
        spoonacularTotalResults = spoonacularResult.data.totalResults || 0
      } else {
        spoonacularError = spoonacularResult.error
      }
    }
  } else {
    // Anonymous user - show general top-rated recipes
    const spoonacularResult = await searchWithMealTypes(
      {
        query: 'high protein',
        number: 20,
        sort: 'popularity',
        applyDietaryFilter: false, // No dietary filtering for anonymous
        cuisines: cuisineFilter,
        maxReadyTime: maxTimeFilter,
      },
      mealTypeFilter
    )

    if (spoonacularResult.success && spoonacularResult.data) {
      spoonacularRecipes = spoonacularResult.data.results || []
      spoonacularTotalResults = spoonacularResult.data.totalResults || 0
    } else {
      spoonacularError = spoonacularResult.error
    }
  }

  // Calculate pagination range
  const from = (currentPage - 1) * RECIPES_PER_PAGE
  const to = from + RECIPES_PER_PAGE - 1

  // Build the query with filtering
  let query = supabase
    .from('recipes')
    .select(
      `
      *,
      recipe_tags(tag)
    `,
      { count: 'exact' }
    )

  // Apply text search filter on name and description
  // Escape special SQL LIKE characters (%, _) to prevent SQL injection
  if (searchQuery) {
    const sanitizedQuery = searchQuery.replace(/[%_]/g, '\\$&')
    query = query.or(
      `name.ilike.%${sanitizedQuery}%,description.ilike.%${sanitizedQuery}%`
    )
  }

  // Don't apply tag filters at database level - will be applied client-side
  // This ensures consistent behavior for both single and multiple tag filters
  // TODO: Optimize with PostgreSQL RPC function for large datasets:
  //   CREATE FUNCTION get_recipes_with_all_tags(tag_array text[])
  //   This is acceptable for current dataset size (<100 recipes)

  query = query.order('created_at', { ascending: false })

  let recipes = []
  let count = 0
  let error = null

  try {
    const result = await query
    recipes = result.data || []
    count = result.count || 0
    error = result.error
  } catch (e) {
    console.error('Unexpected error fetching recipes:', e)
  }

  if (error) {
    console.error('Supabase error fetching recipes:', error.message)
    // Don't throw, just let it render empty state
  }

  // Apply tag filters client-side (works for both single and multiple tags with AND logic)
  let filteredRecipes = recipes || []
  if (filterTags.length > 0 && filteredRecipes.length > 0) {
    filteredRecipes = filteredRecipes.filter((recipe: any) => {
      const recipeTags = recipe.recipe_tags?.map((t: any) => t.tag) || []
      return filterTags.every((tag) => recipeTags.includes(tag))
    })
  }

  // Remove duplicate recipes (due to JOIN with recipe_tags)
  let uniqueRecipes = Array.from(
    new Map(filteredRecipes.map((r: any) => [r.id, r])).values()
  )

  // Get user's favorite recipe IDs (both local and Spoonacular)
  const favoriteIds = await getFavoriteRecipeIds()
  const { data: favoriteSpoonacularIds = [] } =
    await getUserFavoriteSpoonacularIds()

  // Always show Spoonacular recipes (adaptive or search)
  let allRecipes: any[] = spoonacularRecipes.map((recipe: any) => ({
    ...recipe,
    source: 'spoonacular',
    id: recipe.id, // Spoonacular ID
  }))

  // Filter by favorites tab if active
  if (activeTab === 'favorites') {
    // Filter Spoonacular recipes by favorited IDs
    allRecipes = allRecipes.filter((recipe: any) =>
      favoriteSpoonacularIds.includes(recipe.id)
    )
  }

  let totalResults = allRecipes.length

  // Calculate pagination info
  const totalPages = Math.ceil(totalResults / RECIPES_PER_PAGE)
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  // Use Spoonacular results directly (already paginated)
  const paginatedRecipes = allRecipes

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top App Bar */}
      <TopAppBar userName={userName} avatarUrl={avatarUrl} />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Recipe Library</h1>
          <p className="text-sm text-gray-500 mt-1">
            {searchQuery
              ? `Search results for "${searchQuery}" (sorted by popularity)`
              : isAdaptiveRecommendation
              ? '✨ Personalized recommendations based on your preferences'
              : '🌟 Top-rated high-protein recipes'}
            {totalResults > 0 && ` · ${totalResults} ${searchQuery ? 'results' : 'recipes'}`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto">
        <RecipeSearch />
      </div>

      {/* Dietary Filter Toggle (show when searching) */}
      {searchQuery && (
        <div className="max-w-7xl mx-auto">
          <RecipeDietaryToggle />
        </div>
      )}

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

      {/* Recipe Grid */}
      <RecipeGrid
        recipes={paginatedRecipes}
        favoriteIds={searchQuery ? favoriteSpoonacularIds : favoriteIds}
      />

      {/* Error Message */}
      {spoonacularError && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              Unable to fetch recipes from Spoonacular. Please try again later.
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
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                hasPrevPage
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
              }`}
            >
              Previous
            </a>
            <span className="text-sm text-gray-600">
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
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                hasNextPage
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
              }`}
            >
              Next
            </a>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab="recipes" />
    </div>
  )
}
